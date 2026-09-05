package com.itsme.identity

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class LoginRequest(
    @field:Email @field:Size(max = 320) val email: String,
    @field:Size(min = 1, max = 72) val password: String,
)

data class AuthUser(val id: UUID, val email: String, val displayName: String, val slug: String)
data class SessionResponse(val token: String, val expiresAt: Instant, val user: AuthUser)
