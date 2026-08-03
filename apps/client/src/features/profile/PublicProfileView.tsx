import { StyleSheet, View } from 'react-native';

import { categoryMeta, type Category, type PublicProfile } from '@/domain/profile';
import { BrandLogo } from '@/ui/BrandLogo';
import { SceneCard } from '@/ui/SceneCard';
import { StatePanel } from '@/ui/StatePanel';
import { Body, Meta, ProfileName } from '@/ui/Type';
import { colors, radii, space } from '@/ui/tokens';

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
  return (
    <View style={styles.page}>
      <View style={styles.cover}>
        <ProfileName accessibilityRole="header" style={styles.name}>{profile.displayName}</ProfileName>
        {profile.intro ? <Body style={styles.intro}>{profile.intro}</Body> : null}
      </View>

      {profile.records.length === 0 ? (
        <StatePanel
          description="이름과 한 줄 소개만 보여요."
          title="공개한 기록은 아직 없어요."
          variant="noPublicRecords"
        />
      ) : (
        <View style={styles.records}>
          {profile.records.map((record, index) => {
            const tone = publicTone[record.category];
            return (
              <SceneCard
                accentColor={tone.accent}
                answer={record.answer}
                category={categoryMeta[record.category].label}
                // 공개 DTO에는 내부 식별자가 없으므로 응답 순서와 표시 필드만으로 렌더 key를 만든다.
                key={`${index}:${record.category}:${record.title}`}
                title={record.title}
                variant="public"
              />
            );
          })}
        </View>
      )}
      <View style={styles.footer}>
        <BrandLogo size={28} />
        <Meta>비교하지 않고, 나를 소개하는 방식</Meta>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', alignSelf: 'center', gap: space.md },
  cover: { width: '100%', minHeight: 280, justifyContent: 'flex-end', padding: space.lg, borderColor: colors.line, borderTopColor: colors.brand, borderTopWidth: 4, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1, borderRadius: radii.xl, backgroundColor: colors.white },
  name: { width: '100%' },
  intro: { width: '100%', color: colors.mutedInk, marginTop: space.sm },
  records: { gap: space.md },
  footer: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl },
});
