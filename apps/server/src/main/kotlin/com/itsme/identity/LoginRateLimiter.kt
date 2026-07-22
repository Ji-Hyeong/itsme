package com.itsme.identity

import com.itsme.common.ApiException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Component
class LoginRateLimiter(private val clock: Clock) {
    private data class Key(val accountHash: String, val remoteAddress: String)
    private data class Attempt(val failures: Int, val blockedUntil: Instant?)
    private val attempts = ConcurrentHashMap<Key, Attempt>()

    fun check(email: String, remoteAddress: String) {
        val entry = attempts[key(email, remoteAddress)] ?: return
        val blockedUntil = entry.blockedUntil ?: return
        val remaining = Duration.between(Instant.now(clock), blockedUntil).seconds.coerceAtLeast(1)
        if (!blockedUntil.isAfter(Instant.now(clock))) {
            attempts.remove(key(email, remoteAddress), entry)
            return
        }
        throw ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "잠시 후 다시 시도해 주세요.", remaining)
    }

    fun recordFailure(email: String, remoteAddress: String) {
        val key = key(email, remoteAddress)
        attempts.compute(key) { _, current ->
            val failures = (current?.failures ?: 0) + 1
            Attempt(failures, if (failures >= MAX_FAILURES) Instant.now(clock).plus(BLOCK_DURATION) else null)
        }
    }

    fun clear(email: String, remoteAddress: String) {
        attempts.remove(key(email, remoteAddress))
    }

    private fun key(email: String, remoteAddress: String): Key =
        Key(IdentityService.hashToken(email.trim().lowercase()), remoteAddress)

    companion object {
        private const val MAX_FAILURES = 5
        private val BLOCK_DURATION: Duration = Duration.ofMinutes(1)
    }
}
