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

import { ItsmeProvider } from '@/state/ItsmeProvider';
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
      <ItsmeProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />
      </ItsmeProvider>
    </SafeAreaProvider>
  );
}
