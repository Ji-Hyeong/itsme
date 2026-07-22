export type ApiMode = 'mock' | 'http';
export type BuildProfile = 'development' | 'local' | 'preview' | 'production';

export type RuntimeConfig = {
  apiMode: ApiMode;
  apiUrl: string | null;
};

/**
 * Expo는 EXPO_PUBLIC_* 접근을 빌드 시 정적으로 치환하므로 dot notation을 유지한다.
 * 이 값들은 앱 번들에서 누구나 읽을 수 있어 주소와 adapter 선택 외의 비밀은 받지 않는다.
 */
export function getRuntimeConfig(): RuntimeConfig {
  const configuredMode = process.env.EXPO_PUBLIC_API_MODE?.trim().toLowerCase();
  const buildProfile = process.env.EXPO_PUBLIC_BUILD_PROFILE?.trim().toLowerCase();
  if (configuredMode && configuredMode !== 'mock' && configuredMode !== 'http') {
    throw new Error('EXPO_PUBLIC_API_MODE는 mock 또는 http여야 합니다.');
  }
  if (
    buildProfile
    && buildProfile !== 'development'
    && buildProfile !== 'local'
    && buildProfile !== 'preview'
    && buildProfile !== 'production'
  ) {
    throw new Error('EXPO_PUBLIC_BUILD_PROFILE 구성이 올바르지 않아요.');
  }

  const apiMode: ApiMode = configuredMode === 'http' ? 'http' : 'mock';
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const isDeployedBuild = buildProfile === 'preview' || buildProfile === 'production';
  const mockIsAllowed = process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'test'
    || buildProfile === 'development'
    || buildProfile === 'local';

  if (isDeployedBuild && apiMode !== 'http') {
    throw new Error('preview와 production 빌드는 http API 모드만 사용할 수 있어요.');
  }
  if (apiMode === 'mock' && !mockIsAllowed) {
    throw new Error('mock API는 개발, 테스트 또는 명시적인 local 빌드에서만 사용할 수 있어요.');
  }
  if (apiMode === 'http' && !rawApiUrl) {
    throw new Error('http 모드에서는 EXPO_PUBLIC_API_URL을 설정해 주세요.');
  }

  let normalizedApiUrl: string | null = null;
  if (rawApiUrl) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawApiUrl);
    } catch {
      throw new Error('EXPO_PUBLIC_API_URL은 올바른 URL이어야 합니다.');
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('EXPO_PUBLIC_API_URL은 http 또는 https 주소여야 합니다.');
    }
    if (isDeployedBuild && parsedUrl.protocol !== 'https:') {
      throw new Error('preview와 production 빌드는 HTTPS API URL이 필요합니다.');
    }
    normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');
  }

  return {
    apiMode,
    apiUrl: normalizedApiUrl,
  };
}
