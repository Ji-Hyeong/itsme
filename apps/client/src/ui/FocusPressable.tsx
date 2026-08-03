import type { ComponentProps, ComponentRef } from 'react';
import { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/ui/tokens';

type NativePressableProps = ComponentProps<typeof Pressable>;
export type FocusState = { focused: boolean; pressed: boolean };

export type FocusPressableProps = Omit<NativePressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: FocusState) => StyleProp<ViewStyle>);
};

/**
 * 키보드 포커스를 border 교체가 아닌 바깥 outline으로 그린다. border 두께를 바꾸면 포커스 순간
 * control 크기와 주변 정렬이 흔들리므로, Web과 outline을 지원하는 Native에서 동일한 3pt/2pt
 * 계약을 사용하고 컴포넌트의 본래 경계는 그대로 둔다.
 */
export const FocusPressable = forwardRef<ComponentRef<typeof Pressable>, FocusPressableProps>(
  function FocusPressable({ onBlur, onFocus, style, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    return (
      <Pressable
        {...props}
        ref={ref}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        style={({ pressed }) => [
          focused && styles.focused,
          typeof style === 'function' ? style({ focused, pressed }) : style,
        ]}
      />
    );
  },
);

const styles = StyleSheet.create({
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineOffset: 2,
      outlineStyle: 'solid',
      outlineWidth: 3,
    },
    default: {
      outlineColor: colors.focus,
      outlineOffset: 2,
      outlineStyle: 'solid',
      outlineWidth: 3,
    },
  }) as ViewStyle,
});
