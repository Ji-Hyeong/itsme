package com.itsme

import tools.jackson.dataformat.yaml.YAMLMapper
import org.junit.jupiter.api.Test
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.readText

class OpenApiContractTest {
    private val contractPath: Path = Path.of("..", "..", "contracts", "openapi", "itsme.yaml")

    @Test
    fun `OpenAPI는 파싱 가능하고 구현된 public surface를 선언한다`() {
        require(Files.isRegularFile(contractPath)) { "OpenAPI contract is missing: $contractPath" }
        val root = YAMLMapper().readTree(contractPath.readText())
        require(root.path("openapi").asString() == "3.1.0")
        val paths = root.path("paths")
        listOf(
            "/v1/auth/login", "/v1/auth/me", "/v1/auth/logout", "/v1/questions", "/v1/me/profile",
            "/v1/me/records", "/v1/me/records/{recordId}", "/v1/me/records/{recordId}/visibility",
            "/v1/me/public-profile-preview", "/v1/public/profiles/{slug}",
        ).forEach { require(paths.has(it)) { "Contract path is missing: $it" } }
        require(!paths.has("/v1/auth/signup")) { "Self signup must stay outside the internal-alpha API" }
    }

    @Test
    fun `공개 DTO는 소유자 전용 필드를 표현할 수 없다`() {
        val root = YAMLMapper().readTree(contractPath.readText())
        val properties = root.at("/components/schemas/PublicRecord/properties")
        require(properties.propertyNames().toSet() == setOf("category", "title", "answer"))
        listOf("id", "recordId", "visibility", "versions", "context", "changedBecause", "nextStep", "questionId")
            .forEach { require(!properties.has(it)) { "Owner-only field leaked into PublicRecord: $it" } }
    }

    @Test
    fun `수정 계약은 expectedVersionId를 필수로 요구한다`() {
        val root = YAMLMapper().readTree(contractPath.readText())
        val request = root.at("/components/schemas/UpdateRecordRequest")
        require(request.path("required").values().map { it.asString() }.toSet().containsAll(setOf("expectedVersionId", "answer")))
        require(request.at("/properties/expectedVersionId/format").asString() == "uuid")
    }

    @Test
    fun `공개 전환 계약은 preview wrapper와 일회용 token을 명시한다`() {
        val root = YAMLMapper().readTree(contractPath.readText())
        val preview = root.at("/components/schemas/PublicProfilePreviewResponse")
        require(preview.path("required").values().map { it.asString() }.toSet() == setOf("previewToken", "expiresAt", "profile"))
        require(root.at("/components/schemas/UpdateVisibilityRequest/properties/previewToken").isObject())
        require(root.at("/components/schemas/AuthUser/required").values().map { it.asString() }.toSet().contains("email"))
    }
}
