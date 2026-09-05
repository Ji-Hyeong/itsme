package com.itsme.identity

import jakarta.validation.Valid
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/auth")
class IdentityController(private val identityService: IdentityService) {
    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        servletRequest: HttpServletRequest,
    ): SessionResponse = identityService.login(request, servletRequest.remoteAddr)

    @GetMapping("/me")
    fun me(authentication: Authentication): AuthUser = identityService.currentUser(authentication.userId())

    @PostMapping("/logout")
    fun logout(authentication: Authentication): org.springframework.http.ResponseEntity<Void> {
        identityService.logout(authentication.rawToken())
        return org.springframework.http.ResponseEntity.noContent().build()
    }
}
