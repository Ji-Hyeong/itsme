import type { TokenStore } from '@/auth/token-store';
import { HttpAuthApi } from '@/auth/http-auth-api';
import { HttpTransport } from '@/data/http-transport';

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('HttpAuthApi 세션 계약', () => {
  const tokens: TokenStore = {
    get: jest.fn().mockResolvedValue('opaque-token'),
    set: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
  const fetchMock = jest.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  test('로그인은 자격 증명을 body에만 보내고 응답 세션을 계약대로 검증한다', async () => {
    const session = {
      token: 'a'.repeat(43),
      expiresAt: '2026-07-29T00:00:00.000Z',
      user: { id: '6b133f38-4966-4c0f-91da-878830506a66', email: 'invite@example.com', displayName: '지금의 나', slug: 'scene-me' },
    };
    fetchMock.mockResolvedValue(response(session));
    const api = new HttpAuthApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.login({ email: 'invited@example.com', password: 'secret' })).resolves.toEqual(session);
    expect(tokens.get).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      }),
    );
  });

  test('로그인 401은 계정 존재 여부를 구분하지 않는 문구로 바꾼다', async () => {
    fetchMock.mockResolvedValue(response(undefined, 401));
    const api = new HttpAuthApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.login({ email: 'unknown@example.com', password: 'wrong' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      message: '이메일이나 비밀번호를 다시 확인해 주세요.',
    });
  });

  test('세션 확인은 저장된 bearer 토큰을 사용한다', async () => {
    fetchMock.mockResolvedValue(response({ id: '6b133f38-4966-4c0f-91da-878830506a66', email: 'invite@example.com', displayName: '지금의 나', slug: 'scene-me' }));
    const api = new HttpAuthApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.getCurrentUser()).resolves.toMatchObject({ id: '6b133f38-4966-4c0f-91da-878830506a66' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/auth/me',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer opaque-token' }) }),
    );
  });
});
