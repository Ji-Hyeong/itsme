import { getRuntimeConfig } from '@/config/runtime-config';

const originalEnvironment = {
  apiMode: process.env.EXPO_PUBLIC_API_MODE,
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  buildProfile: process.env.EXPO_PUBLIC_BUILD_PROFILE,
  nodeEnvironment: process.env.NODE_ENV,
};

function setEnvironment(values: {
  apiMode?: string;
  apiUrl?: string;
  buildProfile?: string;
  nodeEnvironment?: 'development' | 'production' | 'test';
}) {
  setEnvironmentValue('EXPO_PUBLIC_API_MODE', values.apiMode);
  setEnvironmentValue('EXPO_PUBLIC_API_URL', values.apiUrl);
  setEnvironmentValue('EXPO_PUBLIC_BUILD_PROFILE', values.buildProfile);
  setEnvironmentValue('NODE_ENV', values.nodeEnvironment);
}

function setEnvironmentValue(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

describe('getRuntimeConfig 배포 안전 기본값', () => {
  afterEach(() => {
    setEnvironment({
      apiMode: originalEnvironment.apiMode,
      apiUrl: originalEnvironment.apiUrl,
      buildProfile: originalEnvironment.buildProfile,
      nodeEnvironment: originalEnvironment.nodeEnvironment,
    });
  });

  test.each(['preview', 'production'])('%s 빌드는 mock 모드를 거절한다', (buildProfile) => {
    setEnvironment({ apiMode: 'mock', buildProfile, nodeEnvironment: 'production' });

    expect(() => getRuntimeConfig()).toThrow('http API 모드');
  });

  test.each(['preview', 'production'])('%s 빌드는 HTTP URL을 거절한다', (buildProfile) => {
    setEnvironment({
      apiMode: 'http',
      apiUrl: 'http://api.example.com',
      buildProfile,
      nodeEnvironment: 'production',
    });

    expect(() => getRuntimeConfig()).toThrow('HTTPS API URL');
  });

  test.each([
    'https://localhost:8080',
    'https://127.0.0.1',
    'https://10.0.0.2',
    'https://172.31.0.2',
    'https://192.168.0.2',
    'https://[::1]',
  ])('preview 빌드는 외부 기기에서 접근할 수 없는 %s 주소를 거절한다', (apiUrl) => {
    setEnvironment({
      apiMode: 'http',
      apiUrl,
      buildProfile: 'preview',
      nodeEnvironment: 'production',
    });

    expect(() => getRuntimeConfig()).toThrow('공개 API 호스트');
  });

  test('API 기준 주소는 인증 정보와 query를 포함할 수 없다', () => {
    setEnvironment({
      apiMode: 'http',
      apiUrl: 'https://user:password@api.example.com?token=unsafe',
      buildProfile: 'production',
      nodeEnvironment: 'production',
    });

    expect(() => getRuntimeConfig()).toThrow('사용자 이름이나 비밀번호');
  });

  test('production 빌드는 명시적인 HTTPS http 구성을 허용한다', () => {
    setEnvironment({
      apiMode: 'http',
      apiUrl: 'https://api.example.com/',
      buildProfile: 'production',
      nodeEnvironment: 'production',
    });

    expect(getRuntimeConfig()).toEqual({ apiMode: 'http', apiUrl: 'https://api.example.com' });
  });

  test('IPv6 접두어처럼 시작하는 공개 DNS 호스트는 허용한다', () => {
    setEnvironment({
      apiMode: 'http',
      apiUrl: 'https://fdn-api.example.com',
      buildProfile: 'preview',
      nodeEnvironment: 'production',
    });

    expect(getRuntimeConfig()).toEqual({ apiMode: 'http', apiUrl: 'https://fdn-api.example.com' });
  });

  test('production 환경의 local export는 명시한 mock만 허용한다', () => {
    setEnvironment({ apiMode: 'mock', buildProfile: 'local', nodeEnvironment: 'production' });

    expect(getRuntimeConfig()).toEqual({ apiMode: 'mock', apiUrl: null });
  });
});
