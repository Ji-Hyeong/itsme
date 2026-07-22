import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'expo-router';

import type { OwnerProfile, PublicProfile, Question, Visibility } from '@/domain/profile';
import type { SaveAnswerInput, UpdateRecordInput } from '@/data/itsme-api';
import { MockItsmeApi } from '@/data/mock-itsme-api';

type ItsmeContextValue = {
  profile: OwnerProfile | null;
  publicProfile: PublicProfile | null;
  questions: readonly Question[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  clearError(): void;
  refresh(): Promise<void>;
  refreshPublic(slug: string): Promise<void>;
  saveAnswer(input: SaveAnswerInput): Promise<boolean>;
  updateRecord(input: UpdateRecordInput): Promise<boolean>;
  setVisibility(recordId: string, visibility: Visibility): Promise<boolean>;
  deleteRecord(recordId: string): Promise<boolean>;
};

const ItsmeContext = createContext<ItsmeContextValue | null>(null);

export function ItsmeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const api = useRef(new MockItsmeApi()).current;
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [questions, setQuestions] = useState<readonly Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextProfile, nextPublicProfile, nextQuestions] = await Promise.all([
        api.getOwnerProfile(),
        api.getPublicProfile('me'),
        api.getQuestions(),
      ]);
      setProfile(nextProfile);
      setPublicProfile(nextPublicProfile);
      setQuestions(nextQuestions);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '기록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const refreshPublic = useCallback(
    async (slug: string) => {
      setLoading(true);
      setError(null);
      setPublicProfile(null);
      try {
        // 익명 방문 경로에서는 owner와 질문 API를 호출하지 않아 인증 실패와 비공개 적재를 막는다.
        setPublicProfile(await api.getPublicProfile(slug));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : '공개 프로필을 불러오지 못했어요.');
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
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, refresh, refreshPublic]);

  const runMutation = useCallback(
    async (mutation: () => Promise<OwnerProfile>) => {
      setSaving(true);
      setError(null);
      try {
        const nextProfile = await mutation();
        const nextPublicProfile = await api.getPublicProfile('me');
        setProfile(nextProfile);
        setPublicProfile(nextPublicProfile);
        return true;
      } catch (cause) {
        // 화면의 draft는 로컬 상태에 남겨두고 오류만 전달해 사용자의 솔직한 원문을 잃지 않는다.
        setError(cause instanceof Error ? cause.message : '기록을 저장하지 못했어요.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [api],
  );

  const value = useMemo<ItsmeContextValue>(
    () => ({
      profile,
      publicProfile,
      questions,
      loading,
      saving,
      error,
      clearError: () => setError(null),
      refresh,
      refreshPublic,
      saveAnswer: (input) => runMutation(() => api.saveAnswer(input)),
      updateRecord: (input) => runMutation(() => api.updateRecord(input)),
      setVisibility: (recordId, visibility) =>
        runMutation(() => api.setVisibility(recordId, visibility)),
      deleteRecord: (recordId) => runMutation(() => api.deleteRecord(recordId)),
    }),
    [api, error, loading, profile, publicProfile, questions, refresh, refreshPublic, runMutation, saving],
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
