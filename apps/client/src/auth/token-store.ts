import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface TokenStore {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

const TOKEN_KEY = 'itsme.auth.access-token';

function getWebSessionStorage(): Storage | null {
  // 정적 Web export나 테스트에는 window가 없을 수 있으므로 브라우저 세션에서만 접근한다.
  return typeof window === 'undefined' ? null : window.sessionStorage;
}

export const tokenStore: TokenStore = {
  async get() {
    if (Platform.OS === 'web') {
      return getWebSessionStorage()?.getItem(TOKEN_KEY) ?? null;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token) {
    if (Platform.OS === 'web') {
      const storage = getWebSessionStorage();
      if (!storage) {
        throw new Error('브라우저 세션 저장소를 사용할 수 없어요.');
      }
      storage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token, {
      // 잠금이 풀린 현재 기기에서만 토큰을 읽고 기기 백업을 통한 이전을 허용하지 않는다.
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  async clear() {
    if (Platform.OS === 'web') {
      getWebSessionStorage()?.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
