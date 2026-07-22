import { StyleSheet, View } from 'react-native';

import { colors } from '@/ui/tokens';

/** 모바일 지면은 장식보다 기록을 우선해 하나의 중립적인 바탕만 사용한다. */
export function PaperBackground() {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.background]}
    />
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: colors.paper },
});
