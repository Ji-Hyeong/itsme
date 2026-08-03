import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { categoryMeta } from '@/domain/profile';
import type { RecordVersion } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { AppShell } from '@/ui/AppShell';
import { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { StatePanel } from '@/ui/StatePanel';
import { Body, Meta } from '@/ui/Type';
import { colors, fonts, layout, radii, space, typeScale } from '@/ui/tokens';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(value),
  );
}

function useScreenReaderEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((nextEnabled) => {
      if (active) setEnabled(nextEnabled);
    });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}

export default function TimelineScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= layout.largeTextScale;
  const screenReaderEnabled = useScreenReaderEnabled();
  const [expandedContexts, setExpandedContexts] = useState<ReadonlySet<string>>(() => new Set());
  const { profile, loading, error, refresh } = useItsme();
  const changedRecords = profile?.records.filter((record) => record.versions.length > 1) ?? [];

  const toggleContext = (versionId: string) => {
    setExpandedContexts((current) => {
      const next = new Set(current);
      if (next.has(versionId)) next.delete(versionId);
      else next.add(versionId);
      return next;
    });
  };

  return (
    <AppShell>
      <Screen>
        <ScreenHeader
          description="달라진 문장을 보여드릴게요. 그 의미는 오직 내가 정해요."
          title="변화는 기록이 된다"
        />

        {loading ? <TimelineSkeleton /> : null}
        {!loading && error && !profile ? (
          <StatePanel
            action={{ label: '다시 불러오기', onPress: () => void refresh() }}
            description={error}
            title="변화 기록을 불러오지 못했어요."
            variant="error"
          />
        ) : null}
        {!loading && profile && changedRecords.length === 0 ? (
          <StatePanel
            action={{ label: '현재 기록 살펴보기', onPress: () => router.push('/me') }}
            description="지금의 답은 그대로 잘 보관하고 있어요."
            title="아직 비교할 과거 문장이 없어요."
            variant="empty"
          />
        ) : null}

        {!loading && changedRecords.length > 0 ? (
          <View style={styles.timeline}>
            {changedRecords.map((record) => {
              const tone = categoryStyle[record.category];
              return (
                <View key={record.id} style={styles.recordGroup}>
                  <View accessible={false} style={[styles.categoryBar, { backgroundColor: tone.accent }]} />
                  <View style={styles.groupHeader}>
                    <Meta>{categoryMeta[record.category].label}</Meta>
                    <Text style={styles.groupName}>{record.title}</Text>
                  </View>
                  <View style={styles.events}>
                    {record.versions.map((version, index) => {
                      const current = index === record.versions.length - 1;
                      const showFullContext = largeText
                        || screenReaderEnabled
                        || expandedContexts.has(version.id);
                      return (
                        <TimelineEvent
                          current={current}
                          key={version.id}
                          largeText={largeText}
                          onOpen={() => router.push({ pathname: '/record/[id]', params: { id: record.id } })}
                          onToggleContext={() => toggleContext(version.id)}
                          showFullContext={showFullContext}
                          version={version}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </Screen>
    </AppShell>
  );
}

type TimelineEventProps = {
  current: boolean;
  largeText: boolean;
  onOpen(): void;
  onToggleContext(): void;
  showFullContext: boolean;
  version: RecordVersion;
};

function TimelineEvent({
  current,
  largeText,
  onOpen,
  onToggleContext,
  showFullContext,
  version,
}: TimelineEventProps) {
  const secondaryContext = [
    version.changedBecause ? `달라진 계기 · ${version.changedBecause}` : null,
    version.nextStep ? `다음 시도 · ${version.nextStep}` : null,
  ].filter((value): value is string => value !== null).join('\n\n');
  // 실제 줄 수는 기기 폭과 글꼴에 따라 달라지므로, 짧은 문장에는 불필요한 펼치기 control을 만들지 않는다.
  const contextCanCollapse = secondaryContext.length > 120;

  return (
    <View style={[styles.event, largeText && styles.largeTextEvent]}>
      <View style={[styles.dateRail, largeText && styles.largeTextDateRail]}>
        <View accessible={false} style={[styles.eventMark, current && styles.currentMark]} />
        <Meta>{formatDate(version.recordedAt)}</Meta>
        <Meta style={styles.versionLabel}>{current ? '지금은' : '이전에는'}</Meta>
      </View>
      <View style={styles.eventBody}>
        <FocusPressable
          accessibilityLabel={`${current ? '지금은' : '이전에는'}, ${version.answer}, 기록 상세 열기`}
          accessibilityRole="button"
          onPress={onOpen}
          style={({ focused, pressed }) => [
            styles.answerButton,
            focused && styles.focused,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.eventAnswer}>{version.answer}</Text>
        </FocusPressable>
        {secondaryContext ? (
          <View style={styles.contextBlock}>
            <Body numberOfLines={contextCanCollapse && !showFullContext ? 4 : undefined} style={styles.reason}>
              {secondaryContext}
            </Body>
            {contextCanCollapse && !showFullContext ? (
              <FocusPressable
                accessibilityRole="button"
                accessibilityState={{ expanded: false }}
                onPress={onToggleContext}
                style={({ focused, pressed }) => [
                  styles.readMore,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.readMoreLabel}>이어 읽기</Text>
              </FocusPressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TimelineSkeleton() {
  return (
    <View accessibilityLabel="변화 기록 불러오는 중" accessibilityRole="progressbar" style={styles.timeline}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.skeletonGroup}>
          <View style={styles.skeletonMeta} />
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonAnswer} />
          <View style={styles.skeletonAnswerShort} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { width: '100%', marginTop: space.lg, marginBottom: space.xxl, gap: space.xl },
  recordGroup: { width: '100%', overflow: 'hidden', borderColor: colors.lineSubtle, borderWidth: 1, borderRadius: radii.lg, backgroundColor: colors.surface },
  categoryBar: { width: '100%', height: 4 },
  groupHeader: { width: '100%', gap: space.xs, padding: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1 },
  groupName: { color: colors.ink, ...typeScale.sectionTitle },
  events: { width: '100%' },
  event: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: space.smMd, padding: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1 },
  largeTextEvent: { flexDirection: 'column' },
  dateRail: { width: 84, alignItems: 'flex-start', gap: space.xs },
  largeTextDateRail: { width: '100%' },
  eventMark: { width: 8, height: 8, borderRadius: radii.pill, backgroundColor: colors.lineStrong },
  currentMark: { backgroundColor: colors.apricot },
  versionLabel: { color: colors.ink, fontFamily: fonts.sansMedium },
  eventBody: { flex: 1, minWidth: 0, gap: space.md },
  answerButton: { width: '100%', minHeight: layout.minTouch, justifyContent: 'center', margin: -3, padding: 3, borderColor: 'transparent', borderWidth: 3, borderRadius: radii.sm },
  eventAnswer: { color: colors.ink, ...typeScale.sceneAnswer },
  contextBlock: { width: '100%', gap: space.sm },
  reason: { color: colors.muted },
  readMore: { minHeight: layout.minTouch, alignSelf: 'flex-start', justifyContent: 'center', margin: -3, paddingHorizontal: space.sm + 3, borderColor: 'transparent', borderWidth: 3, borderRadius: radii.md },
  readMoreLabel: { color: colors.indigoDeep, ...typeScale.control },
  focused: { borderColor: colors.focus },
  pressed: { opacity: 0.7 },
  skeletonGroup: { minHeight: 228, gap: space.md, padding: space.mdLg, borderRadius: radii.lg, backgroundColor: colors.surface },
  skeletonMeta: { width: '28%', height: 18, borderRadius: radii.sm, backgroundColor: colors.surfaceMuted },
  skeletonTitle: { width: '62%', height: 31, borderRadius: radii.sm, backgroundColor: colors.surfaceMuted },
  skeletonAnswer: { width: '100%', height: 36, marginTop: space.md, borderRadius: radii.sm, backgroundColor: colors.surfaceMuted },
  skeletonAnswerShort: { width: '74%', height: 36, borderRadius: radii.sm, backgroundColor: colors.surfaceMuted },
});
