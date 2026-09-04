import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'expo-router';

import type { OwnerProfile, PublicProfile, Question } from '@/domain/profile';
import { createApiClients } from '@/data/api-factory';
import { ItsmeApiError } from '@/data/itsme-api';
import type {
  PublicProfilePreviewInput,
  PublicProfilePreviewResponse,
  SaveAnswerInput,
  UpdateRecordInput,
  UpdateVisibilityInput,
} from '@/data/itsme-api';
import { useAuth } from '@/state/AuthProvider';

export type VisibilityPreview = PublicProfilePreviewResponse & {
  recordId: string;
};

type ItsmeContextValue = {
  profile: OwnerProfile | null;
  publicProfile: PublicProfile | null;
  visibilityPreview: VisibilityPreview | null;
  questions: readonly Question[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  clearError(): void;
  refresh(): Promise<void>;
  refreshPublic(slug: string): Promise<void>;
  saveAnswer(input: SaveAnswerInput): Promise<boolean>;
  updateRecord(input: UpdateRecordInput): Promise<boolean>;
  prepareVisibilityPreview(input: PublicProfilePreviewInput): Promise<boolean>;
  clearVisibilityPreview(): void;
  setVisibility(input: UpdateVisibilityInput): Promise<boolean>;
  deleteRecord(recordId: string): Promise<boolean>;
};

const ItsmeContext = createContext<ItsmeContextValue | null>(null);

export function ItsmeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status: authStatus, user, expireSession } = useAuth();
  const publicSlug = user?.slug ?? 'me';
  const [api] = useState(() => createApiClients().itsmeApi);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [visibilityPreview, setVisibilityPreview] = useState<VisibilityPreview | null>(null);
  const [questions, setQuestions] = useState<readonly Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      const previousUserId = activeUserId.current;
      activeUserId.current = user.id;
      if (previousUserId && previousUserId !== user.id) {
        // 만료 화면에서 다른 계정으로 재인증되면 이전 계정의 owner/후보 메모리를 즉시 폐기한다.
        setProfile(null);
        setPublicProfile(null);
        setVisibilityPreview(null);
        setQuestions([]);
        setError(null);
      }
    } else if (authStatus === 'anonymous') {
      activeUserId.current = null;
    }
  }, [authStatus, user]);

  const refresh = useCallback(async () => {
    const requestedUserId = user?.id ?? null;
    setLoading(true);
    setError(null);
    try {
      const [nextProfile, nextPublicProfile, nextQuestions] = await Promise.all([
        api.getOwnerProfile(),
        api.getPublicProfile(publicSlug),
        api.getQuestions(),
      ]);
      if (activeUserId.current !== requestedUserId) return;
      setProfile(nextProfile);
      setPublicProfile(nextPublicProfile);
      setQuestions(nextQuestions);
    } catch (cause) {
      if (activeUserId.current !== requestedUserId) return;
      if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
        await expireSession();
      }
      setError(toSafeApiMessage(cause, '기록을 불러오지 못했어요.'));
    } finally {
      if (activeUserId.current === requestedUserId) setLoading(false);
    }
  }, [api, expireSession, publicSlug, user?.id]);

  const refreshPublic = useCallback(
    async (slug: string) => {
      setLoading(true);
      setError(null);
      setPublicProfile(null);
      try {
        // 익명 방문 경로에서는 owner와 질문 API를 호출하지 않아 인증 실패와 비공개 적재를 막는다.
        setPublicProfile(await api.getPublicProfile(slug));
      } catch (cause) {
        setError(toSafeApiMessage(cause, '공개 프로필을 불러오지 못했어요.'));
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    // 초기 API 동기화는 마운트 렌더와 분리해 React의 effect 안에서 연쇄 상태 변경을 만들지 않는다.
    const timer = setTimeout(() => {
      if (pathname.startsWith('/p/')) {
        const slug = pathname.slice('/p/'.length).split('/')[0];
        void refreshPublic(slug);
        return;
      }
      if (authStatus === 'authenticated') {
        void refresh();
        return;
      }
      if (authStatus === 'anonymous') {
        // 로그아웃 뒤 뒤로가기로 이전 계정의 메모리 상태가 다시 보이지 않게 즉시 비운다.
        setProfile(null);
        setPublicProfile(null);
        setVisibilityPreview(null);
        setQuestions([]);
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authStatus, pathname, refresh, refreshPublic]);

  const runMutation = useCallback(
    async (mutation: () => Promise<OwnerProfile>) => {
      const requestedUserId = user?.id ?? null;
      setSaving(true);
      setError(null);
      try {
        const nextProfile = await mutation();
        if (activeUserId.current !== requestedUserId) return false;
        // 서버가 mutation을 확정한 즉시 owner 상태부터 commit해 후속 공개 조회 실패와 분리한다.
        setProfile(nextProfile);
        try {
          setPublicProfile(await api.getPublicProfile(publicSlug));
        } catch {
          setError('변경은 저장됐지만 공개 모습을 새로 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');
        }
        return true;
      } catch (cause) {
        // 화면의 draft는 로컬 상태에 남겨두고 오류만 전달해 사용자의 솔직한 원문을 잃지 않는다.
        if (activeUserId.current !== requestedUserId) return false;
        if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
          await expireSession();
        }
        setError(toSafeApiMessage(cause, '기록을 저장하지 못했어요.'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [api, expireSession, publicSlug, user?.id],
  );

  const prepareVisibilityPreview = useCallback(
    async (input: PublicProfilePreviewInput) => {
      const requestedUserId = user?.id ?? null;
      setSaving(true);
      setError(null);
      try {
        const preview = await api.previewPublicProfile(input);
        if (activeUserId.current !== requestedUserId) return false;
        // 후보 응답은 서버가 허용한 공개 필드만 가지며, 사용자가 확정하기 전 owner 상태와 분리한다.
        setVisibilityPreview({ recordId: input.recordId, ...preview });
        return true;
      } catch (cause) {
        if (activeUserId.current !== requestedUserId) return false;
        if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
          await expireSession();
        }
        // 기존 후보는 실패 시 지우지 않아 공개 확정 화면에서 안전하게 재시도할 수 있다.
        setError(toSafeApiMessage(cause, '공개 모습을 준비하지 못했어요.'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [api, expireSession, user?.id],
  );

  const deleteRecord = useCallback(
    async (recordId: string) => {
      const requestedUserId = user?.id ?? null;
      setSaving(true);
      setError(null);
      try {
        await api.deleteRecord(recordId);
        if (activeUserId.current !== requestedUserId) return true;
        // DELETE 204가 확정되면 별도 GET 성공을 기다리지 않고 개인 메모리에서도 즉시 제거한다.
        setProfile((current) => current
          ? { ...current, records: current.records.filter((record) => record.id !== recordId) }
          : current);
        // 공개 DTO에는 내부 ID가 없어 안전하게 특정 항목만 제거할 수 없으므로 잠시 비운 뒤 재조회한다.
        setPublicProfile(null);

        void Promise.allSettled([api.getOwnerProfile(), api.getPublicProfile(publicSlug)]).then(
          async ([ownerResult, publicResult]) => {
            if (activeUserId.current !== requestedUserId) return;
            if (ownerResult.status === 'fulfilled') setProfile(ownerResult.value);
            if (publicResult.status === 'fulfilled') setPublicProfile(publicResult.value);
            const rejection = ownerResult.status === 'rejected'
              ? ownerResult.reason
              : publicResult.status === 'rejected'
                ? publicResult.reason
                : null;
            if (rejection instanceof ItsmeApiError && rejection.code === 'UNAUTHORIZED') {
              await expireSession();
            }
            if (rejection) {
              setError('기록은 삭제됐지만 화면을 새로 맞추지 못했어요. 다시 불러와 주세요.');
            }
          },
        );
        return true;
      } catch (cause) {
        if (activeUserId.current !== requestedUserId) return false;
        if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
          await expireSession();
        }
        setError(toSafeApiMessage(cause, '기록을 삭제하지 못했어요.'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [api, expireSession, publicSlug, user?.id],
  );

  const value = useMemo<ItsmeContextValue>(
    () => {
      // 재로그인 계정이 바뀐 단일 렌더에서도 이전 owner 객체를 절대 consumer에 넘기지 않는다.
      const ownerSessionMatches = profile?.id === user?.id;
      return {
        profile: ownerSessionMatches ? profile : null,
        publicProfile: pathname.startsWith('/p/') || ownerSessionMatches ? publicProfile : null,
        visibilityPreview: ownerSessionMatches ? visibilityPreview : null,
        questions,
        loading,
        saving,
        error,
        clearError: () => setError(null),
        refresh,
        refreshPublic,
        saveAnswer: (input) => runMutation(() => api.saveAnswer(input)),
        updateRecord: (input) => runMutation(() => api.updateRecord(input)),
        prepareVisibilityPreview,
        clearVisibilityPreview: () => setVisibilityPreview(null),
        setVisibility: (input) => runMutation(() => api.setVisibility(input)),
        deleteRecord,
      };
    },
    [api, deleteRecord, error, loading, pathname, prepareVisibilityPreview, profile, publicProfile, questions, refresh, refreshPublic, runMutation, saving, user?.id, visibilityPreview],
  );

  return <ItsmeContext.Provider value={value}>{children}</ItsmeContext.Provider>;
}

export function useItsme() {
  const context = useContext(ItsmeContext);
  if (!context) {
    throw new Error('useItsme는 ItsmeProvider 안에서 사용해야 합니다.');
  }
  return context;
}

function toSafeApiMessage(cause: unknown, fallback: string) {
  // validator 오류에는 서버가 돌려준 원문이 포함될 수 있으므로 안정된 adapter 오류만 화면에 노출한다.
  return cause instanceof ItsmeApiError ? cause.message : fallback;
}
