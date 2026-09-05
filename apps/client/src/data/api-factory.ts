import type { AuthApi } from '@/auth/auth-api';
import { HttpAuthApi } from '@/auth/http-auth-api';
import { MockAuthApi } from '@/auth/mock-auth-api';
import { tokenStore } from '@/auth/token-store';
import { getRuntimeConfig } from '@/config/runtime-config';
import { HttpItsmeApi } from '@/data/http-itsme-api';
import { HttpTransport } from '@/data/http-transport';
import type { ItsmeApi } from '@/data/itsme-api';
import { MockItsmeApi } from '@/data/mock-itsme-api';

export type ApiClients = {
  authApi: AuthApi;
  itsmeApi: ItsmeApi;
};

export function createApiClients(): ApiClients {
  const config = getRuntimeConfig();
  if (config.apiMode === 'mock') {
    return {
      authApi: new MockAuthApi(tokenStore),
      itsmeApi: new MockItsmeApi(),
    };
  }

  // runtime config가 http 모드의 URL 존재를 이미 보장해 이 지점의 null은 구성 결함이다.
  if (!config.apiUrl) {
    throw new Error('API URL 구성이 올바르지 않아요.');
  }
  const transport = new HttpTransport(config.apiUrl, tokenStore);
  return {
    authApi: new HttpAuthApi(transport),
    itsmeApi: new HttpItsmeApi(transport),
  };
}
