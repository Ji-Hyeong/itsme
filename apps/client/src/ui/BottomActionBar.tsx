import { useContext, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { ActionButton, type ActionButtonTone } from '@/ui/ActionButton';
import { colors, layout, space } from '@/ui/tokens';

export type BottomAction = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: ActionButtonTone;
  accessibilityLabel?: string;
};

export type BottomActionBarProps = {
  primary: BottomAction;
  secondary?: BottomAction;
  contained?: boolean;
  forceInFlow?: boolean;
  aboveTabBar?: boolean;
  testID?: string;
};

export function BottomActionBar({
  primary,
  secondary,
  contained = false,
  forceInFlow = false,
  aboveTabBar = false,
  testID,
}: BottomActionBarProps) {
  const { fontScale } = useWindowDimensions();
  // 단독 preview·단위 테스트에서도 primitive가 동작하며, 앱 Provider 안에서는 실제 inset을 사용한다.
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // 확대 또는 키보드 입력 중에는 overlay가 마지막 입력·counter를 가릴 수 있어 문서 흐름으로 되돌린다.
  const inFlow = forceInFlow || keyboardVisible || fontScale >= layout.largeTextScale;
  const bottomOffset = aboveTabBar ? layout.bottomTabHeight : insets.bottom;

  return (
    <View
      style={[
        styles.bar,
        !inFlow && styles.overlay,
        !inFlow && { bottom: bottomOffset },
        inFlow && styles.inFlow,
      ]}
      testID={testID}>
      <View style={[styles.inner, contained && styles.containedInner]}>
        <ActionButton
          accessibilityLabel={primary.accessibilityLabel}
          disabled={primary.disabled}
          fullWidth
          loading={primary.loading}
          onPress={primary.onPress}
          tone={primary.tone ?? 'ink'}>
          {primary.label}
        </ActionButton>
        {secondary ? (
          <ActionButton
            accessibilityLabel={secondary.accessibilityLabel}
            disabled={secondary.disabled}
            fullWidth
            loading={secondary.loading}
            onPress={secondary.onPress}
            tone={secondary.tone ?? 'quiet'}>
            {secondary.label}
          </ActionButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: colors.surface,
    borderTopColor: colors.lineSubtle,
    borderTopWidth: 1,
    zIndex: 20,
  },
  overlay: { position: 'absolute', left: 0, right: 0 },
  inFlow: { position: 'relative', marginTop: space.lg },
  inner: {
    width: '100%',
    maxWidth: layout.maxContent,
    alignSelf: 'center',
    paddingHorizontal: layout.mobileGutter,
    paddingVertical: space.smMd,
    gap: space.xs,
  },
  containedInner: { maxWidth: undefined, paddingHorizontal: 0 },
});
