import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { categoryMeta, type Category, type PublicProfile } from '@/domain/profile';
import { Body, Heading, Meta } from '@/ui/Type';
import { colors, fonts, radii, space } from '@/ui/tokens';

const publicTone: Record<Category, { accent: string }> = {
  preference: { accent: colors.apricot },
  personality: { accent: colors.brand },
  value: { accent: colors.sage },
  strength: { accent: colors.sky },
  learning: { accent: colors.brand },
  support: { accent: colors.sage },
};

/** 소유자 미리보기와 방문자 화면이 같은 공개 응답을 같은 순서로 그리는 단일 렌더러다. */
export function PublicProfileView({ profile }: { profile: PublicProfile }) {
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.5;

  return (
    <View style={styles.page}>
      <View style={styles.cover}>
        <View style={styles.publicBadge}>
          <MaterialCommunityIcons color={colors.brandDeep} name="earth" size={14} />
          <Text style={styles.publicBadgeText}>공개된 소개</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile.displayName.slice(0, 1)}</Text></View>
        <Heading accessibilityRole="header" style={styles.name}>{profile.displayName}</Heading>
        {profile.intro ? <Body style={styles.intro}>{profile.intro}</Body> : null}
      </View>

      {profile.records.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><MaterialCommunityIcons color={colors.sage} name="sprout-outline" size={24} /></View>
          <Body style={styles.emptyTitle}>아직 꺼내 보여준 소개가 없어요.</Body>
          <Meta>이 사람은 자신의 속도로 소개를 준비하고 있어요.</Meta>
        </View>
      ) : (
        <View style={styles.records}>
          {profile.records.map((record, index) => {
            const tone = publicTone[record.category];
            return (
              <View
                // 공개 DTO에는 내부 식별자가 없으므로 응답 순서와 표시 필드만으로 렌더 key를 만든다.
                key={`${index}:${record.category}:${record.title}`}
                style={[styles.record, { borderLeftColor: tone.accent }]}>
                <View style={[styles.recordHeader, largeText && styles.largeTextRecordHeader]}>
                  <Meta style={styles.category}>{categoryMeta[record.category].label}</Meta>
                  <Meta style={styles.title}>{record.title}</Meta>
                </View>
                <Text style={styles.answer}>{record.answer}</Text>
              </View>
            );
          })}
        </View>
      )}
      <View style={styles.footer}>
        <Meta>비교하지 않고, 나를 소개하는 방식</Meta>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', alignSelf: 'center', gap: space.md },
  cover: { width: '100%', justifyContent: 'flex-end', padding: space.lg, borderColor: colors.line, borderTopColor: colors.brand, borderTopWidth: 4, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1, borderRadius: radii.lg, backgroundColor: colors.white },
  publicBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.xl, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.brandSoft },
  publicBadgeText: { color: colors.brandDeep, fontFamily: fonts.sansBold, fontSize: 12 },
  avatar: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: space.md, borderRadius: 26, backgroundColor: colors.brand },
  avatarText: { color: colors.white, fontFamily: fonts.sansBlack, fontSize: 22 },
  name: { width: '100%', fontSize: 30, lineHeight: 42 },
  intro: { width: '100%', color: colors.mutedInk, marginTop: space.sm },
  records: { gap: space.md },
  record: { width: '100%', justifyContent: 'space-between', gap: space.md, padding: space.lg, borderColor: colors.line, borderLeftWidth: 4, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderRadius: radii.lg, backgroundColor: colors.white },
  recordHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
  largeTextRecordHeader: { flexDirection: 'column', alignItems: 'flex-start' },
  category: { color: colors.ink, fontFamily: fonts.sansBold },
  title: { color: colors.mutedInk },
  answer: { width: '100%', color: colors.ink, fontFamily: fonts.sansBold, fontSize: 22, letterSpacing: -0.6, lineHeight: 34 },
  empty: { width: '100%', alignItems: 'flex-start', justifyContent: 'center', gap: space.sm, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: radii.lg, backgroundColor: colors.white },
  emptyIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm, borderRadius: 24, backgroundColor: colors.sageSoft },
  emptyTitle: { fontFamily: fonts.sansBold, fontSize: 19 },
  footer: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl },
});
