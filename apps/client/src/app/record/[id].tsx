import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { categoryMeta, getCurrentVersion } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { Body, Eyebrow, Heading, Meta } from '@/ui/Type';
import { colors, fonts, layout, space } from '@/ui/tokens';

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
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const recordId = firstParam(params.id);
  const { profile, loading, saving, error, clearError, updateRecord, deleteRecord } = useItsme();
  const record = profile?.records.find((candidate) => candidate.id === recordId);
  const current = record ? getCurrentVersion(record) : null;
  const [editing, setEditing] = useState(false);
  const [answer, setAnswer] = useState('');
  const [changedBecause, setChangedBecause] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (loading) {
    return <AppShell><Screen><Body accessibilityRole="progressbar">기록을 불러오는 중…</Body></Screen></AppShell>;
  }

  if (!record || !current) {
    return (
      <AppShell>
        <Screen>
          <Heading>이 기록을 찾지 못했어요.</Heading>
          <Body style={styles.muted}>기록이 바뀌었거나 현재 볼 수 없는 항목이에요.</Body>
          <View style={styles.startAction}><ActionButton fullWidth onPress={() => router.replace('/me')}>현재의 나로 돌아가기</ActionButton></View>
        </Screen>
      </AppShell>
    );
  }

  const tone = categoryStyle[record.category];

  const submitUpdate = async () => {
    const saved = await updateRecord({
      recordId: record.id,
      answer,
      changedBecause: changedBecause || undefined,
      nextStep: nextStep || undefined,
    });
    if (saved) {
      setEditing(false);
      setChangedBecause('');
      setNextStep('');
    }
  };

  const confirmDelete = async () => {
    const deleted = await deleteRecord(record.id);
    if (deleted) router.replace('/me');
  };

  return (
    <AppShell>
      <Screen>
        <FocusPressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ focused }) => [styles.back, focused && styles.focused]}>
          <MaterialCommunityIcons color={colors.ink} name="arrow-left" size={20} />
          <Text style={styles.backLabel}>돌아가기</Text>
        </FocusPressable>

        <View style={[styles.header, { borderTopColor: tone.accent }]}>
          <View style={styles.headerTopline}>
            <Eyebrow style={{ color: colors.ink }}>{categoryMeta[record.category].label} · {record.title}</Eyebrow>
            <Text style={styles.headerSymbol}>{tone.symbol}</Text>
          </View>
          <Heading
            accessibilityRole="header"
            style={styles.answer}>
            {current.answer}
          </Heading>
          <View style={styles.metaRow}>
            <Meta>{formatDate(current.recordedAt)}</Meta>
            <Meta>{record.visibility === 'private' ? '⌁ 나만 보기' : '◉ 공개'}</Meta>
          </View>
        </View>

        {current.context ? (
          <View style={[styles.context, { backgroundColor: tone.soft }]}>
            <Meta>이 답을 남긴 이유</Meta>
            <Body style={styles.contextText}>{current.context}</Body>
          </View>
        ) : null}

        {!editing && !confirmingDelete ? (
          <View style={styles.actions}>
            <ActionButton
              fullWidth
              onPress={() => {
                setAnswer(current.answer);
                setEditing(true);
              }}>
              지금의 답으로 새로 남기기
            </ActionButton>
            <ActionButton fullWidth onPress={() => router.push('/share')} tone="paper">공개 범위 살펴보기</ActionButton>
            <Meta>새 답을 남겨도 이전 기록은 그대로 남아 있어요.</Meta>
            <ActionButton fullWidth onPress={() => { clearError(); setConfirmingDelete(true); }} tone="quiet">이 기록 삭제하기</ActionButton>
          </View>
        ) : editing ? (
          <View style={styles.editor}>
            <Heading>지금은 어떻게 말하고 싶나요?</Heading>
            <Field
              accessibilityLabel="지금의 답"
              maxLength={600}
              onChangeText={setAnswer}
              value={answer}
            />
            <Meta>달라진 계기가 있었나요? · 선택</Meta>
            <Field
              accessibilityLabel="달라진 계기"
              maxLength={1200}
              onChangeText={setChangedBecause}
              placeholder="그때와 지금 사이에 있었던 일을 남겨보세요."
              value={changedBecause}
            />
            <Meta>다음에 해보고 싶은 것이 있나요? · 선택</Meta>
            <Field
              accessibilityLabel="다음에 해볼 작은 시도"
              maxLength={600}
              onChangeText={setNextStep}
              placeholder="아주 작아도 괜찮아요."
              value={nextStep}
            />
            {error ? <Body accessibilityLiveRegion="assertive" style={styles.error}>{error}</Body> : null}
            <View style={styles.editorActions}>
              <ActionButton fullWidth disabled={!answer.trim()} loading={saving} onPress={() => void submitUpdate()}>
                새 기록으로 남기기
              </ActionButton>
              <ActionButton fullWidth disabled={saving} onPress={() => setEditing(false)} tone="quiet">취소</ActionButton>
            </View>
          </View>
        ) : null}

        {confirmingDelete ? (
          <View accessibilityLiveRegion="polite" style={styles.deleteConfirmation}>
            <Heading>이 기록을 삭제할까요?</Heading>
            <Body style={styles.muted}>현재 답과 과거 버전이 모두 사라지고, 공개 중이라면 방문자 화면에서도 바로 내려가요.</Body>
            {error ? <Body style={styles.error}>{error}</Body> : null}
            <ActionButton fullWidth loading={saving} onPress={() => void confirmDelete()} tone="danger">기록 삭제하기</ActionButton>
            <ActionButton disabled={saving} fullWidth onPress={() => { clearError(); setConfirmingDelete(false); }} tone="quiet">취소</ActionButton>
          </View>
        ) : null}

        <View style={styles.history}>
          <View style={styles.historyHeader}>
            <Eyebrow style={styles.historyHeaderText}>지나온 기록</Eyebrow>
            <Meta style={styles.historyHeaderText}>{record.versions.length}개의 문장이 남아 있어요</Meta>
          </View>
          {record.versions.toReversed().map((version, index) => (
            <View key={version.id} style={styles.historyItem}>
              <View
                accessible={false}
                style={[styles.historyMark, { backgroundColor: index === 0 ? tone.accent : colors.line }]}
              />
              <View style={styles.historyBody}>
                <Meta>{formatDate(version.recordedAt)}{index === 0 ? ' · 현재' : ''}</Meta>
                <Text style={styles.historyAnswer}>{version.answer}</Text>
                {version.changedBecause ? <Body style={styles.muted}>{version.changedBecause}</Body> : null}
                {version.nextStep ? <Meta style={styles.nextStep}>다음 시도 · {version.nextStep}</Meta> : null}
              </View>
            </View>
          ))}
        </View>
      </Screen>
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
      multiline
      placeholderTextColor={colors.faintInk}
      scrollEnabled={false}
      style={styles.input}
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  back: { minHeight: layout.minTouch, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, borderWidth: 1, borderColor: colors.line, borderRadius: 999, backgroundColor: colors.white },
  backLabel: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 14 },
  focused: { borderColor: colors.focus },
  header: { width: '100%', marginTop: space.lg, padding: space.lg, borderColor: colors.line, borderTopWidth: 4, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  headerTopline: { width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: space.xs },
  headerSymbol: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 22 },
  answer: { width: '100%', fontSize: 26, lineHeight: 39, marginTop: space.lg },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, marginTop: space.md },
  context: { width: '100%', borderColor: colors.line, borderWidth: 1, borderRadius: 18, padding: space.lg, marginTop: space.md, backgroundColor: colors.white },
  contextText: { marginTop: space.sm },
  actions: { width: '100%', alignItems: 'stretch', gap: space.sm, marginTop: space.lg },
  startAction: { width: '100%', marginTop: space.xl },
  editor: { width: '100%', gap: space.md, marginTop: space.xl, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  input: { minHeight: 112, color: colors.ink, fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 29, padding: space.md, borderColor: colors.line, borderWidth: 1, borderRadius: 12, backgroundColor: colors.white },
  editorActions: { width: '100%', alignItems: 'stretch', gap: space.sm },
  error: { color: colors.error },
  history: { width: '100%', overflow: 'hidden', marginTop: space.xl, marginBottom: space.xxl, borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  deleteConfirmation: { width: '100%', gap: space.md, marginTop: space.lg, padding: space.lg, borderColor: colors.error, borderWidth: 1, borderRadius: 18, backgroundColor: colors.errorSoft },
  historyHeader: { width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: space.xs, padding: space.lg, borderBottomColor: colors.line, borderBottomWidth: 1, backgroundColor: colors.surfaceMuted },
  historyHeaderText: { color: colors.ink },
  historyItem: { width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: space.sm, padding: space.lg, borderBottomColor: colors.line, borderBottomWidth: 1 },
  historyMark: { width: '100%', height: 4, borderRadius: 999 },
  historyBody: { flex: 1, minWidth: 0, justifyContent: 'center' },
  historyAnswer: { color: colors.ink, fontFamily: fonts.serifBold, fontSize: 23, lineHeight: 34, marginVertical: space.sm },
  nextStep: { alignSelf: 'flex-start', color: colors.ink, marginTop: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: 999, backgroundColor: colors.ochreSoft },
  muted: { color: colors.mutedInk, marginTop: space.sm },
});
