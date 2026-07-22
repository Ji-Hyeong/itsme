import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { categoryMeta, getCurrentVersion, type Category, type OwnerRecord } from '@/domain/profile';
import { FocusPressable } from '@/ui/FocusPressable';
import { Body, Meta } from '@/ui/Type';
import { colors, fonts, radii, space } from '@/ui/tokens';

const categoryTone: Record<Category, { accent: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  preference: { accent: colors.sage, icon: 'heart-outline' },
  personality: { accent: colors.brand, icon: 'creation-outline' },
  value: { accent: colors.sage, icon: 'compass-outline' },
  strength: { accent: colors.brand, icon: 'arm-flex-outline' },
  learning: { accent: colors.sage, icon: 'sprout-outline' },
  support: { accent: colors.apricot, icon: 'hand-heart-outline' },
};

const emptyPrompts = ['요즘 자꾸 눈이 가는 것은?', '천천히 배우고 싶은 것은?'];

function formatRecordedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(value));
}

/** 모바일에서는 모든 범주를 같은 크기로 보여 첫 기록에 임의의 우선순위를 만들지 않는다. */
export function PortraitCanvas({ records }: { records: readonly OwnerRecord[] }) {
  const router = useRouter();

  if (records.length === 0) {
    return (
      <View accessibilityLabel="아직 남긴 기록이 없는 현재의 나" style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>어떤 사람인지 아직 다 정하지 않아도 괜찮아요.</Text>
        <Body style={styles.emptyBody}>지금 편한 질문 하나만 골라 천천히 시작해 보세요.</Body>
        <View style={styles.promptList}>
          {emptyPrompts.map((prompt) => (
            <FocusPressable
              accessibilityHint="질문 화면으로 이동합니다"
              accessibilityRole="button"
              key={prompt}
              onPress={() => router.push('/discover')}
              style={({ focused, pressed }) => [styles.prompt, focused && styles.focused, pressed && styles.pressed]}>
              <Text style={styles.promptText}>{prompt}</Text>
              <MaterialCommunityIcons color={colors.brand} name="arrow-right" size={18} />
            </FocusPressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View accessibilityLabel="현재의 나를 이루는 기록" style={styles.list}>
      {records.map((record) => {
        const current = getCurrentVersion(record);
        const tone = categoryTone[record.category];
        return (
          <FocusPressable
            accessibilityHint="기록 상세로 이동합니다"
            accessibilityLabel={`${categoryMeta[record.category].label}, ${current.answer}, ${record.visibility === 'private' ? '나만 보기' : '공개'}`}
            accessibilityRole="button"
            key={record.id}
            onPress={() => router.push({ pathname: '/record/[id]', params: { id: record.id } })}
            style={({ focused, pressed }) => [
              styles.card,
              { borderLeftColor: tone.accent },
              focused && styles.focused,
              pressed && styles.pressed,
            ]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons color={tone.accent} name={tone.icon} size={18} />
              <Meta style={styles.category}>{categoryMeta[record.category].label}</Meta>
              <View style={styles.visibilityBadge}>
                <MaterialCommunityIcons color={colors.mutedInk} name={record.visibility === 'private' ? 'lock-outline' : 'earth'} size={13} />
                <Text style={styles.visibilityText}>{record.visibility === 'private' ? '나만 보기' : '공개'}</Text>
              </View>
            </View>
            <Text style={styles.answer}>{current.answer}</Text>
            <View style={styles.cardFooter}>
              <Meta>{record.title}</Meta>
              <Meta>{formatRecordedAt(current.recordedAt)}에 바꿈</Meta>
            </View>
          </FocusPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { width: '100%', gap: 12, marginTop: space.md },
  card: { width: '100%', minHeight: 168, justifyContent: 'space-between', gap: space.md, padding: 20, borderColor: colors.line, borderWidth: 1, borderLeftWidth: 4, borderRadius: radii.lg, backgroundColor: colors.white },
  cardHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
  category: { color: colors.ink, fontFamily: fonts.sansBold },
  visibilityBadge: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: 'auto' },
  visibilityText: { color: colors.mutedInk, fontFamily: fonts.sansMedium, fontSize: 11 },
  answer: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 24, letterSpacing: -0.5, lineHeight: 36 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: space.sm, paddingTop: 12, borderTopColor: colors.line, borderTopWidth: 1 },
  emptyCard: { width: '100%', marginTop: space.md, padding: 20, borderRadius: radii.lg, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 22, letterSpacing: -0.6, lineHeight: 32 },
  emptyBody: { color: colors.mutedInk, marginTop: space.sm },
  promptList: { gap: space.sm, marginTop: space.lg },
  prompt: { width: '100%', minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, paddingHorizontal: space.md, paddingVertical: 12, borderRadius: radii.md, backgroundColor: colors.surfaceMuted, borderColor: 'transparent', borderWidth: 2 },
  promptText: { flex: 1, color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 23 },
  focused: { borderColor: colors.focus, borderWidth: 2 },
  pressed: { opacity: 0.72 },
});
