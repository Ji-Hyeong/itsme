package com.itsme

import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import com.itsme.common.asJdbcTimestamp
import com.itsme.identity.IdentityService
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.not
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.options
import java.time.Duration
import java.time.Instant
import java.sql.Timestamp
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
class ItsmeApiIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val objectMapper: ObjectMapper,
    private val identityService: IdentityService,
    private val jdbc: JdbcClient,
) {
    private data class Fixture(val id: UUID, val email: String, val token: String, val slug: String)

    @Test
    fun `인증이 없으면 소유자 프로필에 접근할 수 없다`() {
        mockMvc.get("/v1/me/profile")
            .andExpect { status { isUnauthorized() }; jsonPath("$.code") { value("UNAUTHENTICATED") } }
    }

    @Test
    fun `허용된 Web origin의 preflight는 인증 없이 필요한 헤더만 승인한다`() {
        mockMvc.options("/v1/me/profile") {
            header("Origin", "http://localhost:8082")
            header("Access-Control-Request-Method", "GET")
            header("Access-Control-Request-Headers", "authorization")
        }.andExpect {
            status { isOk() }
            header { string("Access-Control-Allow-Origin", "http://localhost:8082") }
            header { string("Access-Control-Allow-Headers", containsString("authorization")) }
        }
    }

    @Test
    fun `허용하지 않은 Web origin의 preflight는 거절한다`() {
        mockMvc.options("/v1/me/profile") {
            header("Origin", "https://untrusted.example")
            header("Access-Control-Request-Method", "GET")
        }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `로그아웃은 현재 bearer 세션을 즉시 무효화한다`() {
        val fixture = inviteAndLogin()
        mockMvc.get("/v1/auth/me") { bearer(fixture.token) }.andExpect {
            status { isOk() }
            jsonPath("$.email") { value(fixture.email) }
        }
        mockMvc.post("/v1/auth/logout") { bearer(fixture.token) }.andExpect { status { isNoContent() } }
        mockMvc.get("/v1/auth/me") { bearer(fixture.token) }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `인증 활동은 세션을 7일 연장하고 이미 만료된 세션은 되살리지 않는다`() {
        val active = inviteAndLogin()
        val activeHash = IdentityService.hashToken(active.token)
        jdbc.sql("update user_sessions set expires_at = :expiresAt where token_hash = :hash")
            .param("expiresAt", Instant.now().plusSeconds(30).asJdbcTimestamp()).param("hash", activeHash).update()

        mockMvc.get("/v1/auth/me") { bearer(active.token) }.andExpect { status { isOk() } }
        val extendedExpiry = jdbc.sql("select expires_at from user_sessions where token_hash = :hash")
            .param("hash", activeHash).query(Timestamp::class.java).single().toInstant()
        require(extendedExpiry.isAfter(Instant.now().plus(Duration.ofDays(6))))

        val expired = inviteAndLogin()
        val expiredHash = IdentityService.hashToken(expired.token)
        val lastUsedBefore = jdbc.sql("select last_used_at from user_sessions where token_hash = :hash")
            .param("hash", expiredHash).query(Timestamp::class.java).single().toInstant()
        jdbc.sql("update user_sessions set expires_at = :expiresAt where token_hash = :hash")
            .param("expiresAt", Instant.now().minusSeconds(1).asJdbcTimestamp()).param("hash", expiredHash).update()

        mockMvc.get("/v1/auth/me") { bearer(expired.token) }.andExpect { status { isUnauthorized() } }
        val lastUsedAfter = jdbc.sql("select last_used_at from user_sessions where token_hash = :hash")
            .param("hash", expiredHash).query(Timestamp::class.java).single().toInstant()
        require(lastUsedAfter == lastUsedBefore) { "Expired sessions must not be extended" }
    }

    @Test
    fun `회수된 계정은 기존 세션과 새 로그인이 모두 거절된다`() {
        val fixture = inviteAndLogin()
        identityService.revokeAccount(fixture.id)
        mockMvc.get("/v1/auth/me") { bearer(fixture.token) }.andExpect { status { isUnauthorized() } }
        mockMvc.post("/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to fixture.email, "password" to "alpha-password-${fixture.slug.removePrefix("user-")}"))
        }.andExpect { status { isUnauthorized() }; jsonPath("$.code") { value("INVALID_CREDENTIALS") } }
        require(jdbc.sql("select count(*) from user_sessions where user_id = :id").param("id", fixture.id).query(Int::class.java).single() == 0)
    }

    @Test
    fun `반복 로그인 실패는 원문 이메일을 저장하지 않고 Retry-After로 제한한다`() {
        val email = "rate-${UUID.randomUUID()}@example.com"
        repeat(5) {
            mockMvc.post("/v1/auth/login") {
                with { request -> request.apply { remoteAddr = "198.51.100.10" } }
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to "wrong-password"))
            }.andExpect { status { isUnauthorized() } }
        }
        mockMvc.post("/v1/auth/login") {
            with { request -> request.apply { remoteAddr = "198.51.100.10" } }
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to "wrong-password"))
        }.andExpect {
            status { isTooManyRequests() }
            header { exists("Retry-After") }
            jsonPath("$.code") { value("RATE_LIMITED") }
        }
    }

    @Test
    fun `신규 기록은 private이고 공개 projection에 민감 필드가 없다`() {
        val fixture = inviteAndLogin()
        val created = createRecord(fixture.token, "처음 답", "공개되면 안 되는 맥락")
        val recordId = created.at("/records/0/id").asString()
        require(created.at("/records/0/visibility").asString() == "private")

        mockMvc.get("/v1/public/profiles/${fixture.slug}")
            .andExpect {
                status { isOk() }
                header { string("Cache-Control", containsString("no-store")) }
                jsonPath("$.records.length()") { value(0) }
                content { string(not(containsString("공개되면 안 되는 맥락"))) }
            }

        setPublic(fixture.token, recordId)

        mockMvc.get("/v1/public/profiles/${fixture.slug}")
            .andExpect {
                status { isOk() }
                jsonPath("$.records[0].answer") { value("처음 답") }
                jsonPath("$.records[0].id") { doesNotExist() }
                jsonPath("$.records[0].visibility") { doesNotExist() }
                jsonPath("$.records[0].versions") { doesNotExist() }
                jsonPath("$.records[0].context") { doesNotExist() }
                content { string(not(containsString("공개되면 안 되는 맥락"))) }
                content { string(not(containsString(recordId))) }
            }
    }

    @Test
    fun `공개 기록 수정은 이력을 보존하고 자동 private 전환한다`() {
        val fixture = inviteAndLogin()
        val created = createRecord(fixture.token, "예전 답", "예전 맥락")
        val recordId = created.at("/records/0/id").asString()
        val expectedVersionId = currentVersionId(created)
        setPublic(fixture.token, recordId)

        val updated = mockMvc.patch("/v1/me/records/$recordId") {
            bearer(fixture.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"expectedVersionId":"$expectedVersionId","answer":"지금 답","changedBecause":"생각이 달라져서","nextStep":"다시 돌아보기"}"""
        }.andExpect {
            status { isOk() }
            jsonPath("$.records[0].visibility") { value("private") }
            jsonPath("$.records[0].versions.length()") { value(2) }
            jsonPath("$.records[0].versions[0].answer") { value("예전 답") }
            jsonPath("$.records[0].versions[1].answer") { value("지금 답") }
        }.andReturn().response.contentAsString
        require(updated.contains("생각이 달라져서"))

        mockMvc.get("/v1/public/profiles/${fixture.slug}")
            .andExpect { status { isOk() }; jsonPath("$.records.length()") { value(0) } }
    }

    @Test
    fun `오래된 expectedVersionId 수정은 현재값과 이력을 바꾸지 않고 충돌한다`() {
        val fixture = inviteAndLogin()
        val created = createRecord(fixture.token, "첫 답", "첫 맥락")
        val recordId = created.at("/records/0/id").asString()
        val firstVersionId = currentVersionId(created)

        mockMvc.patch("/v1/me/records/$recordId") {
            bearer(fixture.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"expectedVersionId":"$firstVersionId","answer":"둘째 답"}"""
        }.andExpect { status { isOk() } }

        mockMvc.patch("/v1/me/records/$recordId") {
            bearer(fixture.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"expectedVersionId":"$firstVersionId","answer":"덮어쓰면 안 되는 답"}"""
        }.andExpect {
            status { isConflict() }
            jsonPath("$.code") { value("VERSION_CONFLICT") }
        }

        mockMvc.get("/v1/me/profile") { bearer(fixture.token) }.andExpect {
            status { isOk() }
            jsonPath("$.records[0].versions.length()") { value(2) }
            jsonPath("$.records[0].versions[1].answer") { value("둘째 답") }
            content { string(not(containsString("덮어쓰면 안 되는 답"))) }
        }
    }

    @Test
    fun `공개 후보 미리보기는 저장 없이 같은 공개 DTO를 반환하고 소유권을 강제한다`() {
        val owner = inviteAndLogin()
        val attacker = inviteAndLogin()
        val created = createRecord(owner.token, "미리 보일 답", "절대 보이면 안 되는 맥락")
        val recordId = created.at("/records/0/id").asString()

        val previewResponse = mockMvc.post("/v1/me/public-profile-preview") {
            bearer(owner.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"recordId":"$recordId","visibility":"public"}"""
        }.andExpect {
            status { isOk() }
            header { string("Cache-Control", containsString("no-store")) }
            jsonPath("$.previewToken") { isNotEmpty() }
            jsonPath("$.profile.records[0].answer") { value("미리 보일 답") }
            jsonPath("$.profile.records[0].id") { doesNotExist() }
            jsonPath("$.profile.records[0].versions") { doesNotExist() }
            jsonPath("$.profile.records[0].context") { doesNotExist() }
            content { string(not(containsString(recordId))) }
            content { string(not(containsString("절대 보이면 안 되는 맥락"))) }
        }.andReturn().response.contentAsString
        val preview = objectMapper.readTree(previewResponse)
        mockMvc.get("/v1/public/profiles/${owner.slug}").andExpect {
            status { isOk() }
            jsonPath("$.records.length()") { value(0) }
        }
        mockMvc.get("/v1/me/profile") { bearer(owner.token) }.andExpect {
            status { isOk() }
            jsonPath("$.records[0].visibility") { value("private") }
        }
        mockMvc.post("/v1/me/public-profile-preview") {
            bearer(attacker.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"recordId":"$recordId","visibility":"public"}"""
        }.andExpect { status { isNotFound() }; jsonPath("$.code") { value("RECORD_NOT_FOUND") } }

        mockMvc.patch("/v1/me/records/$recordId/visibility") {
            bearer(owner.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"visibility":"public"}"""
        }.andExpect { status { isConflict() }; jsonPath("$.code") { value("PREVIEW_REQUIRED") } }

        val previewToken = preview.path("previewToken").asString()
        mockMvc.patch("/v1/me/records/$recordId/visibility") {
            bearer(owner.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"visibility":"public","previewToken":"$previewToken"}"""
        }.andExpect { status { isOk() } }
        val publicProfile = mockMvc.get("/v1/public/profiles/${owner.slug}").andExpect {
            status { isOk() }
            header { string("X-Robots-Tag", "noindex, nofollow, noarchive") }
        }.andReturn().response.contentAsString
        require(objectMapper.readTree(publicProfile) == preview.path("profile"))
    }

    @Test
    fun `기록 버전이 바뀌면 이전 공개 미리보기 토큰을 거절한다`() {
        val fixture = inviteAndLogin()
        val created = createRecord(fixture.token, "미리보기 당시 답", "맥락")
        val recordId = created.at("/records/0/id").asString()
        val previewToken = previewToken(fixture.token, recordId)
        val expectedVersionId = currentVersionId(created)
        mockMvc.patch("/v1/me/records/$recordId") {
            bearer(fixture.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"expectedVersionId":"$expectedVersionId","answer":"바뀐 답"}"""
        }.andExpect { status { isOk() } }
        mockMvc.patch("/v1/me/records/$recordId/visibility") {
            bearer(fixture.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"visibility":"public","previewToken":"$previewToken"}"""
        }.andExpect { status { isConflict() }; jsonPath("$.code") { value("PREVIEW_INVALID") } }
    }

    @Test
    fun `없는 공개 프로필도 검색엔진 차단 헤더를 반환한다`() {
        mockMvc.get("/v1/public/profiles/not-found-user").andExpect {
            status { isNotFound() }
            header { string("X-Robots-Tag", "noindex, nofollow, noarchive") }
        }
    }

    @Test
    fun `다른 사용자의 기록 ID는 존재 여부를 드러내지 않고 수정과 삭제를 거부한다`() {
        val owner = inviteAndLogin()
        val attacker = inviteAndLogin()
        val recordId = createRecord(owner.token, "소유자 답", "소유자 맥락").at("/records/0/id").asString()

        mockMvc.patch("/v1/me/records/$recordId/visibility") {
            bearer(attacker.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"visibility":"public"}"""
        }.andExpect { status { isNotFound() }; jsonPath("$.code") { value("RECORD_NOT_FOUND") } }
        mockMvc.delete("/v1/me/records/$recordId") { bearer(attacker.token) }
            .andExpect { status { isNotFound() } }
    }

    @Test
    fun `삭제는 현재 기록과 모든 버전을 함께 영구 제거한다`() {
        val fixture = inviteAndLogin()
        val created = createRecord(fixture.token, "첫 답", "민감 맥락")
        val recordId = UUID.fromString(created.at("/records/0/id").asString())
        val expectedVersionId = currentVersionId(created)
        mockMvc.patch("/v1/me/records/$recordId") {
            bearer(fixture.token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"expectedVersionId":"$expectedVersionId","answer":"둘째 답","changedBecause":"민감 이유"}"""
        }.andExpect { status { isOk() } }
        mockMvc.delete("/v1/me/records/$recordId") { bearer(fixture.token) }.andExpect { status { isNoContent() } }

        val recordCount = jdbc.sql("select count(*) from profile_records where id = :id").param("id", recordId).query(Int::class.java).single()
        val versionCount = jdbc.sql("select count(*) from record_versions where record_id = :id").param("id", recordId).query(Int::class.java).single()
        require(recordCount == 0 && versionCount == 0)
    }

    private fun inviteAndLogin(): Fixture {
        val suffix = UUID.randomUUID().toString().replace("-", "").take(12)
        val email = "$suffix@example.com"
        val slug = "user-$suffix"
        val password = "alpha-password-$suffix"
        identityService.provisionInvite(email, password, "초대 사용자", slug)
        val response = mockMvc.post("/v1/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        val session = objectMapper.readTree(response)
        return Fixture(UUID.fromString(session.at("/user/id").asString()), email, session.path("token").asString(), slug)
    }

    private fun createRecord(token: String, answer: String, context: String): JsonNode {
        val response = mockMvc.post("/v1/me/records") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("questionId" to "learning-now", "answer" to answer, "context" to context))
        }.andExpect { status { isCreated() } }.andReturn().response.contentAsString
        return objectMapper.readTree(response)
    }

    private fun setPublic(token: String, recordId: String) {
        val previewToken = previewToken(token, recordId)
        mockMvc.patch("/v1/me/records/$recordId/visibility") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"visibility":"public","previewToken":"$previewToken"}"""
        }.andExpect { status { isOk() } }
    }

    private fun previewToken(token: String, recordId: String): String {
        val response = mockMvc.post("/v1/me/public-profile-preview") {
            bearer(token)
            contentType = MediaType.APPLICATION_JSON
            content = """{"recordId":"$recordId","visibility":"public"}"""
        }.andExpect { status { isOk() } }.andReturn().response.contentAsString
        return objectMapper.readTree(response).path("previewToken").asString()
    }

    private fun currentVersionId(profile: JsonNode): String {
        val versions = profile.at("/records/0/versions")
        return versions.path(versions.size() - 1).path("id").asString()
    }

    private fun org.springframework.test.web.servlet.MockHttpServletRequestDsl.bearer(token: String) {
        header("Authorization", "Bearer $token")
    }
}
