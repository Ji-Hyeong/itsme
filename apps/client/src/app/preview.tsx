import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicProfileView } from '@/features/profile/PublicProfileView';
import { useAuth } from '@/state/AuthProvider';
import { useItsme } from '@/state/ItsmeProvider';
import { FocusPressable } from '@/ui/FocusPressable';
import { FolioAction, FolioState, PreviewRibbon, useResponsiveGutter } from '@/ui/Folio';
import { PaperBackground } from '@/ui/PaperBackground';
import { Body } from '@/ui/Type';
import { focusTarget } from '@/ui/focus-target';
import { colors, layout, space } from '@/ui/tokens';

export default function PreviewScreen() {
  const router = useRouter();
  const gutter = useResponsiveGutter();
  const previewHeadingRef = useRef<ComponentRef<typeof FocusPressable>>(null);
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

  useEffect(() => {
    // 공개 확인 dialog에서 이동한 사용자가 이전 switch가 아닌 새 화면의 맥락부터 읽도록 한다.
    const timer = setTimeout(() => focusTarget(previewHeadingRef.current), 0);
    return () => clearTimeout(timer);
  }, []);

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
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <PaperBackground />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter }]} testID="preview-scroll">
        <PreviewRibbon ribbonRef={previewHeadingRef} />
        {error && !shownProfile ? (
          <FolioState
            action={{ label: '다시 불러오기', onPress: () => void refresh() }}
            description={error}
            title="공개 모습을 준비하지 못했어요."
            variant="error"
          />
        ) : loading || !shownProfile ? (
          <FolioState skeleton="cover" variant="loading" />
        ) : (
          <View style={styles.rendererFrame} testID="preview-renderer-frame"><PublicProfileView profile={shownProfile} /></View>
        )}
        {error && shownProfile ? <Body accessibilityLiveRegion="assertive" style={styles.error}>{error}</Body> : null}
        <View style={styles.actions}>
          <FolioAction loading={visibilityPreview ? saving : false} onPress={visibilityPreview
            ? () => void publishPreview()
            : user && publicProfile
              ? () => router.push({ pathname: '/p/[slug]', params: { slug: user.slug } })
              : closePreview}>
            {visibilityPreview ? (saving ? '공개하는 중…' : '이대로 공개하기') : user && publicProfile ? '방문자 화면 열기' : '미리보기 닫기'}
          </FolioAction>
          {visibilityPreview || (user && publicProfile) ? (
            <FolioAction disabled={saving} onPress={closePreview} tone="quiet">
              {visibilityPreview ? '선택으로 돌아가기' : '미리보기 닫기'}
            </FolioAction>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: layout.maxContent, alignSelf: 'center', paddingTop: space.sm, paddingBottom: space.xxxl },
  rendererFrame: { flexGrow: 1, width: '100%', padding: space.sm, backgroundColor: colors.surfaceRaised },
  actions: { width: '100%', gap: space.xs, marginTop: space.lg },
  error: { color: colors.error, marginTop: space.md },
});
