import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusPressable } from '@/ui/FocusPressable';
import { PaperBackground } from '@/ui/PaperBackground';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

type AppPath = '/me' | '/discover' | '/timeline' | '/share';
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const destinations: readonly { href: AppPath; icon: IconName; selectedIcon: IconName; label: string }[] = [
  { href: '/me', icon: 'account-circle-outline', selectedIcon: 'account-circle', label: '나' },
  { href: '/discover', icon: 'comment-question-outline', selectedIcon: 'comment-question', label: '질문' },
  { href: '/timeline', icon: 'history', selectedIcon: 'history', label: '변화' },
  { href: '/share', icon: 'eye-outline', selectedIcon: 'eye', label: '공개' },
] as const;

export function AppShell({ backgroundBlocked = false, children }: { backgroundBlocked?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activePath = useMemo(
    () => destinations.find((item) => pathname.startsWith(item.href))?.href,
    [pathname],
  );
  const webBackgroundBlocked = Platform.OS === 'web' && backgroundBlocked;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <PaperBackground />
      <View
        accessibilityElementsHidden={webBackgroundBlocked}
        aria-hidden={webBackgroundBlocked}
        importantForAccessibility={webBackgroundBlocked ? 'no-hide-descendants' : 'auto'}
        // Native Modal은 자체가 배경 입력을 차단한다. 논리적 부모에 none을 주면 모달 버튼까지 차단될 수 있어 Web portal에만 적용한다.
        pointerEvents={webBackgroundBlocked ? 'none' : 'auto'}
        style={styles.mobileFrame}
        testID="app-background">
        <View style={styles.content}>{children}</View>
        <View
          accessibilityLabel="주요 메뉴"
          accessibilityRole="tablist"
          style={[styles.navigation, { paddingBottom: insets.bottom }]}>
          <View style={styles.navigationInner}>
            {destinations.map((item) => {
              const selected = item.href === activePath;
              return (
                <FocusPressable
                  accessibilityLabel={item.label}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  key={item.href}
                  onPress={() => router.replace(item.href)}
                  style={({ focused, pressed }) => [styles.navItem, focused && styles.focused, pressed && styles.pressed]}>
                  {selected ? <View accessible={false} style={styles.selectedIndicator} /> : null}
                  <View style={styles.iconFrame}>
                    <MaterialCommunityIcons
                      accessible={false}
                      color={selected ? colors.brand : colors.faintInk}
                      name={selected ? item.selectedIcon : item.icon}
                      size={21}
                    />
                  </View>
                  <Text style={[styles.navLabel, selected && styles.selectedNavLabel]}>{item.label}</Text>
                </FocusPressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', backgroundColor: colors.paperDeep },
  mobileFrame: { flex: 1, width: '100%', maxWidth: layout.maxContent, backgroundColor: colors.paper },
  content: { flex: 1, minWidth: 0 },
  navigation: { borderTopColor: colors.line, borderTopWidth: 1, backgroundColor: colors.white },
  navigationInner: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: space.sm },
  navItem: { position: 'relative', flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 1, borderColor: 'transparent', borderWidth: 2, borderRadius: radii.md },
  selectedIndicator: { position: 'absolute', top: -1, width: 28, height: 3, borderRadius: 2, backgroundColor: colors.brand },
  iconFrame: { width: 32, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill },
  navLabel: { color: colors.faintInk, fontFamily: fonts.sansMedium, fontSize: 11, lineHeight: 16 },
  selectedNavLabel: { color: colors.brandDeep, fontFamily: fonts.sansBold },
  focused: { borderColor: colors.focus },
  pressed: { opacity: 0.64 },
});
