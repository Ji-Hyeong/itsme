package com.itsme.sharing

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class PublicRobotsHeaderFilter : OncePerRequestFilter() {
    override fun shouldNotFilter(request: HttpServletRequest): Boolean =
        !request.requestURI.startsWith("/v1/public/")

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        // 내부 알파 공개 경로가 검색·보관되지 않게 성공과 오류 응답 모두에 같은 정책을 먼저 고정한다.
        response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive")
        chain.doFilter(request, response)
    }
}
