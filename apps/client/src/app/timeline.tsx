import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { categoryMeta } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { Screen } from '@/ui/Screen';
import { Body, Display, Eyebrow, Meta } from '@/ui/Type';
import { colors, fonts, space } from '@/ui/tokens';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(value),
  );
}

export default function TimelineScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.5;
  const { profile, loading, error, refresh } = useItsme();
  const changedRecords = profile?.records.filter((record) => record.versions.length > 1) ?? [];

  return (
    <AppShell>
      <Screen>
        <Eyebrow>변화 기록</Eyebrow>
        <Display accessibilityRole="header">변화는 기록이 된다</Display>
        <Body style={styles.intro}>달라진 문장을 보여드릴게요. 그 변화의 의미는 오직 내가 정해요.</Body>

        {loading ? <Body accessibilityRole="progressbar" style={styles.state}>시간을 펼치는 중…</Body> : null}
        {!loading && error && !profile ? (
          <View accessibilityLiveRegion="assertive" style={styles.empty}>
            <Text style={styles.emptyTitle}>변화 기록을 불러오지 못했어요.</Text>
            <Body style={styles.intro}>{error}</Body>
            <View style={styles.startAction}>
              <ActionButton fullWidth onPress={() => void refresh()} tone="paper">다시 불러오기</ActionButton>
            </View>
          </View>
        ) : null}
        {!loading && profile && changedRecords.length === 0 ? (
          <View style={styles.empty}>
            <Text accessible={false} style={styles.emptySymbol}>첫 장면</Text>
            <Text style={styles.emptyTitle}>아직 비교할 기록이 없어요.</Text>
            <Body style={styles.intro}>지금의 답이 첫 장면이에요. 나중에 생각이 달라지면 그 사이의 이야기가 이곳에 남아요.</Body>
            <View style={styles.startAction}>
              <ActionButton fullWidth onPress={() => router.push('/me')} tone="paper">현재 기록 살펴보기</ActionButton>
            </View>
          </View>
        ) : null}

        <View style={styles.timeline}>
          {changedRecords.map((record) => {
            const tone = categoryStyle[record.category];
            return (
              <View key={record.id} style={[styles.recordGroup, { borderLeftColor: tone.accent }]}>
                <View style={styles.groupHeader}>
                  <Text style={[styles.categoryMark, { color: tone.accent }]}>{tone.symbol}</Text>
                  <View style={styles.groupTitle}>
                    <Meta style={{ color: colors.ink }}>{categoryMeta[record.category].label}</Meta>
                    <Text style={styles.groupName}>{record.title}</Text>
                  </View>
                </View>
                <View style={styles.events}>
                  {record.versions.map((version, index) => (
                    <View key={version.id} style={[styles.event, largeText && styles.largeTextEvent]}>
                      <View
                        accessible={false}
                        style={[styles.eventMark, { backgroundColor: index === record.versions.length - 1 ? tone.accent : colors.line }]}
                      />
                      <View style={styles.eventBody}>
                        <Meta>{formatDate(version.recordedAt)}{index === record.versions.length - 1 ? ' · 지금' : ''}</Meta>
                        <Text style={styles.eventAnswer}>{version.answer}</Text>
                        {version.changedBecause ? <Body style={styles.reason}>달라진 계기 · {version.changedBecause}</Body> : null}
                        {version.nextStep ? <View style={styles.nextBand}><Meta style={styles.next}>다음 시도 · {version.nextStep}</Meta></View> : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  intro: { width: '100%', color: colors.mutedInk, marginTop: space.sm },
  state: { marginTop: space.xxl },
  empty: { width: '100%', marginTop: space.xxl, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  emptySymbol: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 28 },
  emptyTitle: { color: colors.ink, fontFamily: fonts.serifBold, fontSize: 24, lineHeight: 35, marginTop: space.sm },
  startAction: { width: '100%', marginTop: space.lg },
  timeline: { width: '100%', marginTop: space.xl, marginBottom: space.xxl, gap: space.lg },
  recordGroup: { width: '100%', overflow: 'hidden', borderColor: colors.line, borderLeftWidth: 4, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  groupHeader: { width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: space.xs, borderBottomColor: colors.line, borderBottomWidth: 1, padding: space.md },
  categoryMark: { fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 22 },
  groupTitle: { flex: 1, minWidth: 0, justifyContent: 'center' },
  groupName: { color: colors.ink, fontFamily: fonts.serifBold, fontSize: 20, lineHeight: 29, marginTop: space.xs },
  events: { gap: 0 },
  event: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: space.md, borderBottomColor: colors.line, borderBottomWidth: 1, padding: space.md },
  largeTextEvent: { flexDirection: 'column' },
  eventMark: { width: 8, height: 8, borderRadius: 999, marginTop: 7 },
  eventBody: { flex: 1, minWidth: 0 },
  eventAnswer: { color: colors.ink, fontFamily: fonts.serifBold, fontSize: 21, lineHeight: 32, marginVertical: space.sm },
  reason: { color: colors.mutedInk },
  nextBand: { alignSelf: 'flex-start', marginTop: space.md, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: 999, backgroundColor: colors.ochreSoft },
  next: { color: colors.ink },
});
