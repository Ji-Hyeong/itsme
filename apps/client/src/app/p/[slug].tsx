import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicProfileView } from '@/features/profile/PublicProfileView';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { PaperBackground } from '@/ui/PaperBackground';
import { Body, Heading } from '@/ui/Type';
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
          <View style={styles.messageState}>
            <Heading>이 공개 프로필을 찾지 못했어요.</Heading>
            <Body>주소를 다시 확인해 주세요.</Body>
          </View>
        ) : error && !publicProfile ? (
          <View accessibilityLiveRegion="assertive" style={styles.messageState}>
            <Heading>프로필을 불러오지 못했어요.</Heading>
            <Body>{error}</Body>
            <ActionButton fullWidth onPress={() => void refreshPublic(slug ?? '')} tone="paper">다시 불러오기</ActionButton>
          </View>
        ) : loading || !publicProfile ? (
          <Body accessibilityRole="progressbar">프로필을 불러오는 중…</Body>
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
  messageState: { width: '100%', alignSelf: 'center', alignItems: 'stretch', gap: space.md, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
});
