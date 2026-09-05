import { fileURLToPath } from 'node:url';

const DEPLOYED_PROFILES = new Set(['preview', 'production']);
const MOCK_PROFILES = new Set(['development', 'local']);
const ALLOWED_PROFILES = new Set([...DEPLOYED_PROFILES, ...MOCK_PROFILES]);

/**
 * EAS pre-install 시점에는 프로젝트 의존성이 아직 없으므로 Node 표준 API만 사용한다.
 * 런타임 검증과 같은 배포 경계를 한 번 더 확인해 잘못된 바이너리가 만들어지기 전에 중단한다.
 */
export function validateBuildEnvironment(environment) {
  const apiMode = environment.EXPO_PUBLIC_API_MODE?.trim().toLowerCase();
  const buildProfile = environment.EXPO_PUBLIC_BUILD_PROFILE?.trim().toLowerCase();
  const rawApiUrl = environment.EXPO_PUBLIC_API_URL?.trim();

  if (apiMode !== 'mock' && apiMode !== 'http') {
    throw new Error('EXPO_PUBLIC_API_MODE는 mock 또는 http여야 합니다.');
  }
  if (!buildProfile || !ALLOWED_PROFILES.has(buildProfile)) {
    throw new Error('EXPO_PUBLIC_BUILD_PROFILE은 development, local, preview 또는 production이어야 합니다.');
  }

  const isDeployedBuild = DEPLOYED_PROFILES.has(buildProfile);
  if (isDeployedBuild && apiMode !== 'http') {
    throw new Error('preview와 production 빌드는 http API 모드만 사용할 수 있습니다.');
  }
  if (apiMode === 'mock' && !MOCK_PROFILES.has(buildProfile)) {
    throw new Error('mock API는 development 또는 local 빌드에서만 사용할 수 있습니다.');
  }
  if (apiMode === 'http' && !rawApiUrl) {
    throw new Error('http 모드에서는 EXPO_PUBLIC_API_URL이 필요합니다.');
  }

  if (rawApiUrl) {
    const parsedUrl = parseApiUrl(rawApiUrl);
    if (isDeployedBuild && parsedUrl.protocol !== 'https:') {
      throw new Error('preview와 production 빌드는 HTTPS API URL이 필요합니다.');
    }
    if (isDeployedBuild && isLocalOrPrivateHostname(parsedUrl.hostname)) {
      throw new Error('preview와 production 빌드는 외부 기기에서 접근 가능한 공개 API 호스트가 필요합니다.');
    }
  }

  return { apiMode, buildProfile };
}

function parseApiUrl(rawApiUrl) {
  let parsedUrl;
  try {
    parsedUrl = new URL(rawApiUrl);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL은 올바른 URL이어야 합니다.');
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_API_URL은 http 또는 https 주소여야 합니다.');
  }
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('EXPO_PUBLIC_API_URL에 사용자 이름이나 비밀번호를 포함할 수 없습니다.');
  }
  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error('EXPO_PUBLIC_API_URL은 query 또는 fragment가 없는 API 기준 주소여야 합니다.');
  }
  return parsedUrl;
}

function isLocalOrPrivateHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const isIpv6 = normalized.includes(':');
  if (
    normalized === 'localhost'
    || normalized.endsWith('.localhost')
    || normalized.endsWith('.local')
    || (isIpv6 && (
      normalized === '::1'
      || normalized.startsWith('fc')
      || normalized.startsWith('fd')
      || normalized.startsWith('fe80:')
    ))
  ) {
    return true;
  }

  const octets = normalized.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  return octets[0] === 0
    || octets[0] === 10
    || octets[0] === 127
    || (octets[0] === 169 && octets[1] === 254)
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectExecution) {
  validateBuildEnvironment(process.env);
  console.log('EAS 공개 환경 구성이 안전하게 확인되었습니다.');
}
