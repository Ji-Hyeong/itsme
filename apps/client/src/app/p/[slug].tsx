import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicProfileView } from '@/features/profile/PublicProfileView';
import { useItsme } from '@/state/ItsmeProvider';
import { PaperBackground } from '@/ui/PaperBackground';
import { StatePanel } from '@/ui/StatePanel';
import { colors, fonts, layout, space } from '@/ui/tokens';

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { publicProfile, loading, error, refreshPublic } = useItsme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <PaperBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandRow}><Text style={styles.brandNote}>공개 프로필</Text></View>
        {!slug ? (
          <StatePanel
            description="주소를 다시 확인해 주세요."
            title="이 공개 프로필을 찾지 못했어요."
            variant="permission"
          />
        ) : error && !publicProfile ? (
          <StatePanel
            action={{ label: '다시 불러오기', onPress: () => void refreshPublic(slug) }}
            description={error}
            title="프로필을 불러오지 못했어요."
            variant="error"
          />
        ) : loading || !publicProfile ? (
          <StatePanel description="" skeletonRows={3} title="" variant="loading" />
        ) : (
          <PublicProfileView profile={publicProfile} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: layout.maxContent, alignSelf: 'center', paddingHorizontal: layout.mobileGutter, paddingTop: space.md, paddingBottom: space.xxxl },
  brandRow: { width: '100%', minHeight: 44, justifyContent: 'center', marginBottom: space.md, borderBottomColor: colors.line, borderBottomWidth: 1 },
  brandNote: { color: colors.mutedInk, fontFamily: fonts.sansBold, fontSize: 13 },
});
