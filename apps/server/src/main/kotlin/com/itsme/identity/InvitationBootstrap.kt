package com.itsme.identity

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "itsme.bootstrap", name = ["enabled"], havingValue = "true")
class InvitationBootstrap(
    private val identityService: IdentityService,
    @param:Value("\${itsme.bootstrap.email}") private val email: String,
    @param:Value("\${itsme.bootstrap.password}") private val password: String,
    @param:Value("\${itsme.bootstrap.display-name}") private val displayName: String,
    @param:Value("\${itsme.bootstrap.slug}") private val slug: String,
) : ApplicationRunner {
    override fun run(args: ApplicationArguments) {
        // 명시적으로 활성화한 환경에서만 초대 계정을 만들며 평문 비밀번호는 DB나 로그에 남기지 않는다.
        require(email.isNotBlank() && displayName.isNotBlank()) { "Bootstrap invite fields must not be blank" }
        identityService.provisionInvite(email, password, displayName, slug)
    }
}
