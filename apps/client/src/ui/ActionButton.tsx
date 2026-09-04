import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FocusPressable } from '@/ui/FocusPressable';
import { colors, layout, space, typeScale } from '@/ui/tokens';

type PressableProps = ComponentProps<typeof FocusPressable>;

export type ActionButtonTone = 'ink' | 'paper' | 'quiet' | 'danger';

export type ActionButtonProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  tone?: ActionButtonTone;
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
  const lightContent = tone === 'ink' || tone === 'danger';

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
        state.pressed && styles.pressed,
        disabled && tone === 'ink' && styles.disabledInk,
        disabled && tone === 'danger' && styles.disabledDanger,
        typeof style === 'function' ? style(state) : style,
      ]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={lightContent ? colors.white : colors.indigoDeep} /> : null}
        <Text style={[styles.label, lightContent ? styles.lightLabel : styles.darkLabel, disabled && styles.disabledLabel]}>
          {children}
        </Text>
      </View>
    </FocusPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.smMd,
    borderRadius: 12,
    borderWidth: 1,
  },
  fullWidth: { width: '100%' },
  ink: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  paper: { backgroundColor: colors.surface, borderColor: colors.lineStrong },
  quiet: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: colors.error, borderColor: colors.error },
  content: {
    minHeight: layout.minTouch - space.smMd * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  label: { ...typeScale.control, textAlign: 'center' },
  lightLabel: { color: colors.white },
  darkLabel: { color: colors.indigoDeep },
  pressed: { opacity: 0.74 },
  disabledInk: { backgroundColor: colors.surfaceMuted, borderColor: colors.lineStrong },
  disabledDanger: { backgroundColor: colors.errorSoft, borderColor: colors.error },
  disabledLabel: { color: colors.muted },
});
