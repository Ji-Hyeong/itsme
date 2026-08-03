import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PortraitCanvas } from '@/features/profile/PortraitCanvas';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { BrandLogo } from '@/ui/BrandLogo';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Body, Meta } from '@/ui/Type';
import { colors, fonts, radii, space } from '@/ui/tokens';

export default function MeScreen() {
  const router = useRouter();
  const { profile, loading, error, refresh } = useItsme();
  const records = profile?.records ?? [];
  const hasRecords = records.length > 0;

  return (
    <AppShell>
      <Screen>
        <ScreenHeader
          title="지금의 나"
          trailingAction={{ label: '계정', accessibilityLabel: '계정 설정', onPress: () => router.push('./account') }}
        />

        <View style={styles.cover}>
          <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.mark}>
            <BrandLogo markOnly size={40} />
          </View>
          <View>
            <Text style={styles.coverName}>{profile?.displayName ?? '지금의 나'}</Text>
            {profile?.intro ? <Body style={styles.intro}>{profile.intro}</Body> : null}
          </View>
        </View>
        <View style={styles.publicInfo}>
          <MaterialCommunityIcons accessible={false} color={colors.brandDeep} name="information-outline" size={18} />
          <Meta style={styles.publicInfoText}>이름과 한 줄 소개는 공개 프로필에 보여요.</Meta>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>내가 남긴 장면</Text>
          <Meta>아래 기록은 항목마다 공개 범위를 고를 수 있어요. 새 기록은 나만 보기로 시작해요.</Meta>
        </View>

        {loading ? <LoadingPortrait /> : null}
        {!loading && error ? (
          <View accessibilityLiveRegion="polite" style={styles.messageBox}>
            <Text style={styles.errorTitle}>기록을 불러오지 못했어요.</Text>
            <Meta>{error}</Meta>
            <ActionButton fullWidth onPress={() => void refresh()} tone="paper">다시 불러오기</ActionButton>
          </View>
        ) : null}
        {!loading && !error ? <PortraitCanvas records={records} /> : null}

        {!loading && !error && hasRecords ? (
          <View style={styles.questionCard}>
            <View style={styles.questionHead}>
              <MaterialCommunityIcons color={colors.brand} name="comment-question-outline" size={20} />
              <Meta style={styles.questionKicker}>오늘의 질문</Meta>
            </View>
            <Text style={styles.questionTitle}>요즘의 나를 한 문장 더 알아볼까요?</Text>
            <Body style={styles.questionBody}>한 줄만 남겨도 충분하고, 오늘은 그냥 지나가도 괜찮아요.</Body>
            <ActionButton fullWidth onPress={() => router.push('/discover')}>질문 만나기</ActionButton>
          </View>
        ) : null}

        {!loading && !error ? (
          <ActionButton
            accessibilityLabel="다른 사람이 보는 공개 모습 미리보기"
            fullWidth
            onPress={() => router.push('/preview')}
            style={styles.previewAction}
            tone="paper">
            공개 모습 미리보기
          </ActionButton>
        ) : null}
      </Screen>
    </AppShell>
  );
}

function LoadingPortrait() {
  return (
    <View accessibilityLabel="현재의 나를 불러오는 중" accessibilityRole="progressbar" style={styles.loading}>
      <View style={styles.loadingBlock} />
      <View style={styles.loadingBlock} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', minHeight: 280, justifyContent: 'space-between', marginTop: space.lg, padding: space.lg, borderRadius: radii.xl, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 },
  mark: { opacity: 0.92 },
  coverName: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 32, letterSpacing: -1, lineHeight: 42 },
  intro: { color: colors.mutedInk, marginTop: space.xs },
  publicInfo: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginTop: space.md, paddingHorizontal: space.xs },
  publicInfoText: { flex: 1, color: colors.mutedInk },
  sectionHead: { gap: space.xs, marginTop: space.xl },
  sectionTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 22, letterSpacing: -0.6, lineHeight: 31 },
  loading: { width: '100%', gap: 12, marginTop: space.md },
  loadingBlock: { width: '100%', height: 168, borderRadius: radii.lg, backgroundColor: colors.paperDeep },
  messageBox: { width: '100%', gap: space.md, marginTop: space.md, padding: 20, borderRadius: radii.lg, backgroundColor: colors.errorSoft },
  errorTitle: { color: colors.error, fontFamily: fonts.sansBold, fontSize: 18 },
  questionCard: { width: '100%', gap: 10, marginTop: space.xl, marginBottom: space.md, padding: 20, borderRadius: radii.lg, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 },
  questionHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  questionKicker: { color: colors.brandDeep, fontFamily: fonts.sansBold },
  questionTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 20, letterSpacing: -0.5, lineHeight: 30 },
  questionBody: { color: colors.mutedInk, marginBottom: space.sm },
  previewAction: { marginTop: space.lg },
});
