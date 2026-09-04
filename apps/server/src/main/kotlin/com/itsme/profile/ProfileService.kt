package com.itsme.profile

import com.itsme.common.ApiException
import com.itsme.common.asJdbcTimestamp
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class ProfileService(private val jdbc: JdbcClient) {
    private data class UserRow(val id: UUID, val displayName: String, val intro: String?, val slug: String)
    private data class RecordRow(
        val id: UUID,
        val questionId: String,
        val category: Category,
        val title: String,
        val visibility: Visibility,
    )

    @Transactional(readOnly = true)
    fun ownerProfile(userId: UUID): OwnerProfileResponse {
        val user = jdbc.sql("select id, display_name, intro, slug from app_users where id = :id")
            .param("id", userId)
            .query { rs, _ -> UserRow(rs.getObject("id", UUID::class.java), rs.getString("display_name"), rs.getString("intro"), rs.getString("slug")) }
            .optional().orElseThrow { ApiException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "프로필을 찾지 못했어요.") }
        val records = jdbc.sql(
            """select id, question_id, category, title, visibility from profile_records
               where user_id = :userId order by created_at, id""",
        ).param("userId", userId).query { rs, _ ->
            RecordRow(
                rs.getObject("id", UUID::class.java), rs.getString("question_id"), Category.valueOf(rs.getString("category")),
                rs.getString("title"), Visibility.valueOf(rs.getString("visibility")),
            )
        }.list()
        val versionsByRecord = if (records.isEmpty()) emptyMap() else jdbc.sql(
            """select v.id, v.record_id, v.answer, v.context, v.changed_because, v.next_step, v.recorded_at
               from record_versions v join profile_records r on r.id = v.record_id
               where r.user_id = :userId order by v.record_id, v.version_number""",
        ).param("userId", userId).query { rs, _ ->
            rs.getObject("record_id", UUID::class.java) to RecordVersionResponse(
                rs.getObject("id", UUID::class.java), rs.getString("answer"), rs.getString("context"),
                rs.getString("changed_because"), rs.getString("next_step"), rs.getTimestamp("recorded_at").toInstant(),
            )
        }.list().groupBy({ it.first }, { it.second })

        return OwnerProfileResponse(
            user.id, user.displayName, user.intro,
            records.map { OwnerRecordResponse(it.id, it.questionId, it.category, it.title, it.visibility, versionsByRecord.getValue(it.id)) },
        )
    }

    @Transactional
    fun update(userId: UUID, request: UpdateProfileRequest): OwnerProfileResponse {
        if (request.displayName == null && request.intro == null) {
            throw ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "바꿀 프로필 정보를 입력해 주세요.")
        }
        val affected = jdbc.sql(
            """update app_users set
               display_name = coalesce(:displayName, display_name),
               intro = case when :hasIntro then :intro else intro end,
               updated_at = :now where id = :id""",
        ).params(
            mapOf(
                "displayName" to request.displayName?.trim(), "hasIntro" to (request.intro != null),
                "intro" to request.intro?.trim()?.ifEmpty { null },
                "now" to Instant.now().asJdbcTimestamp(),
                "id" to userId,
            ),
        ).update()
        if (affected == 0) throw ApiException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "프로필을 찾지 못했어요.")
        return ownerProfile(userId)
    }
}
