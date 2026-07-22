import type { TokenStore } from '@/auth/token-store';
import { ItsmeApiError } from '@/data/itsme-api';

type RequestOptions = {
  authenticated?: boolean;
  body?: unknown;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
};

const REQUEST_TIMEOUT_MS = 12_000;

export class HttpTransport {
  constructor(
    private readonly baseUrl: string,
    private readonly tokens: TokenStore,
  ) {}

  async request(path: string, options: RequestOptions = {}): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.authenticated) {
      const token = await this.tokens.get();
      if (!token) {
        throw new ItsmeApiError('UNAUTHORIZED', '로그인이 필요한 화면이에요.');
      }
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch (cause) {
      // 요청 payload에는 자유 서술과 인증 정보가 있으므로 원인 객체를 로그나 오류 문구로 전달하지 않는다.
      const message = cause instanceof Error && cause.name === 'AbortError'
        ? '응답이 늦어 요청을 멈췄어요. 다시 시도해 주세요.'
        : '서버에 연결하지 못했어요. 네트워크를 확인해 주세요.';
      throw new ItsmeApiError('NETWORK', message);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw mapHttpError(response.status);
    }
    if (response.status === 204) {
      return undefined;
    }

    try {
      return await response.json();
    } catch {
      throw new ItsmeApiError('INVALID_RESPONSE', '서버 응답 형식을 확인하지 못했어요.');
    }
  }
}

function mapHttpError(status: number): ItsmeApiError {
  if (status === 409) {
    return new ItsmeApiError('CONFLICT', '다른 곳에서 먼저 기록을 바꿨어요. 최신 내용을 확인한 뒤 다시 저장해 주세요.');
  }
  if (status === 400 || status === 422) {
    return new ItsmeApiError('INVALID_INPUT', '입력 내용을 다시 확인해 주세요.');
  }
  if (status === 401) {
    return new ItsmeApiError('UNAUTHORIZED', '로그인 정보가 만료되었어요. 다시 로그인해 주세요.');
  }
  if (status === 403) {
    return new ItsmeApiError('FORBIDDEN', '이 작업을 할 권한이 없어요.');
  }
  if (status === 404) {
    return new ItsmeApiError('NOT_FOUND', '요청한 내용을 찾지 못했어요.');
  }
  return new ItsmeApiError('SERVER_ERROR', '서버가 요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');
}
