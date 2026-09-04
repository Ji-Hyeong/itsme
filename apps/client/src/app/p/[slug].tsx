import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicProfileView } from '@/features/profile/PublicProfileView';
import { useItsme } from '@/state/ItsmeProvider';
import { PaperBackground } from '@/ui/PaperBackground';
import { FolioState, useResponsiveGutter } from '@/ui/Folio';
import { colors, layout, space } from '@/ui/tokens';

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { publicProfile, loading, error, refreshPublic } = useItsme();
  const gutter = useResponsiveGutter();
  const notFound = Boolean(error?.includes('찾') || error?.includes('존재하지'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <PaperBackground />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter }]}>
        {!slug ? (
          <FolioState
            description="주소를 다시 확인해 주세요."
            title="이 공개 프로필을 찾지 못했어요."
            variant="permission"
          />
        ) : error && !publicProfile ? (
          <FolioState
            action={{ label: '다시 불러오기', onPress: () => void refreshPublic(slug) }}
            description={error}
            title={notFound ? '이 공개 프로필을 찾지 못했어요.' : '공개 프로필을 불러오지 못했어요.'}
            variant={notFound ? 'permission' : 'error'}
          />
        ) : loading || !publicProfile ? (
          <FolioState skeleton="cover" variant="loading" />
        ) : (
          <PublicProfileView profile={publicProfile} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: layout.maxContent, alignSelf: 'center', paddingTop: space.md, paddingBottom: space.xxxl },
});
