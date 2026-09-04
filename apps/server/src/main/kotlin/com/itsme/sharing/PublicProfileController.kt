package com.itsme.sharing

import com.itsme.identity.userId
import jakarta.validation.Valid
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class PublicProfileController(private val queryService: PublicProfileQueryService) {
    @GetMapping("/v1/public/profiles/{slug}")
    fun get(@PathVariable slug: String): ResponseEntity<PublicProfileResponse> =
        noStore(queryService.bySlug(slug))

    @PostMapping("/v1/me/public-profile-preview")
    fun preview(
        authentication: Authentication,
        @Valid @RequestBody request: PublicProfilePreviewRequest,
    ): ResponseEntity<PublicProfilePreviewResponse> = ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(queryService.preview(authentication.userId(), request))

    private fun noStore(profile: PublicProfileResponse): ResponseEntity<PublicProfileResponse> =
        ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(profile)
}
