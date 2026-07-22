import { MockAuthApi } from '@/auth/mock-auth-api';
import type { TokenStore } from '@/auth/token-store';

describe('MockAuthApi 계약 fixture', () => {
  test('mock 로그인 사용자도 실제 slug와 이메일 계약을 만족한다', async () => {
    const tokens: TokenStore = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const api = new MockAuthApi(tokens);

    await expect(api.login({ email: 'invite@example.com', password: 'local-password' }))
      .resolves.toMatchObject({
        user: {
          email: 'invite@example.com',
          slug: 'my-scene',
        },
      });
  });
});
