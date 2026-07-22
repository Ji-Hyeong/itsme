package com.itsme.identity

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Component
class SessionAuthenticationFilter(
    private val jdbc: JdbcClient,
    private val clock: Clock,
    @param:Value("\${itsme.session-ttl:7d}") private val sessionTtl: Duration,
) : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        val header = request.getHeader("Authorization")
        val token = header?.takeIf { it.startsWith("Bearer ", ignoreCase = true) }?.substring(7)?.trim()
        if (!token.isNullOrEmpty()) {
            val now = Instant.now(clock)
            val tokenHash = IdentityService.hashToken(token)
            val userId = jdbc.sql(
                """select s.user_id from user_sessions s join app_users u on u.id = s.user_id
                   where s.token_hash = :hash and s.revoked_at is null and s.expires_at > :now
                     and u.revoked_at is null""",
            ).param("hash", tokenHash).param("now", now)
                .query(UUID::class.java).optional().orElse(null)
            if (userId != null) {
                // 만료 시점을 사용 시점마다 미뤄 7일 비활동 정책을 구현한다. 원문 토큰은 저장하거나 로그에 남기지 않는다.
                jdbc.sql("update user_sessions set last_used_at = :now, expires_at = :expiresAt where token_hash = :hash and revoked_at is null")
                    .param("now", now).param("expiresAt", now.plus(sessionTtl))
                    .param("hash", tokenHash).update()
                SecurityContextHolder.getContext().authentication =
                    UsernamePasswordAuthenticationToken.authenticated(userId, token, emptyList())
            }
        }
        chain.doFilter(request, response)
    }
}

fun org.springframework.security.core.Authentication.userId(): UUID = principal as UUID
fun org.springframework.security.core.Authentication.rawToken(): String = credentials as String
