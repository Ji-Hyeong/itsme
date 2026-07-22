import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { Body, Meta } from '@/ui/Type';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

export default function DiscoverScreen() {
  const router = useRouter();
  const { questions, profile, saving, error, clearError, refresh, saveAnswer } = useItsme();
  const [requestedQuestionIndex, setRequestedQuestionIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const submittingRef = useRef(false);
  const savedQuestionIds = useMemo(
    () => new Set(profile?.records.map((record) => record.questionId) ?? []),
    [profile],
  );
  const firstUnansweredIndex = questions.findIndex((candidate) => !savedQuestionIds.has(candidate.id));
  const questionIndex = requestedQuestionIndex ?? (firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
  const question = questions[questionIndex];

  const moveNext = () => {
    setAnswer('');
    setCustomAnswer('');
    clearError();
    if (questionIndex >= questions.length - 1) {
      router.replace('/me');
      return;
    }
    setRequestedQuestionIndex(questionIndex + 1);
  };

  const submit = async () => {
    if (!question || submittingRef.current) return;
    const value = answer === '직접 쓰기' ? customAnswer : answer;
    if (!value.trim()) return;
    submittingRef.current = true;
    try {
      const saved = await saveAnswer({ questionId: question.id, answer: value });
      if (saved) {
        AccessibilityInfo.announceForAccessibility('답변이 나만 보기로 저장되었습니다.');
        moveNext();
      }
    } finally {
      submittingRef.current = false;
    }
  };

  if (!question) {
    return (
      <AppShell>
        <Screen>
          {error ? (
            <View accessibilityLiveRegion="assertive" style={styles.loadError}>
              <Text style={styles.stateTitle}>질문을 불러오지 못했어요.</Text>
              <Body style={styles.muted}>{error}</Body>
              <ActionButton fullWidth onPress={() => void refresh()}>다시 불러오기</ActionButton>
            </View>
          ) : (
            <Body accessibilityRole="progressbar">질문을 고르는 중…</Body>
          )}
        </Screen>
      </AppShell>
    );
  }

  const effectiveAnswer = answer === '직접 쓰기' ? customAnswer : answer;

  return (
    <AppShell>
      <Screen>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>질문</Text>
          <FocusPressable
            accessibilityRole="button"
            onPress={() => router.replace('/me')}
            style={({ focused, pressed }) => [styles.closeButton, focused && styles.focused, pressed && styles.pressed]}>
            <Text style={styles.closeLabel}>닫기</Text>
          </FocusPressable>
        </View>

        <View style={styles.questionBlock}>
          <View style={styles.categoryChip}><Text style={styles.categoryText}>{question.chapter}</Text></View>
          <Text accessibilityRole="header" style={[styles.question, styles.koreanBreak]}>{question.prompt}</Text>
          {question.guidance ? <Body style={styles.guidance}>{question.guidance}</Body> : null}
          <Meta style={styles.skipGuide}>한 문장만 남겨도 충분하고, 언제든 건너뛸 수 있어요.</Meta>
        </View>

        {question.kind === 'choice' ? (
          <View accessibilityLabel="답변 선택지" accessibilityRole="radiogroup" style={styles.options}>
            {question.options?.map((option) => {
              const selected = answer === option.value;
              return (
                <FocusPressable
                  accessibilityLabel={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option.value}
                  onPress={() => {
                    clearError();
                    setAnswer(option.value);
                  }}
                  style={({ focused, pressed }) => [
                    styles.option,
                    selected && styles.selectedOption,
                    focused && styles.focused,
                    pressed && styles.pressed,
                  ]}>
                  {option.swatch ? <View style={[styles.swatch, { backgroundColor: option.swatch }]} /> : null}
                  <Text style={[styles.optionLabel, selected && styles.selectedOptionLabel]}>{option.label}</Text>
                  <View style={[styles.radio, selected && styles.selectedRadio]}>
                    {selected ? <MaterialCommunityIcons color={colors.white} name="check" size={14} /> : null}
                  </View>
                </FocusPressable>
              );
            })}
          </View>
        ) : (
          <TextInput
            accessibilityHint="최대 600자까지 자유롭게 작성할 수 있습니다"
            accessibilityLabel={question.prompt}
            maxLength={600}
            multiline
            onChangeText={(value) => {
              clearError();
              setAnswer(value);
            }}
            placeholder={question.placeholder}
            placeholderTextColor={colors.faintInk}
            style={styles.textInput}
            textAlignVertical="top"
            value={answer}
          />
        )}

        {answer === '직접 쓰기' ? (
          <TextInput
            accessibilityLabel="직접 작성한 MBTI 또는 성격 표현"
            autoCapitalize="characters"
            maxLength={80}
            onChangeText={(value) => {
              clearError();
              setCustomAnswer(value);
            }}
            placeholder="예: ISTP, 또는 조용하지만 호기심 많은 사람"
            placeholderTextColor={colors.faintInk}
            style={styles.shortInput}
            value={customAnswer}
          />
        ) : null}

        {error ? (
          <View accessibilityLiveRegion="assertive" style={styles.errorBox}>
            <Body style={styles.errorText}>{error}</Body>
            <Meta>입력은 그대로 남아 있어요. 다시 시도해 주세요.</Meta>
          </View>
        ) : null}

        <View style={styles.actions}>
          <View style={styles.privateNote}>
            <MaterialCommunityIcons color={colors.mutedInk} name="lock-outline" size={15} />
            <Meta>처음에는 나만 볼 수 있어요</Meta>
          </View>
          <ActionButton
            disabled={!effectiveAnswer.trim()}
            fullWidth
            loading={saving}
            onPress={() => void submit()}>
            {savedQuestionIds.has(question.id) ? '지금의 답으로 남기기' : '이대로 남기기'}
          </ActionButton>
          <ActionButton disabled={saving} fullWidth onPress={moveNext} tone="quiet">지금은 지나갈게요</ActionButton>
        </View>
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  koreanBreak: Platform.select({ web: { wordBreak: 'keep-all', overflowWrap: 'anywhere' } as object, default: {} }),
  loadError: { width: '100%', gap: space.md, paddingTop: space.lg },
  stateTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 23, lineHeight: 33 },
  muted: { color: colors.mutedInk },
  screenHeader: { minHeight: layout.minTouch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 20, letterSpacing: -0.5 },
  closeButton: { minWidth: layout.minTouch, minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent', borderWidth: 2, borderRadius: radii.md },
  closeLabel: { color: colors.mutedInk, fontFamily: fonts.sansMedium, fontSize: 14 },
  questionBlock: { width: '100%', paddingTop: space.lg, paddingBottom: space.lg },
  categoryChip: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.brandSoft },
  categoryText: { color: colors.brandDeep, fontFamily: fonts.sansBold, fontSize: 12, lineHeight: 18 },
  question: { width: '100%', color: colors.ink, fontFamily: fonts.sansBold, fontSize: 30, letterSpacing: -0.8, lineHeight: 41, marginTop: space.md },
  guidance: { color: colors.mutedInk, marginTop: space.sm },
  skipGuide: { marginTop: space.sm },
  options: { width: '100%', gap: 10 },
  option: { width: '100%', minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.md, paddingVertical: 12, borderColor: colors.line, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.white },
  selectedOption: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  swatch: { width: 24, height: 24, borderColor: 'rgba(23,25,28,0.08)', borderWidth: 1, borderRadius: 12 },
  optionLabel: { flex: 1, color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 24 },
  selectedOptionLabel: { color: colors.brandDeep, fontFamily: fonts.sansBold },
  radio: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderColor: colors.line, borderWidth: 1.5, borderRadius: 11, backgroundColor: colors.white },
  selectedRadio: { borderColor: colors.brand, backgroundColor: colors.brand },
  textInput: { width: '100%', minHeight: 168, color: colors.ink, fontFamily: fonts.sans, fontSize: 17, lineHeight: 28, padding: space.md, borderColor: colors.line, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.white },
  shortInput: { width: '100%', minHeight: 56, marginTop: 10, color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 16, paddingHorizontal: space.md, borderColor: colors.line, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.white },
  errorBox: { width: '100%', marginTop: space.md, padding: space.md, borderRadius: radii.md, backgroundColor: colors.errorSoft },
  errorText: { color: colors.error },
  actions: { width: '100%', gap: space.xs, marginTop: space.lg },
  privateNote: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  focused: { borderColor: colors.focus, borderWidth: 2 },
  pressed: { opacity: 0.66 },
});
