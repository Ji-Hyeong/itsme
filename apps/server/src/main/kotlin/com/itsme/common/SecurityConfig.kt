package com.itsme.common

import tools.jackson.databind.ObjectMapper
import com.itsme.identity.SessionAuthenticationFilter
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig(
    @param:Value("\${itsme.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
    private val allowedOriginPatterns: String,
) {
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)

    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        sessionAuthenticationFilter: SessionAuthenticationFilter,
        objectMapper: ObjectMapper,
    ): SecurityFilterChain = http
        .csrf { it.disable() }
        .cors { }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .authorizeHttpRequests {
            it.requestMatchers("/v1/auth/login", "/v1/questions", "/v1/public/**").permitAll()
                .anyRequest().authenticated()
        }
        .exceptionHandling {
            it.authenticationEntryPoint { _, response, _ ->
                response.status = HttpServletResponse.SC_UNAUTHORIZED
                response.contentType = MediaType.APPLICATION_JSON_VALUE
                objectMapper.writeValue(response.outputStream, ApiError("UNAUTHENTICATED", "로그인이 필요해요.", null))
            }
            it.accessDeniedHandler { _, response, _ ->
                response.status = HttpServletResponse.SC_FORBIDDEN
                response.contentType = MediaType.APPLICATION_JSON_VALUE
                objectMapper.writeValue(response.outputStream, ApiError("FORBIDDEN", "접근할 수 없어요.", null))
            }
        }
        .addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
        .build()

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            // Web은 모바일 UI 검증용이므로 개발 origin은 허용하되 쿠키 자격 증명은 사용하지 않는다.
            // 배포 환경에서는 CORS_ALLOWED_ORIGIN_PATTERNS를 정확한 HTTPS origin 목록으로 제한한다.
            allowedOriginPatterns = this@SecurityConfig.allowedOriginPatterns
                .split(',')
                .map(String::trim)
                .filter(String::isNotEmpty)
            allowedMethods = listOf("GET", "POST", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("Accept", "Authorization", "Content-Type")
            allowCredentials = false
            maxAge = 3600
        }
        return UrlBasedCorsConfigurationSource().also { source ->
            source.registerCorsConfiguration("/v1/**", configuration)
        }
    }
}
