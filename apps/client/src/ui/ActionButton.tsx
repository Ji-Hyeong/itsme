import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { FocusPressable } from '@/ui/FocusPressable';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

type PressableProps = ComponentProps<typeof FocusPressable>;

type ActionButtonProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  tone?: 'ink' | 'paper' | 'quiet' | 'danger';
};

export function ActionButton({
  children,
  accessibilityLabel,
  disabled,
  fullWidth = false,
  loading = false,
  style,
  tone = 'ink',
  ...props
}: ActionButtonProps) {
  const isDisabled = disabled || loading;
  const fallbackAccessibilityLabel = typeof children === 'string' ? children : undefined;

  return (
    <FocusPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? fallbackAccessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={(state) => [
        styles.base,
        fullWidth && styles.fullWidth,
        styles[tone],
        state.focused && styles.focused,
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}>
      {loading ? (
        <ActivityIndicator color={tone === 'ink' || tone === 'danger' ? colors.white : colors.brand} />
      ) : (
        <Text style={[styles.label, tone === 'ink' || tone === 'danger' ? styles.lightLabel : styles.darkLabel]}>
          {children}
        </Text>
      )}
    </FocusPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  fullWidth: { width: '100%' },
  ink: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  paper: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  quiet: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    letterSpacing: -0.2,
    lineHeight: 22,
    textAlign: 'center',
  },
  lightLabel: { color: colors.white },
  darkLabel: { color: colors.brandDeep },
  focused: {
    borderColor: colors.focus,
    borderWidth: 2,
  },
  pressed: { opacity: 0.74 },
  disabled: { opacity: 0.46 },
});
