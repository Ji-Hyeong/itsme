package com.itsme.record

import com.itsme.common.ApiException
import com.itsme.profile.Category
import com.itsme.profile.OwnerProfileResponse
import com.itsme.profile.ProfileService
import com.itsme.profile.Visibility
import com.itsme.identity.IdentityService
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.Instant
import java.util.UUID

@Service
class RecordService(
    private val jdbc: JdbcClient,
    private val profileService: ProfileService,
    private val clock: Clock,
) {
    private data class QuestionSnapshot(val category: Category, val title: String)

    @Transactional
    fun create(userId: UUID, request: CreateRecordRequest): OwnerProfileResponse {
        val question = jdbc.sql("select category, title from questions where id = :id and active = true")
            .param("id", request.questionId)
            .query { rs, _ -> QuestionSnapshot(Category.valueOf(rs.getString("category")), rs.getString("title")) }
            .optional().orElseThrow { ApiException(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND", "질문을 찾지 못했어요.") }
        val answer = request.answer.trim()
        if (answer.isEmpty()) throw ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "답변을 한 글자 이상 남겨 주세요.")
        val recordId = UUID.randomUUID()
        val now = Instant.now(clock)
        // visibility를 요청에서 받지 않아 클라이언트가 어떤 값을 보내더라도 신규 기록은 private으로만 시작한다.
        jdbc.sql(
            """insert into profile_records(id, user_id, question_id, category, title, visibility, created_at, updated_at)
               values (:id, :userId, :questionId, :category, :title, 'private', :now, :now)""",
        ).params(
            mapOf(
                "id" to recordId, "userId" to userId, "questionId" to request.questionId,
                "category" to question.category.name, "title" to question.title, "now" to now,
            ),
        ).update()
        jdbc.sql(
            """insert into record_versions(id, record_id, version_number, answer, context, recorded_at)
               values (:id, :recordId, 1, :answer, :context, :now)""",
        ).params(
            mapOf(
                "id" to UUID.randomUUID(), "recordId" to recordId, "answer" to answer,
                "context" to request.context?.trim()?.ifEmpty { null }, "now" to now,
            ),
        ).update()
        return profileService.ownerProfile(userId)
    }

    @Transactional
    fun update(userId: UUID, recordId: UUID, request: UpdateRecordRequest): OwnerProfileResponse {
        val answer = request.answer.trim()
        if (answer.isEmpty()) throw ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "답변을 한 글자 이상 남겨 주세요.")
        val owned = jdbc.sql("select id from profile_records where id = :id and user_id = :userId for update")
            .param("id", recordId).param("userId", userId).query(UUID::class.java).optional().isPresent
        if (!owned) throw ApiException(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND", "기록을 찾지 못했어요.")
        val currentVersionId = jdbc.sql(
            """select id from record_versions where record_id = :recordId
               order by version_number desc limit 1""",
        ).param("recordId", recordId).query(UUID::class.java).single()
        if (currentVersionId != request.expectedVersionId) {
            // 잠금 이후 최신 ID를 비교해 두 기기의 동시 수정이 서로의 맥락과 답변을 조용히 덮지 못하게 한다.
            throw ApiException(HttpStatus.CONFLICT, "VERSION_CONFLICT", "다른 곳에서 기록이 먼저 바뀌었어요. 최신 내용을 확인해 주세요.")
        }
        val nextVersion = jdbc.sql("select coalesce(max(version_number), 0) + 1 from record_versions where record_id = :recordId")
            .param("recordId", recordId).query(Int::class.java).single()
        val now = Instant.now(clock)
        jdbc.sql(
            """insert into record_versions(id, record_id, version_number, answer, changed_because, next_step, recorded_at)
               values (:id, :recordId, :version, :answer, :changedBecause, :nextStep, :now)""",
        ).params(
            mapOf(
                "id" to UUID.randomUUID(), "recordId" to recordId, "version" to nextVersion, "answer" to answer,
                "changedBecause" to request.changedBecause?.trim()?.ifEmpty { null },
                "nextStep" to request.nextStep?.trim()?.ifEmpty { null }, "now" to now,
            ),
        ).update()
        // 공개 중인 서술이 조용히 바뀌지 않게 수정은 공개 동의를 철회하고 재공개를 별도 행동으로 요구한다.
        jdbc.sql("update profile_records set visibility = 'private', updated_at = :now where id = :id and user_id = :userId")
            .param("now", now).param("id", recordId).param("userId", userId).update()
        return profileService.ownerProfile(userId)
    }

    @Transactional
    fun updateVisibility(userId: UUID, recordId: UUID, request: UpdateVisibilityRequest): OwnerProfileResponse {
        val owned = jdbc.sql("select id from profile_records where id = :id and user_id = :userId for update")
            .param("id", recordId).param("userId", userId).query(UUID::class.java).optional().isPresent
        if (!owned) throw ApiException(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND", "기록을 찾지 못했어요.")
        val now = Instant.now(clock)
        if (request.visibility == Visibility.public) {
            val rawToken = request.previewToken?.takeIf(String::isNotBlank)
                ?: throw ApiException(HttpStatus.CONFLICT, "PREVIEW_REQUIRED", "공개 전 미리보기를 먼저 확인해 주세요.")
            val versionId = jdbc.sql(
                "select id from record_versions where record_id = :recordId order by version_number desc limit 1",
            ).param("recordId", recordId).query(UUID::class.java).single()
            val consumed = jdbc.sql(
                """update publication_preview_tokens set consumed_at = :now
                   where token_hash = :tokenHash and user_id = :userId and record_id = :recordId
                     and version_id = :versionId and candidate_visibility = 'public'
                     and consumed_at is null and expires_at > :now""",
            ).param("now", now).param("tokenHash", IdentityService.hashToken(rawToken))
                .param("userId", userId).param("recordId", recordId).param("versionId", versionId).update()
            if (consumed == 0) {
                throw ApiException(HttpStatus.CONFLICT, "PREVIEW_INVALID", "미리보기가 만료되었거나 기록이 바뀌었어요. 다시 확인해 주세요.")
            }
        }
        jdbc.sql("update profile_records set visibility = :visibility, updated_at = :now where id = :id and user_id = :userId")
            .param("visibility", request.visibility.name).param("now", now)
            .param("id", recordId).param("userId", userId).update()
        return profileService.ownerProfile(userId)
    }

    @Transactional
    fun delete(userId: UUID, recordId: UUID) {
        // FK cascade가 모든 버전과 민감 맥락까지 같은 트랜잭션에서 영구 제거한다. 별도 공개 캐시는 두지 않는다.
        val affected = jdbc.sql("delete from profile_records where id = :id and user_id = :userId")
            .param("id", recordId).param("userId", userId).update()
        if (affected == 0) throw ApiException(HttpStatus.NOT_FOUND, "RECORD_NOT_FOUND", "기록을 찾지 못했어요.")
    }
}
