import type { TokenStore } from '@/auth/token-store';
import { HttpItsmeApi } from '@/data/http-itsme-api';
import { HttpTransport } from '@/data/http-transport';

const publicProfile = {
  displayName: '지금의 나',
  records: [{ category: 'learning', title: '배우는 중', answer: '천천히 쉬는 법' }],
};
const previewToken = 'p'.repeat(43);

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('HttpItsmeApi 계약과 인증 경계', () => {
  const tokens: TokenStore = {
    get: jest.fn().mockResolvedValue('private-token'),
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

  test('공개 프로필은 slug만 경로에 넣고 토큰을 읽거나 인증 헤더를 보내지 않는다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(publicProfile));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.getPublicProfile('scene-me')).resolves.toEqual(publicProfile);

    expect(tokens.get).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/public/profiles/scene-me',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
  });

  test('소유자 프로필은 bearer 토큰을 붙이고 계약 응답을 검증한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'owner-me', displayName: '지금의 나', records: [] }));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.getOwnerProfile()).resolves.toMatchObject({ id: 'owner-me', records: [] });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/me/profile',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer private-token' }) }),
    );
  });

  test('질문 목록은 계약 envelope를 해제하며 공개 자원이므로 인증 정보가 필요 없다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [] }));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.getQuestions()).resolves.toEqual([]);
    expect(tokens.get).not.toHaveBeenCalled();
  });

  test('공개 응답에 소유자 필드가 섞이면 화면에 전달하지 않고 거절한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...publicProfile, email: 'private@example.com' }));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.getPublicProfile('scene-me')).rejects.toBeTruthy();
  });

  test('기록 수정은 화면이 읽은 expectedVersionId를 본문에 포함한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'owner-me', displayName: '지금의 나', records: [] }));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await api.updateRecord({
      recordId: 'record-me',
      expectedVersionId: 'version-current',
      answer: '지금의 답',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/me/records/record-me',
      expect.objectContaining({
        body: JSON.stringify({ expectedVersionId: 'version-current', answer: '지금의 답' }),
      }),
    );
  });

  test('공개 후보 응답의 token과 profile을 함께 검증해 보존한다', async () => {
    const response = {
      previewToken,
      expiresAt: '2026-07-22T12:00:00.000Z',
      profile: publicProfile,
    };
    fetchMock.mockResolvedValue(jsonResponse(response));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await expect(
      api.previewPublicProfile({ recordId: 'record-me', visibility: 'public' }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/me/public-profile-preview',
      expect.objectContaining({
        body: JSON.stringify({ recordId: 'record-me', visibility: 'public' }),
      }),
    );
  });

  test('공개 확정에서만 previewToken을 visibility 본문에 전달한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'owner-me', displayName: '지금의 나', records: [] }));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await api.setVisibility({ recordId: 'record-me', visibility: 'public', previewToken });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/me/records/record-me/visibility',
      expect.objectContaining({ body: JSON.stringify({ visibility: 'public', previewToken }) }),
    );
  });

  test('DELETE 204 뒤 소유자 GET을 이어 붙이지 않고, 재시도 404도 멱등 성공으로 처리한다', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(undefined, 204))
      .mockResolvedValueOnce(jsonResponse({}, 404));
    const api = new HttpItsmeApi(new HttpTransport('https://api.example.com', tokens));

    await expect(api.deleteRecord('record-me')).resolves.toBeUndefined();
    await expect(api.deleteRecord('record-me')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
