package com.itsme.common

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolationException
import org.slf4j.MDC
import org.springframework.dao.DuplicateKeyException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

data class ApiError(
    val code: String,
    val message: String,
    val traceId: String?,
    val timestamp: Instant = Instant.now(),
)

class ApiException(
    val status: HttpStatus,
    val code: String,
    override val message: String,
    val retryAfterSeconds: Long? = null,
) : RuntimeException(message)

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(ApiException::class)
    fun api(error: ApiException): ResponseEntity<ApiError> {
        val response = ResponseEntity.status(error.status)
        error.retryAfterSeconds?.let { response.header("Retry-After", it.toString()) }
        return response.body(ApiError(error.code, error.message, MDC.get("traceId")))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class, ConstraintViolationException::class)
    fun validation(error: Exception): ResponseEntity<ApiError> =
        ResponseEntity.badRequest().body(ApiError("INVALID_INPUT", "입력값을 확인해 주세요.", MDC.get("traceId")))

    @ExceptionHandler(DuplicateKeyException::class)
    fun conflict(error: DuplicateKeyException): ResponseEntity<ApiError> =
        ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError("RESOURCE_CONFLICT", "이미 사용 중인 정보가 있어요.", MDC.get("traceId")))

    @ExceptionHandler(Exception::class)
    fun unexpected(error: Exception, request: HttpServletRequest): ResponseEntity<ApiError> {
        // 자유 서술과 인증 정보가 예외 메시지에 섞일 수 있어 요청 본문과 예외 원문은 로깅하지 않는다.
        return ResponseEntity.internalServerError()
            .body(ApiError("INTERNAL_ERROR", "잠시 후 다시 시도해 주세요.", MDC.get("traceId")))
    }
}
