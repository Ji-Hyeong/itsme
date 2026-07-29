import assert from 'node:assert/strict';
import test from 'node:test';

import { validateBuildEnvironment } from './validate-build-env.mjs';

test('local mock 빌드는 외부 API 주소 없이 허용한다', () => {
  assert.deepEqual(
    validateBuildEnvironment({
      EXPO_PUBLIC_API_MODE: 'mock',
      EXPO_PUBLIC_BUILD_PROFILE: 'local',
    }),
    { apiMode: 'mock', buildProfile: 'local' },
  );
});

test('preview 빌드는 HTTPS API 주소가 없으면 중단한다', () => {
  assert.throws(
    () => validateBuildEnvironment({
      EXPO_PUBLIC_API_MODE: 'http',
      EXPO_PUBLIC_BUILD_PROFILE: 'preview',
    }),
    /EXPO_PUBLIC_API_URL/,
  );
});

test('production 빌드는 평문 HTTP 주소를 거절한다', () => {
  assert.throws(
    () => validateBuildEnvironment({
      EXPO_PUBLIC_API_MODE: 'http',
      EXPO_PUBLIC_API_URL: 'http://api.example.com',
      EXPO_PUBLIC_BUILD_PROFILE: 'production',
    }),
    /HTTPS API URL/,
  );
});

test('배포 빌드는 로컬 및 사설 네트워크 호스트를 거절한다', () => {
  for (const apiUrl of [
    'https://localhost:8080',
    'https://127.0.0.1',
    'https://10.0.0.2',
    'https://172.16.0.2',
    'https://192.168.0.2',
    'https://[::1]',
  ]) {
    assert.throws(
      () => validateBuildEnvironment({
        EXPO_PUBLIC_API_MODE: 'http',
        EXPO_PUBLIC_API_URL: apiUrl,
        EXPO_PUBLIC_BUILD_PROFILE: 'preview',
      }),
      /공개 API 호스트/,
    );
  }
});

test('production 빌드는 공개 HTTPS API 주소를 허용한다', () => {
  assert.deepEqual(
    validateBuildEnvironment({
      EXPO_PUBLIC_API_MODE: 'http',
      EXPO_PUBLIC_API_URL: 'https://api.example.com/v1',
      EXPO_PUBLIC_BUILD_PROFILE: 'production',
    }),
    { apiMode: 'http', buildProfile: 'production' },
  );
});

test('IPv6 접두어처럼 시작하는 공개 DNS 호스트는 허용한다', () => {
  assert.doesNotThrow(() => validateBuildEnvironment({
    EXPO_PUBLIC_API_MODE: 'http',
    EXPO_PUBLIC_API_URL: 'https://fdn-api.example.com',
    EXPO_PUBLIC_BUILD_PROFILE: 'preview',
  }));
});
