package com.itsme.sharing

import com.itsme.profile.Category
import com.itsme.profile.Visibility
import java.util.UUID
import java.time.Instant

// 이 타입에는 내부 ID, 소유권, visibility, 질문 ID, 맥락과 과거 버전을 의도적으로 표현할 수 없다.
data class PublicRecordResponse(val category: Category, val title: String, val answer: String)
data class PublicProfileResponse(val displayName: String, val intro: String?, val records: List<PublicRecordResponse>)
data class PublicProfilePreviewRequest(val recordId: UUID, val visibility: Visibility)
data class PublicProfilePreviewResponse(
    val previewToken: String,
    val expiresAt: Instant,
    val profile: PublicProfileResponse,
)
