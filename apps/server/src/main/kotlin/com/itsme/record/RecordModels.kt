package com.itsme.record

import com.itsme.profile.Visibility
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

data class CreateRecordRequest(
    @field:NotBlank @field:Size(max = 80) val questionId: String,
    @field:NotBlank @field:Size(max = 600) val answer: String,
    @field:Size(max = 1200) val context: String? = null,
)

data class UpdateRecordRequest(
    val expectedVersionId: UUID,
    @field:NotBlank @field:Size(max = 600) val answer: String,
    @field:Size(max = 1200) val changedBecause: String? = null,
    @field:Size(max = 600) val nextStep: String? = null,
)

data class UpdateVisibilityRequest(
    val visibility: Visibility,
    @field:Size(max = 128) val previewToken: String? = null,
)
