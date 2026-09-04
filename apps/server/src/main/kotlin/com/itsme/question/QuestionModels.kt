package com.itsme.question

import com.itsme.profile.Category

enum class QuestionKind { choice, text }
data class QuestionOptionResponse(val label: String, val value: String, val swatch: String?)
data class QuestionResponse(
    val id: String,
    val category: Category,
    val chapter: String,
    val title: String,
    val prompt: String,
    val kind: QuestionKind,
    val options: List<QuestionOptionResponse>?,
    val guidance: String?,
    val placeholder: String?,
)
data class QuestionListResponse(val items: List<QuestionResponse>)
