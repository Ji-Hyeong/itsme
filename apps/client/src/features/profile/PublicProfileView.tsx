import { StyleSheet, View } from 'react-native';

import { categoryMeta, type Category, type PublicProfile } from '@/domain/profile';
import { BrandLogo } from '@/ui/BrandLogo';
import { categoryStyle } from '@/features/profile/category-style';
import { FolioCover, FolioEntry, FolioState } from '@/ui/Folio';
import { colors, space } from '@/ui/tokens';

const publicTone: Record<Category, { accent: string }> = {
  preference: { accent: colors.apricot },
  personality: { accent: colors.brand },
  value: { accent: colors.sage },
  strength: { accent: colors.sky },
  learning: { accent: colors.brand },
  support: { accent: colors.sage },
};

/** 소유자 미리보기와 방문자 화면이 같은 공개 응답을 같은 순서로 그리는 단일 렌더러다. */
export function PublicFolioRenderer({ profile }: { profile: PublicProfile }) {
  return (
    <View style={styles.page} testID="public-folio-page">
      <FolioCover displayName={profile.displayName} intro={profile.intro} />

      {profile.records.length === 0 ? (
        <FolioState title="공개한 문장은 아직 없어요." variant="empty" />
      ) : (
        <View style={styles.records}>
          {profile.records.map((record, index) => {
            const tone = publicTone[record.category];
            return (
              <FolioEntry
                accentColor={tone.accent}
                answer={record.answer}
                category={categoryMeta[record.category].label}
                index={categoryStyle[record.category].folioIndex}
                // 공개 DTO에는 내부 식별자가 없으므로 응답 순서와 표시 필드만으로 렌더 key를 만든다.
                key={`${index}:${record.category}:${record.title}`}
                title={record.title}
              />
            );
          })}
        </View>
      )}
      <View style={styles.footer} testID="public-folio-footer">
        <BrandLogo size={28} />
      </View>
    </View>
  );
}

// 이전 import 이름은 renderer 단일화 테스트와 점진적 화면 이전을 위해 동일 구현을 가리킨다.
export const PublicProfileView = PublicFolioRenderer;

const styles = StyleSheet.create({
  page: { flexGrow: 1, width: '100%', alignSelf: 'center', gap: space.sm },
  records: { width: '100%' },
  footer: { alignItems: 'center', gap: space.xs, marginTop: 'auto', paddingTop: space.xl, paddingBottom: space.md },
});
