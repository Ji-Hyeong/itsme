import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthUser, LoginInput } from '@/auth/auth-api';
import { tokenStore } from '@/auth/token-store';
import { createApiClients } from '@/data/api-factory';
import { ItsmeApiError } from '@/data/itsme-api';

export type AuthStatus = 'bootstrapping' | 'anonymous' | 'authenticated' | 'expired' | 'error';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  busy: boolean;
  error: string | null;
  dismissError(): void;
  retry(): Promise<void>;
  leaveToLogin(): Promise<void>;
  login(input: LoginInput): Promise<boolean>;
  logout(): Promise<void>;
  expireSession(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authApi] = useState(() => createApiClients().authApi);
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setStatus('bootstrapping');
    setError(null);
    try {
      const token = await tokenStore.get();
      if (!token) {
        setUser(null);
        setStatus('anonymous');
        return;
      }
      setUser(await authApi.getCurrentUser());
      setStatus('authenticated');
    } catch (cause) {
      if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
        await tokenStore.clear();
        setUser(null);
        setStatus('anonymous');
        setError('로그인 정보가 만료되었어요. 다시 로그인해 주세요.');
        return;
      }
      setStatus('error');
      setError(toSafeMessage(cause, '로그인 상태를 확인하지 못했어요.'));
    }
  }, [authApi]);

  useEffect(() => {
    const timer = setTimeout(() => void bootstrap(), 0);
    return () => clearTimeout(timer);
  }, [bootstrap]);

  const authenticate = useCallback(
    async (request: () => ReturnType<typeof authApi.login>) => {
      setBusy(true);
      setError(null);
      try {
        const session = await request();
        // 화면을 열기 전에 저장을 완료해 보호 API가 토큰 없이 먼저 호출되는 경쟁 상태를 막는다.
        await tokenStore.set(session.token);
        setUser(session.user);
        setStatus('authenticated');
        return true;
      } catch (cause) {
        setError(toSafeMessage(cause, '로그인 요청을 처리하지 못했어요.'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [authApi],
  );

  const clearSession = useCallback(async () => {
    await tokenStore.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const expireSession = useCallback(async () => {
    // user 식별은 재로그인 계정 비교에만 잠시 유지하며 Modal이 기존 개인 화면 접근을 차단한다.
    await tokenStore.clear();
    setStatus('expired');
    setError('로그인이 만료됐어요. 작성한 내용은 이 화면에 그대로 있어요.');
  }, []);

  const logout = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await authApi.logout();
    } catch (cause) {
      if (cause instanceof ItsmeApiError && cause.code === 'UNAUTHORIZED') {
        await expireSession();
        setBusy(false);
        return;
      }
      // 원격 무효화를 확인하지 못한 상태를 성공처럼 보이지 않게 세션과 화면을 그대로 둔다.
      setError(toSafeMessage(cause, '로그아웃하지 못했어요. 연결을 확인하고 다시 시도해 주세요.'));
      setBusy(false);
      return;
    }
    await clearSession();
    setBusy(false);
  }, [authApi, clearSession, expireSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      busy,
      error,
      dismissError: () => setError(null),
      retry: bootstrap,
      leaveToLogin: clearSession,
      login: (input) => authenticate(() => authApi.login(input)),
      logout,
      expireSession,
    }),
    [authApi, authenticate, bootstrap, busy, clearSession, error, expireSession, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }
  return context;
}

function toSafeMessage(cause: unknown, fallback: string) {
  return cause instanceof ItsmeApiError ? cause.message : fallback;
}
