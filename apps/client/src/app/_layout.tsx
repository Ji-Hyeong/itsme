import {
  NotoSansKR_400Regular,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
  NotoSansKR_900Black,
  useFonts as useNotoFonts,
} from '@expo-google-fonts/noto-sans-kr';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/state/AuthProvider';
import { ItsmeProvider } from '@/state/ItsmeProvider';
import { SessionGate } from '@/ui/SessionGate';
import { colors } from '@/ui/tokens';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [notoLoaded] = useNotoFonts({
    NotoSansKR_400Regular,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
    NotoSansKR_900Black,
  });
  const fontsLoaded = notoLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ItsmeProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </ItsmeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { status } = useAuth();
  const hasPrivateSession = status === 'authenticated' || status === 'expired';

  return (
    <SessionGate>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Protected guard={hasPrivateSession}>
          <Stack.Screen name="index" />
          <Stack.Screen name="me" />
          <Stack.Screen name="discover" />
          <Stack.Screen name="timeline" />
          <Stack.Screen name="share" />
          <Stack.Screen name="preview" />
          <Stack.Screen name="record/[id]" />
          <Stack.Screen name="account" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'anonymous'}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
        <Stack.Screen name="p/[slug]" />
      </Stack>
    </SessionGate>
  );
}
