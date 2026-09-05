import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicProfileView } from '@/features/profile/PublicProfileView';
import { useAuth } from '@/state/AuthProvider';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { PaperBackground } from '@/ui/PaperBackground';
import { Body, Heading } from '@/ui/Type';
import { colors, fonts, layout, space } from '@/ui/tokens';

export default function PreviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    publicProfile,
    visibilityPreview,
    loading,
    saving,
    error,
    clearError,
    refresh,
    clearVisibilityPreview,
    setVisibility,
  } = useItsme();
  const shownProfile = visibilityPreview?.profile ?? publicProfile;

  const closePreview = () => {
    clearError();
    if (visibilityPreview) {
      clearVisibilityPreview();
      router.replace('/share');
      return;
    }
    router.back();
  };

  const publishPreview = async () => {
    if (!visibilityPreview) return;
    const published = await setVisibility({
      recordId: visibilityPreview.recordId,
      visibility: 'public',
      previewToken: visibilityPreview.previewToken,
    });
    if (published) {
      clearVisibilityPreview();
      router.replace('/share');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PaperBackground />
      <View accessibilityLiveRegion="polite" style={styles.previewBanner}>
        <Text style={styles.previewLabel}>공개 모습 미리보기</Text>
        <Text style={styles.previewDescription}>방문자가 보게 될 화면과 같은 모습이에요.</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && !shownProfile ? (
          <View accessibilityLiveRegion="assertive" style={styles.errorState}>
            <Heading>공개 모습을 준비하지 못했어요.</Heading>
            <Body>{error}</Body>
            <ActionButton fullWidth onPress={() => void refresh()} tone="paper">다시 불러오기</ActionButton>
          </View>
        ) : loading || !shownProfile ? (
          <Body accessibilityRole="progressbar">공개 모습을 준비하는 중…</Body>
        ) : (
          <PublicProfileView profile={shownProfile} />
        )}
        {error && shownProfile ? <Body accessibilityLiveRegion="assertive" style={styles.error}>{error}</Body> : null}
        <View style={styles.actions}>
          <ActionButton disabled={saving} fullWidth onPress={closePreview} tone="paper">
            {visibilityPreview ? '취소하고 선택으로 돌아가기' : '선택 다시 보기'}
          </ActionButton>
          {visibilityPreview ? (
            <ActionButton fullWidth loading={saving} onPress={() => void publishPreview()}>
              이대로 공개하기
            </ActionButton>
          ) : user && publicProfile ? (
            <ActionButton
              fullWidth
              onPress={() => router.push({ pathname: '/p/[slug]', params: { slug: user.slug } })}>
              방문자 화면 열기
            </ActionButton>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  previewBanner: { width: '100%', alignItems: 'flex-start', gap: space.xs, paddingHorizontal: layout.mobileGutter, paddingVertical: space.md, borderBottomColor: colors.line, borderBottomWidth: 1, backgroundColor: colors.white },
  previewLabel: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 13 },
  previewDescription: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 12 },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: layout.maxContent, alignSelf: 'center', paddingHorizontal: layout.mobileGutter, paddingTop: space.lg, paddingBottom: space.xxxl },
  errorState: { width: '100%', alignItems: 'stretch', gap: space.md, paddingVertical: space.xl },
  error: { color: colors.error, marginTop: space.md },
  actions: { width: '100%', alignItems: 'stretch', gap: space.sm, marginTop: space.xl, paddingTop: space.lg, borderTopColor: colors.line, borderTopWidth: 1 },
});
