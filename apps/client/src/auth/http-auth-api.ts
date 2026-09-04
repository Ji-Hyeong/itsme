import { AuthSessionSchema, AuthUserSchema, type AuthApi, type LoginInput } from '@/auth/auth-api';
import { HttpTransport } from '@/data/http-transport';
import { ItsmeApiError } from '@/data/itsme-api';

export class HttpAuthApi implements AuthApi {
  constructor(private readonly http: HttpTransport) {}

  async login(input: LoginInput) {
    try {
      return AuthSessionSchema.parse(await this.http.request('/v1/auth/login', { method: 'POST', body: input }));
    } catch (cause) {
      // 로그인 실패에서는 이메일 존재 여부와 자격 증명 중 어느 쪽이 틀렸는지 구분하지 않는다.
      if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
        throw new ItsmeApiError('INVALID_INPUT', '이메일이나 비밀번호를 다시 확인해 주세요.');
      }
      throw cause;
    }
  }

  async getCurrentUser() {
    return AuthUserSchema.parse(await this.http.request('/v1/auth/me', { authenticated: true }));
  }

  async logout() {
    await this.http.request('/v1/auth/logout', { authenticated: true, method: 'POST' });
  }
}
