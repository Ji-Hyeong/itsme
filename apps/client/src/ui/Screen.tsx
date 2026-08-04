import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { layout, screenGutter, space } from '@/ui/tokens';

/** 모든 앱 화면이 같은 20px 모바일 기준축과 읽기 폭을 공유한다. */
export function Screen({ bottomPadding = space.xxl, children }: { bottomPadding?: number; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const gutter = screenGutter(width);

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.inner, { paddingBottom: bottomPadding, paddingHorizontal: gutter }]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  inner: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.maxContent,
    alignSelf: 'center',
    paddingTop: space.sm,
  },
});
