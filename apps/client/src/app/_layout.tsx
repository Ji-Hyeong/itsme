import { useFonts } from 'expo-font';
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
  const [fontsLoaded] = useFonts({
    MaruBuri_400Regular: require('../../assets/fonts/MaruBuri-Regular.otf'),
    MaruBuri_600SemiBold: require('../../assets/fonts/MaruBuri-SemiBold.otf'),
    Pretendard_400Regular: require('../../assets/fonts/Pretendard-Regular.otf'),
    Pretendard_500Medium: require('../../assets/fonts/Pretendard-Medium.otf'),
    Pretendard_600SemiBold: require('../../assets/fonts/Pretendard-SemiBold.otf'),
    Pretendard_700Bold: require('../../assets/fonts/Pretendard-Bold.otf'),
  });

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
