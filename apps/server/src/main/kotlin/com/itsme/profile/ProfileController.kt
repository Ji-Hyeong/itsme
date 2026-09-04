package com.itsme.profile

import com.itsme.identity.userId
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/me/profile")
class ProfileController(private val profileService: ProfileService) {
    @GetMapping
    fun get(authentication: Authentication): OwnerProfileResponse = profileService.ownerProfile(authentication.userId())

    @PatchMapping
    fun update(
        authentication: Authentication,
        @Valid @RequestBody request: UpdateProfileRequest,
    ): OwnerProfileResponse = profileService.update(authentication.userId(), request)
}
