import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { layout, space } from '@/ui/tokens';

/** 모든 앱 화면이 같은 20px 모바일 기준축과 읽기 폭을 공유한다. */
export function Screen({ bottomPadding = space.xxl, children }: { bottomPadding?: number; children: ReactNode }) {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.inner, { paddingBottom: bottomPadding }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  inner: {
    width: '100%',
    maxWidth: layout.maxContent,
    alignSelf: 'center',
    paddingHorizontal: layout.mobileGutter,
    paddingTop: space.md,
  },
});
