import { StyleSheet, View } from 'react-native';

import { ActionButton, type ActionButtonTone } from '@/ui/ActionButton';
import { Body, SectionTitle } from '@/ui/Type';
import { colors, layout, radii, space } from '@/ui/tokens';

export type StatePanelVariant = 'empty' | 'loading' | 'error' | 'permission' | 'noPublicRecords';

export type StatePanelAction = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone?: ActionButtonTone;
};

export type StatePanelProps = {
  variant: StatePanelVariant;
  title: string;
  description: string;
  action?: StatePanelAction;
  skeletonRows?: number;
  testID?: string;
};

export function StatePanel({
  variant,
  title,
  description,
  action,
  skeletonRows = 2,
  testID,
}: StatePanelProps) {
  const isLoading = variant === 'loading';
  const announcesState = variant === 'error' || variant === 'permission';

  return (
    <View
      accessibilityLabel={isLoading ? '불러오는 중' : undefined}
      accessibilityLiveRegion={announcesState ? 'assertive' : isLoading ? 'polite' : 'none'}
      accessibilityRole={announcesState ? 'alert' : undefined}
      accessibilityState={isLoading ? { busy: true } : undefined}
      style={[styles.panel, variant === 'error' && styles.errorPanel]}
      testID={testID}>
      {isLoading ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.skeletonGroup}>
          <View style={[styles.skeleton, styles.skeletonTitle]} />
          {Array.from({ length: skeletonRows }, (_, index) => (
            <View key={index} style={[styles.skeleton, index === skeletonRows - 1 && styles.skeletonShort]} />
          ))}
        </View>
      ) : (
        <>
          <SectionTitle>{title}</SectionTitle>
          <Body style={styles.description}>{description}</Body>
          {action ? (
            <View style={styles.action}>
              <ActionButton
                disabled={action.disabled}
                fullWidth
                loading={action.loading}
                onPress={action.onPress}
                tone={action.tone ?? 'paper'}>
                {action.label}
              </ActionButton>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    minHeight: layout.statePanelMinHeight,
    justifyContent: 'center',
    padding: space.mdLg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: space.sm,
  },
  errorPanel: { backgroundColor: colors.errorSoft },
  description: { color: colors.muted },
  action: { marginTop: space.sm, width: '100%' },
  skeletonGroup: { gap: space.smMd },
  skeleton: { height: 18, width: '100%', borderRadius: radii.sm, backgroundColor: colors.surfaceMuted },
  skeletonTitle: { height: 31, width: '64%' },
  skeletonShort: { width: '78%' },
});
