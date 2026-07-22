package com.itsme.sharing

import com.itsme.common.ApiException
import com.itsme.profile.Category
import com.itsme.identity.IdentityService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.security.SecureRandom
import java.util.Base64

@Service
class PublicProfileQueryService(
    private val jdbc: NamedParameterJdbcTemplate,
    private val clock: Clock,
    @param:Value("\${itsme.preview-ttl:10m}") private val previewTtl: Duration,
) {
    private data class PublicOwner(val id: UUID, val displayName: String, val intro: String?)
    private val secureRandom = SecureRandom()

    @Transactional(readOnly = true)
    fun bySlug(slug: String): PublicProfileResponse {
        val owner = jdbc.query(
            "select id, display_name, intro from app_users where slug = :slug and revoked_at is null",
            mapOf("slug" to slug),
        ) { rs, _ -> PublicOwner(rs.getObject("id", UUID::class.java), rs.getString("display_name"), rs.getString("intro")) }
            .singleOrNull()
            ?: throw ApiException(HttpStatus.NOT_FOUND, "PUBLIC_PROFILE_NOT_FOUND", "공개 프로필을 찾지 못했어요.")
        return project(owner, ACTUAL_PUBLIC_RECORDS_SQL, mapOf("userId" to owner.id))
    }

    @Transactional
    fun preview(userId: UUID, request: PublicProfilePreviewRequest): PublicProfilePreviewResponse {
        val owner = jdbc.query(
            "select id, display_name, intro from app_users where id = :userId",
            mapOf("userId" to userId),
        ) { rs, _ -> PublicOwner(rs.getObject("id", UUID::class.java), rs.getString("display_name"), rs.getString("intro")) }
            .singleOrNull()
            ?: throw ApiException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "프로필을 찾지 못했어요.")
        val ownsCandidate = jdbc.queryForObject(
            "select count(*) from profile_records where id = :recordId and user_id = :userId",
            mapOf("recordId" to request.recordId, "userId" to userId),
            Int::class.java,
        ) == 1
        if (!ownsCandidate) throw ApiException(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND", "기록을 찾지 못했어요.")

        // 후보 공개 범위를 CASE로만 투영하고 DB를 변경하지 않는다. SELECT 목록에는 내부 record ID가 아예 없다.
        val profile = project(
            owner,
            PREVIEW_PUBLIC_RECORDS_SQL,
            mapOf("userId" to userId, "recordId" to request.recordId, "visibility" to request.visibility.name),
        )
        val currentVersionId = jdbc.queryForObject(
            "select id from record_versions where record_id = :recordId order by version_number desc limit 1",
            mapOf("recordId" to request.recordId),
            UUID::class.java,
        ) ?: throw ApiException(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND", "기록을 찾지 못했어요.")
        val token = Base64.getUrlEncoder().withoutPadding().encodeToString(ByteArray(32).also(secureRandom::nextBytes))
        val now = Instant.now(clock)
        val expiresAt = now.plus(previewTtl)
        jdbc.update(
            """insert into publication_preview_tokens
               (id, user_id, record_id, version_id, candidate_visibility, token_hash, expires_at, created_at)
               values (:id, :userId, :recordId, :versionId, :visibility, :tokenHash, :expiresAt, :now)""",
            mapOf(
                "id" to UUID.randomUUID(), "userId" to userId, "recordId" to request.recordId,
                "versionId" to currentVersionId, "visibility" to request.visibility.name,
                "tokenHash" to IdentityService.hashToken(token), "expiresAt" to expiresAt, "now" to now,
            ),
        )
        return PublicProfilePreviewResponse(token, expiresAt, profile)
    }

    private fun project(owner: PublicOwner, sql: String, parameters: Map<String, Any>): PublicProfileResponse {
        val records = jdbc.query(sql, MapSqlParameterSource(parameters)) { rs, _ ->
            PublicRecordResponse(
                Category.valueOf(rs.getString("category")),
                rs.getString("title"),
                rs.getString("answer"),
            )
        }
        return PublicProfileResponse(owner.displayName, owner.intro, records)
    }

    companion object {
        private const val LATEST_VERSION =
            "v.version_number = (select max(v2.version_number) from record_versions v2 where v2.record_id = r.id)"

        private val ACTUAL_PUBLIC_RECORDS_SQL =
            """select r.category, r.title, v.answer
               from profile_records r join record_versions v on v.record_id = r.id
               where r.user_id = :userId and r.visibility = 'public' and $LATEST_VERSION
               order by r.created_at, r.id"""

        private val PREVIEW_PUBLIC_RECORDS_SQL =
            """select r.category, r.title, v.answer
               from profile_records r join record_versions v on v.record_id = r.id
               where r.user_id = :userId
                 and case when r.id = :recordId then :visibility else r.visibility end = 'public'
                 and $LATEST_VERSION
               order by r.created_at, r.id"""
    }
}
