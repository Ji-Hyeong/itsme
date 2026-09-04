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
import { FolioHeader, FolioState, LayeredHistory } from '@/ui/Folio';
import { Screen } from '@/ui/Screen';
import { Body, Meta, Question } from '@/ui/Type';
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
        <FolioHeader heading={false} title="변화" />
        <View style={styles.lead}>
          <Question accessibilityRole="header">같은 질문에, 다른 날의 내가 남긴 문장</Question>
          <Body style={styles.leadDescription}>달라진 뜻은 내가 정해요.</Body>
        </View>

        {loading ? <TimelineSkeleton /> : null}
        {!loading && error && !profile ? (
          <FolioState
            action={{ label: '다시 불러오기', onPress: () => void refresh() }}
            description={error}
            title="변화 기록을 불러오지 못했어요."
            variant="error"
          />
        ) : null}
        {!loading && profile && changedRecords.length === 0 ? (
          <FolioState
            action={{ label: '현재 문장 읽기', onPress: () => router.push('/me') }}
            description="지금의 문장은 그대로 보관하고 있어요."
            title="아직 나란히 읽을 이전 문장은 없어요."
            variant="empty"
          />
        ) : null}

        {!loading && changedRecords.length > 0 ? (
          <View style={styles.timeline}>
            {changedRecords.map((record) => {
              const tone = categoryStyle[record.category];
              return (
                <LayeredHistory accentColor={tone.accent} key={record.id}>
                  <View style={styles.groupHeader}>
                    <Meta>{categoryStyle[record.category].folioIndex} {categoryMeta[record.category].label}</Meta>
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
                </LayeredHistory>
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
  return <View style={styles.timeline}><FolioState skeleton="history" variant="loading" /></View>;
}

const styles = StyleSheet.create({
  lead: { width: '100%', gap: space.sm, marginTop: space.sm },
  leadDescription: { color: colors.muted },
  timeline: { width: '100%', marginTop: space.lg, marginBottom: space.xxl, gap: space.xl },
  groupHeader: { width: '100%', gap: space.xs, padding: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1 },
  groupName: { color: colors.ink, ...typeScale.sectionTitle },
  events: { width: '100%' },
  event: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: space.smMd, padding: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1 },
  largeTextEvent: { flexDirection: 'column' },
  dateRail: { width: 76, alignItems: 'flex-start', gap: space.xs },
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
});
