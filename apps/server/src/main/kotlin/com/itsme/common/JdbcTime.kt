package com.itsme.common

import java.sql.Timestamp
import java.time.Instant

/**
 * PostgreSQL JDBC는 `Instant`를 SQL 파라미터 타입으로 직접 추론하지 못한다.
 * 도메인과 API에서는 UTC `Instant`를 유지하되 JDBC 경계에서만 `Timestamp`로 바꿔
 * H2와 PostgreSQL이 동일한 절대 시각을 저장하도록 한다.
 */
internal fun Instant.asJdbcTimestamp(): Timestamp = Timestamp.from(this)
