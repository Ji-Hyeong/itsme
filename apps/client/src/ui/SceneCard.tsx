import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';

import { FocusPressable } from '@/ui/FocusPressable';
import { Control, Meta, SceneAnswer } from '@/ui/Type';
import { colors, layout, radii, space } from '@/ui/tokens';

export type SceneVisibility = 'private' | 'public';

export type SceneCardProps = {
  category: string;
  answer: string;
  title?: string;
  date?: string;
  visibility?: SceneVisibility;
  variant?: 'owner' | 'public';
  accentColor?: string;
  truncateAnswer?: boolean;
  onPress?: () => void;
  testID?: string;
};

function visibilityLabel(visibility: SceneVisibility) {
  return visibility === 'public' ? '공개' : '나만 보기';
}

export function SceneCard({
  category,
  answer,
  title,
  date,
  visibility,
  variant = 'owner',
  accentColor = colors.indigo,
  truncateAnswer = true,
  onPress,
  testID,
}: SceneCardProps) {
  const { fontScale } = useWindowDimensions();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [measuredLong, setMeasuredLong] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const largeText = fontScale >= layout.largeTextScale;
  const canTruncate = truncateAnswer && !largeText && !screenReaderEnabled && !expanded;
  const likelyLong = answer.length > 72 || answer.split(/\r?\n/).length > 4;
  const showReadMore = canTruncate && (measuredLong || likelyLong);
  const status = visibility ? visibilityLabel(visibility) : undefined;
  const accessibilityName = [category, answer, status, date].filter(Boolean).join(', ');

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (mounted) setScreenReaderEnabled(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const onTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    if (event.nativeEvent.lines.length > 4) setMeasuredLong(true);
  };

  const content = (
    <>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.accent, { backgroundColor: accentColor }]} />
      <Meta style={styles.category}>{category}</Meta>
      <SceneAnswer numberOfLines={canTruncate ? 4 : undefined} onTextLayout={onTextLayout}>
        {answer}
      </SceneAnswer>
      {showReadMore ? (
        onPress ? (
          <Control style={styles.readMoreHint}>이어 읽기 · 상세에서 보기</Control>
        ) : (
          <FocusPressable
            accessibilityLabel="답변 이어 읽기"
            accessibilityRole="button"
            onPress={() => setExpanded(true)}
            style={({ pressed }) => [styles.readMoreButton, pressed && styles.pressed]}>
            <Control style={styles.readMoreHint}>이어 읽기</Control>
          </FocusPressable>
        )
      ) : null}
      {title || date ? (
        <View style={[styles.detailRow, largeText && styles.stackedRow]}>
          {title ? <Meta style={styles.detail}>{title}</Meta> : null}
          {date ? <Meta style={styles.detail}>{date}</Meta> : null}
        </View>
      ) : null}
      {visibility ? (
        <View style={styles.visibility}>
          <Ionicons
            accessibilityElementsHidden
            color={colors.muted}
            importantForAccessibility="no-hide-descendants"
            name={visibility === 'public' ? 'eye-outline' : 'lock-closed-outline'}
            size={16}
          />
          <Meta style={styles.visibilityText}>{status}</Meta>
        </View>
      ) : null}
    </>
  );

  const cardStyle = [
    styles.card,
    variant === 'public' ? styles.publicCard : styles.ownerCard,
  ];

  if (onPress) {
    return (
      <FocusPressable
        accessibilityHint={showReadMore ? '두 번 탭하면 전체 기록을 봅니다.' : undefined}
        accessibilityLabel={accessibilityName}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        testID={testID}>
        {content}
      </FocusPressable>
    );
  }

  return <View style={cardStyle} testID={testID}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: space.mdLg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: space.smMd,
  },
  ownerCard: { minHeight: layout.sceneCardMinHeight },
  publicCard: { minHeight: layout.publicSceneCardMinHeight },
  accent: { width: '100%', height: 4, borderRadius: 2 },
  category: { color: colors.muted },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  stackedRow: { flexDirection: 'column', alignItems: 'flex-start' },
  detail: { flexShrink: 1, color: colors.muted },
  visibility: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  visibilityText: { color: colors.muted },
  readMoreButton: {
    minHeight: layout.minTouch,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  readMoreHint: { color: colors.indigoDeep },
  pressed: { opacity: 0.72 },
});
