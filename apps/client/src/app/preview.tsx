import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicProfileView } from '@/features/profile/PublicProfileView';
import { useAuth } from '@/state/AuthProvider';
import { useItsme } from '@/state/ItsmeProvider';
import { BottomActionBar } from '@/ui/BottomActionBar';
import { FocusPressable } from '@/ui/FocusPressable';
import { PaperBackground } from '@/ui/PaperBackground';
import { StatePanel } from '@/ui/StatePanel';
import { Body } from '@/ui/Type';
import { focusTarget } from '@/ui/focus-target';
import { colors, fonts, layout, space } from '@/ui/tokens';

export default function PreviewScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= layout.largeTextScale;
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

  const actionBar = (
    <BottomActionBar
      contained={largeText}
      forceInFlow={largeText}
      primary={visibilityPreview
        ? { label: '이대로 공개하기', loading: saving, onPress: () => void publishPreview() }
        : user && publicProfile
          ? { label: '방문자 화면 열기', onPress: () => router.push({ pathname: '/p/[slug]', params: { slug: user.slug } }) }
          : { label: '미리보기 닫기', onPress: closePreview }}
      secondary={visibilityPreview
        ? { label: '선택으로 돌아가기', disabled: saving, onPress: closePreview }
        : user && publicProfile
          ? { label: '미리보기 닫기', onPress: closePreview }
          : undefined}
    />
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <PaperBackground />
      <FocusPressable
        accessibilityLabel="미리보기 중. 다른 사람에게도 아래 모습 그대로 보여요."
        accessibilityLiveRegion="polite"
        accessibilityRole="header"
        focusable
        ref={previewHeadingRef}
        style={({ focused }) => [styles.previewBanner, focused && styles.previewBannerFocused]}>
        <Text style={styles.previewLabel}>미리보기 중</Text>
        <Text style={styles.previewDescription}>다른 사람에게도 아래 모습 그대로 보여요.</Text>
      </FocusPressable>
      <ScrollView contentContainerStyle={[styles.scrollContent, !largeText && styles.scrollContentWithAction]}>
        {error && !shownProfile ? (
          <StatePanel
            action={{ label: '다시 불러오기', onPress: () => void refresh() }}
            description={error}
            title="공개 모습을 준비하지 못했어요."
            variant="error"
          />
        ) : loading || !shownProfile ? (
          <StatePanel description="" title="" variant="loading" />
        ) : (
          <PublicProfileView profile={shownProfile} />
        )}
        {error && shownProfile ? <Body accessibilityLiveRegion="assertive" style={styles.error}>{error}</Body> : null}
        {largeText ? actionBar : null}
      </ScrollView>
      {!largeText ? actionBar : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  previewBanner: { width: '100%', alignItems: 'flex-start', gap: space.xs, paddingHorizontal: layout.mobileGutter, paddingVertical: space.md, borderBottomColor: colors.line, borderBottomWidth: 1, backgroundColor: colors.white },
  previewBannerFocused: { outlineColor: colors.focus, outlineOffset: -3, outlineStyle: 'solid', outlineWidth: 3 },
  previewLabel: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 13 },
  previewDescription: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 12 },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: layout.maxContent, alignSelf: 'center', paddingHorizontal: layout.mobileGutter, paddingTop: space.lg, paddingBottom: space.xxxl },
  scrollContentWithAction: { paddingBottom: 152 },
  error: { color: colors.error, marginTop: space.md },
});
