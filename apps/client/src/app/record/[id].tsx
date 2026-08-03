import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { categoryMeta, getCurrentVersion } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { BlockingDialog } from '@/ui/BlockingDialog';
import type { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SceneCard } from '@/ui/SceneCard';
import { StatePanel } from '@/ui/StatePanel';
import { Body, Meta } from '@/ui/Type';
import { colors, layout, radii, space, typeScale } from '@/ui/tokens';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(value),
  );
}

export default function RecordDetailScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= layout.largeTextScale;
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const recordId = firstParam(params.id);
  const { profile, loading, saving, error, clearError, refresh, updateRecord, deleteRecord } = useItsme();
  const record = profile?.records.find((candidate) => candidate.id === recordId);
  const current = record ? getCurrentVersion(record) : null;
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState('');
  const [changedBecause, setChangedBecause] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [privacyNotice, setPrivacyNotice] = useState(false);
  const deleteButtonRef = useRef<ComponentRef<typeof FocusPressable>>(null);

  if (loading) {
    return (
      <AppShell>
        <Screen>
          <ScreenHeader backAction={{ label: '지금의 나로', onPress: () => router.replace('/me') }} title="기록 상세" />
          <StatePanel description="현재 문장과 지나온 기록을 준비하고 있어요." title="기록을 불러오는 중" variant="loading" />
        </Screen>
      </AppShell>
    );
  }

  if (error && !profile) {
    return (
      <AppShell>
        <Screen>
          <ScreenHeader backAction={{ label: '지금의 나로', onPress: () => router.replace('/me') }} title="기록 상세" />
          <StatePanel
            action={{ label: '다시 불러오기', onPress: () => void refresh() }}
            description={error}
            title="기록을 불러오지 못했어요."
            variant="error"
          />
        </Screen>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <Screen>
          <ScreenHeader backAction={{ label: '지금의 나로', onPress: () => router.replace('/me') }} title="기록 상세" />
          <StatePanel
            action={{ label: '지금의 나로 돌아가기', onPress: () => router.replace('/me') }}
            description="내 기록은 로그인한 나만 열 수 있어요."
            title="이 기록을 볼 수 없어요."
            variant="permission"
          />
        </Screen>
      </AppShell>
    );
  }

  if (!record || !current) {
    return (
      <AppShell>
        <Screen>
          <ScreenHeader backAction={{ label: '지금의 나로', onPress: () => router.replace('/me') }} title="기록 상세" />
          <StatePanel
            action={{ label: '지금의 나로 돌아가기', onPress: () => router.replace('/me') }}
            description="삭제되었거나 주소가 바뀐 기록일 수 있어요."
            title="이 기록을 찾지 못했어요."
            variant="empty"
          />
        </Screen>
      </AppShell>
    );
  }

  const tone = categoryStyle[record.category];

  const submitUpdate = async () => {
    if (saving) return;
    const wasPublic = record.visibility === 'public';
    const saved = await updateRecord({
      recordId: record.id,
      // 편집 화면이 읽은 버전을 조건부 갱신 토큰으로 보내 다른 기기의 새 문장을 덮어쓰지 않는다.
      expectedVersionId: current.id,
      answer,
      changedBecause: changedBecause || undefined,
      nextStep: nextStep || undefined,
    });
    if (saved) {
      setEditing(false);
      setChangedBecause('');
      setNextStep('');
      setPrivacyNotice(wasPublic);
      AccessibilityInfo.announceForAccessibility('새 문장이 나만 보기로 저장됐어요.');
    }
  };

  const confirmDelete = async () => {
    // Provider의 saving 반영보다 빠른 연속 탭도 막아 서버에 중복 DELETE가 전달되지 않게 한다.
    if (deleting || saving) return;
    setDeleting(true);
    const deleted = await deleteRecord(record.id);
    if (deleted) {
      AccessibilityInfo.announceForAccessibility('기록을 영구 삭제했어요.');
      router.replace('/me');
      return;
    }
    // 실패하면 dialog와 원문을 그대로 유지하고 같은 자리에서 안전하게 재시도할 수 있게 한다.
    setDeleting(false);
  };

  return (
    <AppShell backgroundBlocked={confirmingDelete}>
      <>
        <Screen>
          <ScreenHeader
            backAction={{
              accessibilityLabel: '지금의 나로 돌아가기',
              label: '지금의 나로',
              onPress: () => router.back(),
            }}
            description={categoryMeta[record.category].label}
            title={record.title}
          />

          <View style={styles.currentCard}>
            <SceneCard
              accentColor={tone.accent}
              answer={current.answer}
              category={categoryMeta[record.category].label}
              date={formatDate(current.recordedAt)}
              title={record.title}
              truncateAnswer={false}
              visibility={record.visibility}
            />
          </View>

          {current.context ? (
            <View style={styles.context}>
              <Text style={styles.sectionTitle}>이 답을 남긴 이유</Text>
              <Body>{current.context}</Body>
            </View>
          ) : null}

          {privacyNotice ? (
            <View accessibilityLiveRegion="polite" style={styles.privacyNotice}>
              <Text style={styles.sectionTitle}>새 문장은 나만 보기로 돌아왔어요.</Text>
              <Body style={styles.muted}>공개 전에 실제 모습을 다시 확인해 주세요.</Body>
              <ActionButton fullWidth onPress={() => router.push('/share')} tone="paper">공개 범위 살펴보기</ActionButton>
            </View>
          ) : null}

          {!editing ? (
            <View style={styles.actions}>
              <ActionButton
                fullWidth
                onPress={() => {
                  clearError();
                  setAnswer(current.answer);
                  setEditing(true);
                }}>
                지금의 답으로 새로 남기기
              </ActionButton>
              <ActionButton fullWidth onPress={() => router.push('/share')} tone="paper">공개 범위 살펴보기</ActionButton>
              <Meta>새 답을 남겨도 이전 기록은 그대로 남아 있어요.</Meta>
            </View>
          ) : (
            <View style={styles.editor}>
              <Text style={styles.sectionTitle}>지금은 어떻게 말하고 싶나요?</Text>
              <Field
                accessibilityLabel="지금의 답"
                maxLength={600}
                onChangeText={setAnswer}
                value={answer}
              />
              <Counter current={answer.length} max={600} />
              <Meta nativeID="changed-because-label">달라진 계기가 있었나요? · 선택</Meta>
              <Field
                accessibilityLabel="달라진 계기, 선택"
                maxLength={1200}
                onChangeText={setChangedBecause}
                placeholder="그때와 지금 사이에 있었던 일을 남겨보세요."
                value={changedBecause}
              />
              <Counter current={changedBecause.length} max={1200} />
              <Meta nativeID="next-step-label">다음에 해보고 싶은 것이 있나요? · 선택</Meta>
              <Field
                accessibilityLabel="다음에 해볼 작은 시도, 선택"
                maxLength={600}
                onChangeText={setNextStep}
                placeholder="아주 작아도 괜찮아요."
                value={nextStep}
              />
              <Counter current={nextStep.length} max={600} />
              {error ? <Body accessibilityLiveRegion="assertive" style={styles.error}>{error}</Body> : null}
              <View style={styles.editorActions}>
                <ActionButton fullWidth disabled={!answer.trim()} loading={saving} onPress={() => void submitUpdate()}>
                  새 기록으로 남기기
                </ActionButton>
                <ActionButton fullWidth disabled={saving} onPress={() => setEditing(false)} tone="quiet">취소</ActionButton>
              </View>
            </View>
          )}

          <View style={styles.history}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>지나온 기록</Text>
              <Meta>{record.versions.length}개의 문장이 남아 있어요</Meta>
            </View>
            {record.versions.toReversed().map((version, index) => (
              <View key={version.id} style={[styles.historyItem, largeText && styles.largeTextHistoryItem]}>
                <View accessible={false} style={[styles.historyMark, largeText && styles.largeTextHistoryMark, index === 0 && { backgroundColor: tone.accent }]} />
                <View style={styles.historyBody}>
                  <Meta>{formatDate(version.recordedAt)}{index === 0 ? ' · 현재' : ''}</Meta>
                  <Text style={styles.historyAnswer}>{version.answer}</Text>
                  {version.changedBecause ? <Body style={styles.muted}>달라진 계기 · {version.changedBecause}</Body> : null}
                  {version.nextStep ? <Body style={styles.nextStep}>다음 시도 · {version.nextStep}</Body> : null}
                </View>
              </View>
            ))}
          </View>

          {!editing ? (
            <View style={styles.deleteAction}>
              <ActionButton fullWidth onPress={() => { clearError(); setConfirmingDelete(true); }} ref={deleteButtonRef} tone="quiet">
                이 기록 삭제하기
              </ActionButton>
            </View>
          ) : null}
        </Screen>

        <BlockingDialog
          busy={deleting || saving}
          cancelLabel="취소"
          confirmLabel="영구 삭제하기"
          danger
          description="현재 문장과 과거 버전이 모두 영구 삭제되며 복구할 수 없어요. 공개 중이라면 방문자 화면에서도 바로 내려가요."
          error={confirmingDelete ? error ?? undefined : undefined}
          onCancel={() => {
            if (deleting || saving) return;
            clearError();
            setConfirmingDelete(false);
          }}
          onConfirm={() => void confirmDelete()}
          returnFocusRef={deleteButtonRef}
          target={current.answer}
          title="이 기록을 삭제할까요?"
          visible={confirmingDelete}
        />
      </>
    </AppShell>
  );
}

