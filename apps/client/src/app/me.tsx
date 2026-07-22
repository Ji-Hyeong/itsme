import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PortraitCanvas } from '@/features/profile/PortraitCanvas';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { BrandLogo } from '@/ui/BrandLogo';
import { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { Body, Meta } from '@/ui/Type';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

function formatCurrentMonth() {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(new Date());
}

export default function MeScreen() {
  const router = useRouter();
  const { profile, loading, error, refresh } = useItsme();
  const records = profile?.records ?? [];
  const hasRecords = records.length > 0;

  return (
    <AppShell>
      <Screen>
        <View style={styles.pageHead}>
          <View>
            <Text style={styles.pageTitle}>내 프로필</Text>
            <Meta>{formatCurrentMonth()}</Meta>
          </View>
          <FocusPressable
            accessibilityLabel="계정 설정"
            accessibilityRole="button"
            onPress={() => router.push('./account')}
            style={({ focused, pressed }) => [styles.accountLink, focused && styles.focused, pressed && styles.pressed]}>
            <Text style={styles.accountLinkText}>계정</Text>
          </FocusPressable>
          <FocusPressable
            accessibilityLabel="다른 사람이 보는 공개 모습"
            accessibilityRole="button"
            onPress={() => router.push('/preview')}
            style={({ focused, pressed }) => [styles.publicLink, focused && styles.focused, pressed && styles.pressed]}>
            <MaterialCommunityIcons color={colors.brand} name="eye-outline" size={18} />
            <Text style={styles.publicLinkText}>공개 모습</Text>
          </FocusPressable>
        </View>

        <View style={styles.cover}>
          <View style={styles.coverTop}>
            <View style={styles.mark}><BrandLogo markOnly size={54} /></View>
            <View style={styles.coverBadge}>
              <MaterialCommunityIcons color={colors.mutedInk} name="lock-outline" size={13} />
              <Text style={styles.coverBadgeText}>나만 보기</Text>
            </View>
          </View>
          <View>
            <Text accessibilityRole="header" style={styles.coverName}>{profile?.displayName ?? '지금의 나'}</Text>
            <Body style={styles.intro}>{profile?.intro ?? '나를 설명하는 말은 언제든 달라져도 괜찮아요.'}</Body>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{hasRecords ? '내가 남긴 장면' : '지금부터 알아갈 나'}</Text>
          {hasRecords ? <Meta>기록을 누르면 그때의 맥락과 변화를 볼 수 있어요.</Meta> : null}
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
  pageHead: { minHeight: 52, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  pageTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 21, letterSpacing: -0.5 },
  publicLink: { minHeight: layout.minTouch, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: 10, borderColor: 'transparent', borderWidth: 2, borderRadius: radii.md },
  publicLinkText: { color: colors.brandDeep, fontFamily: fonts.sansBold, fontSize: 14 },
  accountLink: { minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', paddingHorizontal: 10, borderColor: 'transparent', borderWidth: 2, borderRadius: radii.md },
  accountLinkText: { color: colors.mutedInk, fontFamily: fonts.sansBold, fontSize: 14 },
  cover: { width: '100%', minHeight: 260, justifyContent: 'space-between', padding: space.lg, borderRadius: radii.xl, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 },
  coverTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  mark: { opacity: 0.92 },
  coverBadge: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: 10, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  coverBadgeText: { color: colors.mutedInk, fontFamily: fonts.sansMedium, fontSize: 12 },
  coverName: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 32, letterSpacing: -1, lineHeight: 42 },
  intro: { color: colors.mutedInk, marginTop: space.xs },
  sectionHead: { gap: space.xs, marginTop: space.xl },
  sectionTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 22, letterSpacing: -0.6, lineHeight: 31 },
  loading: { width: '100%', gap: 12, marginTop: space.md },
  loadingBlock: { width: '100%', height: 168, borderRadius: radii.lg, backgroundColor: colors.paperDeep },
  messageBox: { width: '100%', gap: space.md, marginTop: space.md, padding: 20, borderRadius: radii.lg, backgroundColor: colors.errorSoft },
  errorTitle: { color: colors.error, fontFamily: fonts.sansBold, fontSize: 18 },
  questionCard: { width: '100%', gap: 10, marginTop: space.xl, padding: 20, borderRadius: radii.lg, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 },
  questionHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  questionKicker: { color: colors.brandDeep, fontFamily: fonts.sansBold },
  questionTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 20, letterSpacing: -0.5, lineHeight: 30 },
  questionBody: { color: colors.mutedInk, marginBottom: space.sm },
  focused: { borderColor: colors.focus },
  pressed: { opacity: 0.66 },
});
