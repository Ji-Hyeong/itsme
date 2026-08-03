import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { PublicProfile } from '@/domain/profile';
import type { ItsmeApi } from '@/data/itsme-api';
import { ItsmeApiError } from '@/data/itsme-api';
import { ItsmeProvider, useItsme } from '@/state/ItsmeProvider';

type Deferred<T> = {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
};

let mockPathname = '/p/a';
const mockExpireSession = jest.fn();
const mockPublicResponses = new Map<string, Deferred<PublicProfile>[]>();
const mockItsmeApi: jest.Mocked<ItsmeApi> = {
  getQuestions: jest.fn(),
  getOwnerProfile: jest.fn(),
  getPublicProfile: jest.fn(),
  saveAnswer: jest.fn(),
  updateRecord: jest.fn(),
  previewPublicProfile: jest.fn(),
  setVisibility: jest.fn(),
  deleteRecord: jest.fn(),
};

jest.mock('expo-router', () => ({ usePathname: () => mockPathname }));
jest.mock('@/data/api-factory', () => ({
  createApiClients: () => ({ itsmeApi: mockItsmeApi }),
}));
jest.mock('@/state/AuthProvider', () => ({
  useAuth: () => ({ status: 'anonymous', user: null, expireSession: mockExpireSession }),
}));

const profileA: PublicProfile = { displayName: 'A의 공개 프로필', records: [] };
const profileB: PublicProfile = { displayName: 'B의 공개 프로필', records: [] };

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function queuePublicResponse(slug: string) {
  const response = deferred<PublicProfile>();
  const queue = mockPublicResponses.get(slug) ?? [];
  queue.push(response);
  mockPublicResponses.set(slug, queue);
  return response;
}

function ProviderWrapper({ children }: PropsWithChildren) {
  return <ItsmeProvider>{children}</ItsmeProvider>;
}

describe('ItsmeProvider 공개 route 요청 격리', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/p/a';
    mockPublicResponses.clear();
    mockItsmeApi.getPublicProfile.mockImplementation((slug) => {
      const response = mockPublicResponses.get(slug)?.shift();
      if (!response) throw new Error(`테스트 응답이 준비되지 않은 slug: ${slug}`);
      return response.promise;
    });
  });

  test('A가 표시된 뒤 B로 이동한 첫 render부터 A 프로필과 오류를 숨긴다', async () => {
    const responseA = queuePublicResponse('a');
    const responseB = queuePublicResponse('b');
    const { result, rerender } = await renderHook(() => useItsme(), { wrapper: ProviderWrapper });

    await waitFor(() => expect(mockItsmeApi.getPublicProfile).toHaveBeenCalledWith('a'));
    await act(async () => {
      responseA.resolve(profileA);
      await responseA.promise;
    });
    await waitFor(() => expect(result.current.publicProfile).toEqual(profileA));

    mockPathname = '/p/b';
    await rerender(undefined);

    expect(result.current.publicProfile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(mockItsmeApi.getPublicProfile).toHaveBeenCalledWith('b'));
    await act(async () => {
      responseB.resolve(profileB);
      await responseB.promise;
    });
    await waitFor(() => expect(result.current.publicProfile).toEqual(profileB));
  });

  test('A와 B 응답 순서가 뒤집혀도 늦은 A 응답이 B를 덮지 않는다', async () => {
    const responseA = queuePublicResponse('a');
    const responseB = queuePublicResponse('b');
    const { result, rerender } = await renderHook(() => useItsme(), { wrapper: ProviderWrapper });

    await waitFor(() => expect(mockItsmeApi.getPublicProfile).toHaveBeenCalledWith('a'));
    mockPathname = '/p/b';
    await rerender(undefined);
    await waitFor(() => expect(mockItsmeApi.getPublicProfile).toHaveBeenCalledWith('b'));

    await act(async () => {
      responseB.resolve(profileB);
      await responseB.promise;
    });
    await waitFor(() => expect(result.current.publicProfile).toEqual(profileB));

    await act(async () => {
      responseA.resolve(profileA);
      await responseA.promise;
    });
    expect(result.current.publicProfile).toEqual(profileB);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('현재 slug의 오류만 표시하고 재시도하면 로딩을 거쳐 성공 상태로 복구한다', async () => {
    mockPathname = '/p/b';
    const failedResponse = queuePublicResponse('b');
    const retryResponse = queuePublicResponse('b');
    const { result } = await renderHook(() => useItsme(), { wrapper: ProviderWrapper });

    await waitFor(() => expect(mockItsmeApi.getPublicProfile).toHaveBeenCalledWith('b'));
    await act(async () => {
      failedResponse.reject(new ItsmeApiError('NOT_FOUND', 'B 프로필을 찾지 못했어요.'));
      await expect(failedResponse.promise).rejects.toThrow('B 프로필을 찾지 못했어요.');
    });
    await waitFor(() => expect(result.current.error).toBe('B 프로필을 찾지 못했어요.'));
    expect(result.current.loading).toBe(false);
    expect(result.current.publicProfile).toBeNull();

    let retryPromise: Promise<void> | undefined;
    await act(async () => {
      retryPromise = result.current.refreshPublic('b');
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      retryResponse.resolve(profileB);
      await retryPromise;
    });
    await waitFor(() => expect(result.current.publicProfile).toEqual(profileB));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