type FieldProps = {
  accessibilityLabel: string;
  maxLength: number;
  onChangeText(value: string): void;
  placeholder?: string;
  value: string;
};

function Field(props: FieldProps) {
  return (
    <TextInput
      accessibilityHint={`${props.maxLength}자까지 입력할 수 있어요.`}
      multiline
      placeholderTextColor={colors.muted}
      scrollEnabled={false}
      style={styles.input}
      textAlignVertical="top"
      {...props}
    />
  );
}

function Counter({ current, max }: { current: number; max: number }) {
  return <Meta accessibilityLabel={`${max}자 중 ${current}자 입력`} style={styles.counter}>{current}/{max}</Meta>;
}

const styles = StyleSheet.create({
  currentCard: { width: '100%', marginTop: space.lg },
  context: { width: '100%', gap: space.sm, marginTop: space.smMd, padding: space.mdLg, borderRadius: radii.lg, backgroundColor: colors.apricotSoft },
  sectionTitle: { color: colors.ink, ...typeScale.sectionTitle },
  actions: { width: '100%', alignItems: 'stretch', gap: space.sm, marginTop: space.lg },
  editor: { width: '100%', gap: space.smMd, marginTop: space.xl, padding: space.mdLg, borderRadius: radii.lg, backgroundColor: colors.surface },
  input: { width: '100%', minHeight: 168, color: colors.ink, ...typeScale.body, padding: space.md, borderColor: colors.lineStrong, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.surface },
  counter: { alignSelf: 'flex-end' },
  editorActions: { width: '100%', alignItems: 'stretch', gap: space.sm },
  error: { color: colors.error },
  history: { width: '100%', overflow: 'hidden', marginTop: space.xl, borderColor: colors.lineSubtle, borderWidth: 1, borderRadius: radii.lg, backgroundColor: colors.surface },
  privacyNotice: { width: '100%', gap: space.sm, marginTop: space.lg, padding: space.mdLg, borderColor: colors.indigo, borderWidth: 1, borderRadius: radii.lg, backgroundColor: colors.indigoSoft },
  historyHeader: { width: '100%', gap: space.xs, padding: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1, backgroundColor: colors.surfaceMuted },
  historyItem: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: space.smMd, padding: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1 },
  largeTextHistoryItem: { flexDirection: 'column' },
  historyMark: { width: 8, height: 8, marginTop: 7, borderRadius: radii.pill, backgroundColor: colors.lineStrong },
  largeTextHistoryMark: { width: '100%', height: 4, marginTop: 0 },
  historyBody: { flex: 1, minWidth: 0, gap: space.sm },
  historyAnswer: { color: colors.ink, ...typeScale.sceneAnswer },
  nextStep: { color: colors.ink, padding: space.smMd, borderRadius: radii.md, backgroundColor: colors.sageSoft },
  muted: { color: colors.muted },
  deleteAction: { width: '100%', marginTop: space.xl, marginBottom: space.xxl },
});
