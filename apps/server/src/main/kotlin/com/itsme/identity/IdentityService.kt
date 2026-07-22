package com.itsme.identity

import com.itsme.common.ApiException
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.Base64
import java.util.UUID

@Service
class IdentityService(
    private val jdbc: JdbcClient,
    private val passwordEncoder: PasswordEncoder,
    private val loginRateLimiter: LoginRateLimiter,
    @param:Value("\${itsme.session-ttl:7d}") private val sessionTtl: Duration,
    private val clock: Clock = Clock.systemUTC(),
) {
    private val secureRandom = SecureRandom()

    @Transactional
    fun provisionInvite(email: String, password: String, displayName: String, slug: String) {
        require(password.length in 10..72) { "Bootstrap password must be between 10 and 72 characters" }
        require(slug.matches(Regex("^[a-z0-9][a-z0-9-]{2,47}$"))) { "Bootstrap slug has an invalid format" }
        val normalizedEmail = email.trim().lowercase()
        if (jdbc.sql("select count(*) from app_users where email = :email").param("email", normalizedEmail).query(Int::class.java).single() > 0) return
        val now = Instant.now(clock)
        val id = UUID.randomUUID()
        jdbc.sql(
            """insert into app_users(id, email, password_hash, display_name, slug, created_at, updated_at)
               values (:id, :email, :passwordHash, :displayName, :slug, :now, :now)""",
        ).params(
            mapOf(
                "id" to id,
                "email" to normalizedEmail,
                "passwordHash" to passwordEncoder.encode(password),
                "displayName" to displayName.trim(),
                "slug" to slug,
                "now" to now,
            ),
        ).update()
    }

    @Transactional(readOnly = true)
    fun currentUser(userId: UUID): AuthUser = jdbc.sql("select id, email, display_name, slug from app_users where id = :id and revoked_at is null")
        .param("id", userId)
        .query { rs, _ -> AuthUser(rs.getObject("id", UUID::class.java), rs.getString("email"), rs.getString("display_name"), rs.getString("slug")) }
        .optional().orElseThrow { ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "로그인이 필요해요.") }

    @Transactional
    fun login(request: LoginRequest, remoteAddress: String): SessionResponse {
        loginRateLimiter.check(request.email, remoteAddress)
        data class LoginRow(val id: UUID, val email: String, val passwordHash: String, val displayName: String, val slug: String)
        val user = jdbc.sql("select id, email, password_hash, display_name, slug from app_users where email = :email and revoked_at is null")
            .param("email", request.email.trim().lowercase())
            .query { rs, _ -> LoginRow(rs.getObject("id", UUID::class.java), rs.getString("email"), rs.getString("password_hash"), rs.getString("display_name"), rs.getString("slug")) }
            .optional().orElse(null)

        // 존재하지 않는 계정도 BCrypt 작업을 수행해 이메일 존재 여부를 응답 시간으로 추측하기 어렵게 한다.
        val passwordHash = user?.passwordHash ?: DUMMY_PASSWORD_HASH
        if (!passwordEncoder.matches(request.password, passwordHash) || user == null) {
            loginRateLimiter.recordFailure(request.email, remoteAddress)
            throw ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "이메일 또는 비밀번호를 확인해 주세요.")
        }
        loginRateLimiter.clear(request.email, remoteAddress)
        return createSession(AuthUser(user.id, user.email, user.displayName, user.slug), Instant.now(clock))
    }

    @Transactional
    fun logout(rawToken: String) {
        jdbc.sql("update user_sessions set revoked_at = :now where token_hash = :hash and revoked_at is null")
            .param("now", Instant.now(clock)).param("hash", hashToken(rawToken)).update()
    }

    @Transactional
    fun revokeAccount(userId: UUID) {
        val now = Instant.now(clock)
        val affected = jdbc.sql("update app_users set revoked_at = :now, updated_at = :now where id = :id and revoked_at is null")
            .param("now", now).param("id", userId).update()
        if (affected == 0) throw ApiException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "프로필을 찾지 못했어요.")
        // 회수 표식과 모든 세션 폐기를 한 트랜잭션에 묶어 기존 기기가 다시 접근할 틈을 남기지 않는다.
        jdbc.sql("delete from user_sessions where user_id = :userId").param("userId", userId).update()
    }

    private fun createSession(user: AuthUser, now: Instant): SessionResponse {
        val rawTokenBytes = ByteArray(32).also(secureRandom::nextBytes)
        val token = Base64.getUrlEncoder().withoutPadding().encodeToString(rawTokenBytes)
        val expiresAt = now.plus(sessionTtl)
        jdbc.sql("insert into user_sessions(id, user_id, token_hash, expires_at, last_used_at, created_at) values (:id, :userId, :hash, :expiresAt, :now, :now)")
            .params(mapOf("id" to UUID.randomUUID(), "userId" to user.id, "hash" to hashToken(token), "expiresAt" to expiresAt, "now" to now))
            .update()
        return SessionResponse(token, expiresAt, user)
    }

    companion object {
        // 이 값은 실제 계정과 무관한 고정 BCrypt 해시이며 로그인 실패 경로의 타이밍 평준화에만 사용한다.
        private const val DUMMY_PASSWORD_HASH = "\$2a\$12\$X3JxE4vYxgnfT0NZ3iCOzuOPqSIjTA8hpFGO0/OVZ78pJRb1yqljK"

        fun hashToken(token: String): String = MessageDigest.getInstance("SHA-256")
            .digest(token.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) }
    }
}
