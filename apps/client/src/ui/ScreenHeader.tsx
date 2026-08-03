import type { ComponentRef, Ref } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { FocusPressable } from '@/ui/FocusPressable';
import { Body, Control, ScreenTitle } from '@/ui/Type';
import { colors, layout, radii, space } from '@/ui/tokens';

export type HeaderAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export type ScreenHeaderProps = {
  title: string;
  description?: string;
  backAction?: HeaderAction;
  trailingAction?: HeaderAction;
  trailingActionRef?: Ref<ComponentRef<typeof FocusPressable>>;
};

function HeaderActionButton({ action, actionRef, back = false, expanded = false }: {
  action: HeaderAction;
  actionRef?: Ref<ComponentRef<typeof FocusPressable>>;
  back?: boolean;
  expanded?: boolean;
}) {
  return (
    <FocusPressable
      accessibilityLabel={action.accessibilityLabel ?? action.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled}
      onPress={action.onPress}
      ref={actionRef}
      style={({ pressed }) => [
        styles.action,
        expanded && styles.expandedAction,
        pressed && styles.pressed,
        action.disabled && styles.disabled,
      ]}>
      <Control style={styles.actionLabel}>{back ? `← ${action.label}` : action.label}</Control>
    </FocusPressable>
  );
}

export function ScreenHeader({ title, description, backAction, trailingAction, trailingActionRef }: ScreenHeaderProps) {
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale >= layout.largeTextScale;

  return (
    <View style={styles.container}>
      {backAction ? <HeaderActionButton action={backAction} back expanded={expanded} /> : null}
      <View style={[styles.titleRow, expanded && styles.expandedTitleRow]}>
        <View style={styles.copy}>
          <ScreenTitle accessibilityRole="header">{title}</ScreenTitle>
          {description ? <Body style={styles.description}>{description}</Body> : null}
        </View>
        {trailingAction ? (
          <HeaderActionButton action={trailingAction} actionRef={trailingActionRef} expanded={expanded} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: space.sm },
  titleRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  expandedTitleRow: { flexDirection: 'column', alignItems: 'stretch' },
  copy: { flex: 1, minWidth: 0 },
  description: { marginTop: space.sm, color: colors.muted },
  action: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radii.xs,
  },
  expandedAction: { width: '100%', alignSelf: 'stretch', alignItems: 'flex-end' },
  actionLabel: { color: colors.indigoDeep },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.46 },
});
