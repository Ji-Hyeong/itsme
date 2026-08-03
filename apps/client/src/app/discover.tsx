import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { useItsme } from '@/state/ItsmeProvider';
import { AppShell } from '@/ui/AppShell';
import { BlockingDialog } from '@/ui/BlockingDialog';
import { BottomActionBar } from '@/ui/BottomActionBar';
import { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { StatePanel } from '@/ui/StatePanel';
import { Body, Control, Meta, Question } from '@/ui/Type';
import { colors, fonts, radii, space } from '@/ui/tokens';

const MAX_ANSWER_LENGTH = 600;
const FIRST_LENGTH_ANNOUNCEMENT = 540;

export default function DiscoverScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const { questions, profile, saving, error, clearError, refresh, saveAnswer } = useItsme();
  const [requestedQuestionIndex, setRequestedQuestionIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'answer' | 'custom' | null>(null);
  const closeButtonRef = useRef<ComponentRef<typeof FocusPressable>>(null);
  const previousAnswerLength = useRef(0);
  const submittingRef = useRef(false);
  const largeText = fontScale >= 1.5;
  const savedQuestionIds = useMemo(
    () => new Set(profile?.records.map((record) => record.questionId) ?? []),
    [profile],
  );
  const firstUnansweredIndex = questions.findIndex((candidate) => !savedQuestionIds.has(candidate.id));
  const questionIndex = requestedQuestionIndex ?? (firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
  const question = questions[questionIndex];
  const effectiveAnswer = answer === '직접 쓰기' ? customAnswer : answer;
  const actionBarInFlow = largeText || focusedInput !== null;

  const resetDraft = () => {
    setAnswer('');
    setCustomAnswer('');
    previousAnswerLength.current = 0;
    clearError();
  };

  const moveNext = () => {
    resetDraft();
    if (questionIndex >= questions.length - 1) {
      router.replace('/me');
      return;
    }
    setRequestedQuestionIndex(questionIndex + 1);
  };

  const leaveQuestion = () => {
    setConfirmLeave(false);
    resetDraft();
    router.replace('/me');
  };

  const requestClose = () => {
    if (effectiveAnswer.trim()) {
      setConfirmLeave(true);
      return;
    }
    leaveQuestion();
  };

  const updateLongAnswer = (value: string) => {
    clearError();
    const previousLength = previousAnswerLength.current;
    const nextLength = value.length;
    setAnswer(value);

    // 입력마다 읽어 주면 원문 작성 흐름을 방해하므로, 상한에 가까워지는 두 경계만 위로 통과할 때 알린다.
    if (previousLength < MAX_ANSWER_LENGTH && nextLength >= MAX_ANSWER_LENGTH) {
      AccessibilityInfo.announceForAccessibility('600자를 모두 작성했어요.');
    } else if (previousLength < FIRST_LENGTH_ANNOUNCEMENT && nextLength >= FIRST_LENGTH_ANNOUNCEMENT) {
      AccessibilityInfo.announceForAccessibility('600자 중 540자를 작성했어요. 60자 남았어요.');
    }
    previousAnswerLength.current = nextLength;
  };

  const submit = async () => {
    if (!question || submittingRef.current || !effectiveAnswer.trim()) return;
    submittingRef.current = true;
    try {
      const saved = await saveAnswer({ questionId: question.id, answer: effectiveAnswer });
      if (saved) {
        AccessibilityInfo.announceForAccessibility('답변이 나만 보기로 저장됐어요.');
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
          <ScreenHeader title="질문" trailingAction={{ label: '닫기', onPress: leaveQuestion }} />
          <View style={styles.firstSection}>
            <StatePanel
              action={error ? { label: '다시 불러오기', onPress: () => void refresh() } : undefined}
              description={error ?? '지금 머물기 좋은 질문 하나를 준비하고 있어요.'}
              title={error ? '질문을 불러오지 못했어요.' : '질문을 고르는 중'}
              variant={error ? 'error' : 'loading'}
            />
          </View>
        </Screen>
      </AppShell>
    );
  }

  const answerHelp = error
    ? `최대 600자까지 작성할 수 있어요. 현재 ${answer.length}자예요. 저장 오류: ${error}`
    : `최대 600자까지 작성할 수 있어요. 현재 ${answer.length}자예요.`;

  return (
    <AppShell backgroundBlocked={confirmLeave}>
      <Screen bottomPadding={actionBarInFlow ? undefined : 168}>
        <ScreenHeader
          title="질문"
          trailingAction={{ label: '닫기', onPress: requestClose }}
          trailingActionRef={closeButtonRef}
        />

        <View style={styles.questionBlock}>
          <Meta style={styles.category}>{question.chapter}</Meta>
          <Question nativeID="question-prompt" style={styles.koreanBreak}>{question.prompt}</Question>
          {question.guidance ? <Body style={styles.guidance}>{question.guidance}</Body> : null}
          <Meta style={styles.skipGuide}>한 문장만 남겨도 충분하고, 언제든 건너뛸 수 있어요.</Meta>
        </View>

        {question.kind === 'choice' ? (
          <View accessibilityLabel="답변 선택지" accessibilityRole="radiogroup" style={styles.options}>
            {question.options?.map((option) => {
              const selected = answer === option.value;
              return (
                <FocusPressable
                  accessibilityLabel={`${option.label}${selected ? ', 선택됨' : ''}`}
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
                  {option.swatch ? <View accessible={false} style={[styles.swatch, { backgroundColor: option.swatch }]} /> : null}
                  <Control style={[styles.optionLabel, selected && styles.selectedOptionLabel]}>{option.label}</Control>
                  {selected ? <Meta style={styles.selectedText}>선택됨</Meta> : null}
                  <View accessible={false} style={[styles.radio, selected && styles.selectedRadio]}>
                    {selected ? <MaterialCommunityIcons color={colors.white} name="check" size={14} /> : null}
                  </View>
                </FocusPressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Control nativeID="question-answer-label">내 답</Control>
            <TextInput
              accessibilityHint={answerHelp}
              accessibilityLabel={question.prompt}
              accessibilityLabelledBy="question-answer-label"
              maxLength={MAX_ANSWER_LENGTH}
              multiline
              onBlur={() => setFocusedInput(null)}
              onChangeText={updateLongAnswer}
              onFocus={() => setFocusedInput('answer')}
              placeholder={question.placeholder}
              placeholderTextColor={colors.faintInk}
              scrollEnabled={!largeText}
              style={[
                styles.textInput,
                largeText && styles.largeTextInput,
                focusedInput === 'answer' && styles.focused,
              ]}
              textAlignVertical="top"
              value={answer}
            />
            <Meta
              accessibilityElementsHidden
              importantForAccessibility="no"
              nativeID="question-answer-counter"
              style={styles.counter}
              testID="answer-counter">
              {answer.length}/600
            </Meta>
          </View>
        )}

        {answer === '직접 쓰기' ? (
          <View style={styles.shortInputGroup}>
            <Control nativeID="custom-answer-label">직접 표현하기</Control>
            <TextInput
              accessibilityLabel="직접 작성한 MBTI 또는 성격 표현"
              accessibilityLabelledBy="custom-answer-label"
              autoCapitalize="characters"
              maxLength={80}
              onBlur={() => setFocusedInput(null)}
              onChangeText={(value) => {
                clearError();
                setCustomAnswer(value);
              }}
              onFocus={() => setFocusedInput('custom')}
              placeholder="예: ISTP, 또는 조용하지만 호기심 많은 사람"
              placeholderTextColor={colors.faintInk}
              style={[styles.shortInput, focusedInput === 'custom' && styles.focused]}
              value={customAnswer}
            />
          </View>
        ) : null}

        {error ? (
          <View style={styles.saveError}>
            <StatePanel
              action={{ label: '다시 시도', onPress: () => void submit() }}
              description={`${error} 입력은 그대로 남아 있어요.`}
              title="답변을 남기지 못했어요."
              variant="error"
            />
          </View>
        ) : null}

        {actionBarInFlow ? (
          <BottomActionBar
            aboveTabBar
            contained
            forceInFlow
            primary={{
              disabled: !effectiveAnswer.trim(),
              label: saving ? '남기는 중…' : '나만 보기로 남기기',
              loading: saving,
              onPress: () => void submit(),
            }}
            secondary={{ disabled: saving, label: '지금은 건너뛸게요', onPress: moveNext }}
          />
        ) : null}
      </Screen>

      {!actionBarInFlow ? (
        <BottomActionBar
          aboveTabBar
          primary={{
            disabled: !effectiveAnswer.trim(),
            label: saving ? '남기는 중…' : '나만 보기로 남기기',
            loading: saving,
            onPress: () => void submit(),
          }}
          secondary={{ disabled: saving, label: '지금은 건너뛸게요', onPress: moveNext }}
        />
      ) : null}

      <BlockingDialog
        cancelLabel="계속 쓰기"
        confirmLabel="나가기"
        description="작성 중인 답은 저장되지 않아요. 이 화면에 머물러 계속 쓸 수도 있어요."
        onCancel={() => setConfirmLeave(false)}
        onConfirm={leaveQuestion}
        returnFocusRef={closeButtonRef}
        target={effectiveAnswer}
        title="질문에서 나갈까요?"
        visible={confirmLeave}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  koreanBreak: Platform.select({ web: { wordBreak: 'keep-all', overflowWrap: 'anywhere' } as object, default: {} }),
  firstSection: { width: '100%', marginTop: space.lg },
  questionBlock: { width: '100%', paddingTop: space.lg, paddingBottom: space.lg },
  category: { color: colors.brandDeep, fontFamily: fonts.sansBold },
  guidance: { color: colors.mutedInk, marginTop: space.sm },
  skipGuide: { marginTop: space.sm },
  options: { width: '100%', gap: space.sm },
  option: {
    width: '100%',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderColor: colors.lineStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  selectedOption: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  swatch: { width: 24, height: 24, borderColor: colors.lineStrong, borderWidth: 1, borderRadius: 12 },
  optionLabel: { flex: 1, color: colors.ink },
  selectedOptionLabel: { color: colors.brandDeep },
  selectedText: { color: colors.brandDeep, fontFamily: fonts.sansBold },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.lineStrong,
    borderWidth: 1,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  selectedRadio: { borderColor: colors.brand, backgroundColor: colors.brand },
  inputGroup: { width: '100%', gap: space.sm },
  textInput: {
    width: '100%',
    minHeight: 168,
    maxHeight: 320,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    padding: space.md,
    paddingBottom: space.lg,
    borderColor: colors.lineStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  largeTextInput: { maxHeight: undefined },
  counter: { alignSelf: 'flex-end' },
  shortInputGroup: { width: '100%', gap: space.sm, marginTop: space.md },
  shortInput: {
    width: '100%',
    minHeight: 52,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 16,
    paddingHorizontal: space.md,
    borderColor: colors.lineStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  saveError: { width: '100%', marginTop: space.md },
  focused: {
    borderColor: colors.focus,
    outlineColor: colors.focus,
    outlineOffset: 2,
    outlineStyle: 'solid',
    outlineWidth: 3,
  },
  pressed: { opacity: 0.66 },
});
