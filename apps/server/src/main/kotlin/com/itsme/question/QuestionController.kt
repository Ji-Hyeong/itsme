package com.itsme.question

import com.itsme.profile.Category
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/questions")
class QuestionController(private val jdbc: JdbcClient) {
    private data class QuestionRow(
        val id: String, val category: Category, val chapter: String, val title: String, val prompt: String,
        val kind: QuestionKind, val guidance: String?, val placeholder: String?,
    )

    @GetMapping
    @Transactional(readOnly = true)
    fun list(): QuestionListResponse {
        val questions = jdbc.sql(
            """select id, category, chapter, title, prompt, kind, guidance, placeholder
               from questions where active = true order by sort_order""",
        ).query { rs, _ ->
            QuestionRow(
                rs.getString("id"), Category.valueOf(rs.getString("category")), rs.getString("chapter"),
                rs.getString("title"), rs.getString("prompt"), QuestionKind.valueOf(rs.getString("kind")),
                rs.getString("guidance"), rs.getString("placeholder"),
            )
        }.list()
        val options = jdbc.sql(
            """select question_id, label, option_value, swatch from question_options order by question_id, option_order""",
        ).query { rs, _ -> rs.getString("question_id") to QuestionOptionResponse(rs.getString("label"), rs.getString("option_value"), rs.getString("swatch")) }
            .list().groupBy({ it.first }, { it.second })
        return QuestionListResponse(questions.map {
            QuestionResponse(it.id, it.category, it.chapter, it.title, it.prompt, it.kind, options[it.id], it.guidance, it.placeholder)
        })
    }
}
