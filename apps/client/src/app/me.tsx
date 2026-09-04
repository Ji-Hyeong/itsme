import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PortraitCanvas } from '@/features/profile/PortraitCanvas';
import { useItsme } from '@/state/ItsmeProvider';
import { AppShell } from '@/ui/AppShell';
import { FocusPressable } from '@/ui/FocusPressable';
import { FolioCover, FolioHeader, FolioState } from '@/ui/Folio';
import { Screen } from '@/ui/Screen';
import { Body, Control, Meta, SectionTitle } from '@/ui/Type';
import { colors, space } from '@/ui/tokens';

export default function MeScreen() {
  const router = useRouter();
  const { profile, loading, error, refresh } = useItsme();
  const records = profile?.records ?? [];
  const hasRecords = records.length > 0;

  return (
    <AppShell>
      <Screen>
        <FolioHeader
          heading={false}
          title="나"
          trailingAction={{ label: '계정', accessibilityLabel: '계정 설정', onPress: () => router.push('./account') }}
        />
        {loading && !profile ? <FolioState skeleton="cover" variant="loading" /> : null}
        {profile ? (
          <>
            <View style={styles.coverSpacing}>
              <FolioCover
                displayName={profile.displayName}
                intro={profile.intro}
              />
            </View>
            <Meta style={styles.publicInfo}>이름과 한 줄 소개는 공개 프로필에 보여요.</Meta>
          </>
        ) : null}

        {profile ? (
          <View style={styles.sectionHead}>
            <SectionTitle>요즘의 문장들</SectionTitle>
            <Meta>새 문장은 먼저 나만 볼 수 있어요.</Meta>
          </View>
        ) : null}

        {!loading && error ? (
          <FolioState action={{ label: '다시 불러오기', onPress: () => void refresh() }} description={error} title="기록을 불러오지 못했어요." variant="error" />
        ) : null}
        {!loading && !error && profile ? <PortraitCanvas records={records} /> : null}

        {!loading && !error && hasRecords ? (
          <View style={styles.questionPrompt}>
            <Meta style={styles.questionKicker}>오늘 머문 질문</Meta>
            <Body style={styles.questionIntro}>오늘은 이런 나를 만나볼까요?</Body>
            <FocusPressable
              accessibilityRole="button"
              onPress={() => router.push('/discover')}
              style={({ pressed }) => [styles.questionAction, pressed && styles.pressed]}>
              <Control style={styles.questionText}>요즘 자꾸 눈이 가는 색은 무엇인가요?</Control>
            </FocusPressable>
          </View>
        ) : null}

        {!loading && !error && profile ? (
          <FocusPressable
            accessibilityLabel="다른 사람이 보는 공개 모습 미리보기"
            accessibilityRole="button"
            onPress={() => router.push('/preview')}
            style={({ pressed }) => [styles.previewAction, pressed && styles.pressed]}>
            <Control style={styles.previewLabel}>공개할 모습 살펴보기</Control>
          </FocusPressable>
        ) : null}
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  coverSpacing: { width: '100%', marginTop: space.smMd },
  publicInfo: { color: colors.muted, marginTop: space.sm, paddingHorizontal: space.xs },
  sectionHead: { gap: space.xs, marginTop: space.lg },
  questionPrompt: { width: '100%', gap: space.xs, marginTop: space.lg, paddingVertical: space.mdLg, borderTopColor: colors.lineSubtle, borderTopWidth: 1, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1 },
  questionKicker: { color: colors.apricot, fontFamily: 'Pretendard_700Bold' },
  questionIntro: { color: colors.muted },
  questionAction: { minHeight: 44, justifyContent: 'center' },
  questionText: { color: colors.indigoDeep },
  previewAction: { minHeight: 48, justifyContent: 'center', marginTop: space.md },
  previewLabel: { color: colors.indigoDeep },
  pressed: { opacity: 0.68 },
});
