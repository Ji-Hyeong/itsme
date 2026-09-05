import { AuthSessionSchema, AuthUserSchema, type AuthApi, type LoginInput } from '@/auth/auth-api';
import type { TokenStore } from '@/auth/token-store';
import { ItsmeApiError } from '@/data/itsme-api';

const MOCK_ACCESS_TOKEN = `mock_${'x'.repeat(38)}`;

export class MockAuthApi implements AuthApi {
  private user = AuthUserSchema.parse({
    id: '6b133f38-4966-4c0f-91da-878830506a66',
    email: 'invite@example.com',
    displayName: '지금의 나',
    slug: 'my-scene',
  });

  constructor(private readonly tokens: TokenStore) {}

  async login(input: LoginInput) {
    this.assertCredentials(input);
    return AuthSessionSchema.parse({
      token: MOCK_ACCESS_TOKEN,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: this.user,
    });
  }

  async getCurrentUser() {
    if ((await this.tokens.get()) !== MOCK_ACCESS_TOKEN) {
      throw new ItsmeApiError('UNAUTHORIZED', '로그인 정보가 만료되었어요.');
    }
    return AuthUserSchema.parse(this.user);
  }

  async logout() {
    return undefined;
  }

  private assertCredentials(input: LoginInput) {
    if (!input.email.trim() || !input.password) {
      throw new ItsmeApiError('INVALID_INPUT', '이메일이나 비밀번호를 다시 확인해 주세요.');
    }
  }
}
