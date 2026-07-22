import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { colors, fonts } from '@/ui/tokens';

type BrandLogoProps = {
  inverse?: boolean;
  markOnly?: boolean;
  size?: number;
};

/**
 * Scene M은 서로 다른 높이의 세 장면이 겹쳐 추상적인 M을 만드는 심볼이다.
 * 작은 크기에서도 얼굴·점수·완성도 없이 '여러 기록이 모인 나'를 식별하게 한다.
 */
export function BrandLogo({ inverse = false, markOnly = false, size = 34 }: BrandLogoProps) {
  return (
    <View accessibilityLabel={markOnly ? "it'sME 심볼" : "it'sME"} style={styles.lockup}>
      <Svg height={size} viewBox="0 0 40 40" width={size}>
        <Rect fill={inverse ? colors.white : colors.sage} height="30" rx="5.5" width="11" x="4" y="5" />
        <Rect fill={inverse ? colors.white : colors.apricot} height="30" rx="5.5" width="11" x="25" y="5" />
        <Rect fill={inverse ? colors.white : colors.brand} height="23" rx="5.5" width="12" x="14" y="12" />
      </Svg>
      {markOnly ? null : (
        <Text accessibilityElementsHidden style={[styles.wordmark, inverse && styles.inverseWordmark]}>
          <Text style={styles.its}>it’s</Text>
          <Text style={styles.me}>ME</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  wordmark: { color: colors.ink, fontSize: 23, letterSpacing: -1.05, lineHeight: 31 },
  inverseWordmark: { color: colors.white },
  its: { fontFamily: fonts.sansMedium },
  me: { fontFamily: fonts.logoBold },
});
