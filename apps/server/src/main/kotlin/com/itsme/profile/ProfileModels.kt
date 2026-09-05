package com.itsme.profile

import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

enum class Category { preference, personality, value, strength, learning, support }
enum class Visibility { private, public }

data class RecordVersionResponse(
    val id: UUID,
    val answer: String,
    val context: String?,
    val changedBecause: String?,
    val nextStep: String?,
    val recordedAt: Instant,
)

data class OwnerRecordResponse(
    val id: UUID,
    val questionId: String,
    val category: Category,
    val title: String,
    val visibility: Visibility,
    val versions: List<RecordVersionResponse>,
)

data class OwnerProfileResponse(
    val id: UUID,
    val displayName: String,
    val intro: String?,
    val records: List<OwnerRecordResponse>,
)

data class UpdateProfileRequest(
    @field:Size(min = 1, max = 80) val displayName: String? = null,
    @field:Size(max = 180) val intro: String? = null,
)
