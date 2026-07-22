import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

type NativePressableProps = ComponentProps<typeof Pressable>;
type FocusState = { focused: boolean; pressed: boolean };

type FocusPressableProps = Omit<NativePressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: FocusState) => StyleProp<ViewStyle>);
};

/** React Native와 Web에서 같은 키보드 포커스 표현을 쓰기 위한 얇은 입력 primitive다. */
export function FocusPressable({ onBlur, onFocus, style, ...props }: FocusPressableProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={({ pressed }) => [
        // Web 기본 outline 대신 각 컴포넌트의 고대비 border 포커스를 사용해 이중 테두리를 막는다.
        { outlineWidth: 0 },
        typeof style === 'function' ? style({ focused, pressed }) : style,
      ]}
    />
  );
}
