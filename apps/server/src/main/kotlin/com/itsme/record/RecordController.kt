package com.itsme.record

import com.itsme.identity.userId
import com.itsme.profile.OwnerProfileResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/me/records")
class RecordController(private val recordService: RecordService) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(authentication: Authentication, @Valid @RequestBody request: CreateRecordRequest): OwnerProfileResponse =
        recordService.create(authentication.userId(), request)

    @PatchMapping("/{recordId}")
    fun update(
        authentication: Authentication,
        @PathVariable recordId: UUID,
        @Valid @RequestBody request: UpdateRecordRequest,
    ): OwnerProfileResponse = recordService.update(authentication.userId(), recordId, request)

    @PatchMapping("/{recordId}/visibility")
    fun updateVisibility(
        authentication: Authentication,
        @PathVariable recordId: UUID,
        @Valid @RequestBody request: UpdateVisibilityRequest,
    ): OwnerProfileResponse = recordService.updateVisibility(authentication.userId(), recordId, request)

    @DeleteMapping("/{recordId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(authentication: Authentication, @PathVariable recordId: UUID) =
        recordService.delete(authentication.userId(), recordId)
}
