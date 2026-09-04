import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { categoryMeta } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { AppShell } from '@/ui/AppShell';
import { BlockingDialog } from '@/ui/BlockingDialog';
import { FocusPressable } from '@/ui/FocusPressable';
import { ChoiceList, FolioAction, FolioHeader, FolioState, PromptSheet } from '@/ui/Folio';
import { Screen } from '@/ui/Screen';
import { Body, Control, Meta } from '@/ui/Type';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

const MAX_ANSWER_LENGTH = 600;
const FIRST_LENGTH_ANNOUNCEMENT = 540;

export default function DiscoverScreen() {
  const router = useRouter();
  const { questions, profile, saving, error, clearError, refresh, saveAnswer } = useItsme();
  const [requestedQuestionIndex, setRequestedQuestionIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [focusedInput, setFocusedInput] = useState<'answer' | 'custom' | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const closeButtonRef = useRef<ComponentRef<typeof FocusPressable>>(null);
  const previousAnswerLength = useRef(0);
  const submittingRef = useRef(false);
  const savedQuestionIds = useMemo(
    () => new Set(profile?.records.map((record) => record.questionId) ?? []),
    [profile],
  );
  const firstUnansweredIndex = questions.findIndex((candidate) => !savedQuestionIds.has(candidate.id));
  const questionIndex = requestedQuestionIndex ?? (firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
  const question = questions[questionIndex];
  const effectiveAnswer = answer === '직접 쓰기' ? customAnswer : answer;

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
          <FolioHeader title="질문" trailingAction={{ label: '닫기', onPress: leaveQuestion }} />
          <View style={styles.firstSection}>
            <FolioState
              action={error ? { label: '다시 불러오기', onPress: () => void refresh() } : undefined}
              description={error ?? '지금 머물기 좋은 질문 하나를 준비하고 있어요.'}
              title={error ? '질문을 불러오지 못했어요.' : '질문을 고르는 중'}
              variant={error ? 'error' : 'loading'}
              skeleton="choice"
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
      <Screen>
        <FolioHeader
          heading={false}
          title="질문"
          trailingAction={{ label: '닫기', onPress: requestClose }}
          trailingActionRef={closeButtonRef}
        />

        <PromptSheet
          category={categoryMeta[question.category].label}
          guidance={question.guidance ?? '한 문장만 남겨도 좋고, 오늘은 지나가도 괜찮아요.'}
          index={categoryStyle[question.category].folioIndex}
          prompt={question.prompt}>
          {question.kind === 'choice' ? (
            <ChoiceList
              onChange={(value) => { clearError(); setAnswer(value); }}
              options={question.options ?? []}
              value={answer}
            />
          ) : (
            <View style={styles.inputGroup}>
              <Control nativeID="question-answer-label">내 문장</Control>
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
                scrollEnabled={false}
                style={[styles.textInput, focusedInput === 'answer' && styles.inputFocused]}
                textAlignVertical="top"
                value={answer}
              />
              <Meta
                accessibilityElementsHidden
                importantForAccessibility="no"
                nativeID="question-answer-counter"
                style={styles.counter}
                testID="answer-counter">
                {answer.length} / 600
              </Meta>
            </View>
          )}
        </PromptSheet>

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
              style={[styles.shortInput, focusedInput === 'custom' && styles.inputFocused]}
              value={customAnswer}
            />
          </View>
        ) : null}

        {error ? (
          <Body accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.saveError}>
            문장을 남기지 못했어요. 그대로 두었으니 다시 시도할 수 있어요.
          </Body>
        ) : null}

        {effectiveAnswer.trim() ? (
          <View style={styles.actions}>
            <FolioAction loading={saving} onPress={() => void submit()}>
              {saving ? '남기는 중…' : '나만 보기로 남기기'}
            </FolioAction>
          </View>
        ) : null}
        <FocusPressable
          accessibilityLabel="지금은 넘길게요"
          accessibilityRole="button"
          disabled={saving}
          onPress={moveNext}
          style={({ pressed }) => [styles.skipAction, pressed && styles.pressed]}>
          <Control style={styles.skipLabel}>지금은 넘길게요</Control>
        </FocusPressable>
      </Screen>

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
  firstSection: { width: '100%', marginTop: space.lg },
  inputGroup: { width: '100%', gap: space.sm, marginTop: space.md },
  textInput: {
    width: '100%',
    minHeight: 168,
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 30,
    padding: space.md,
    paddingBottom: space.lg,
    borderColor: colors.lineStrong,
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
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
    backgroundColor: colors.surface,
  },
  saveError: { width: '100%', color: colors.error, marginTop: space.md },
  actions: { width: '100%', marginTop: space.lg },
  skipAction: { width: '100%', minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  skipLabel: { color: colors.indigoDeep },
  inputFocused: {
    outlineColor: colors.focus,
    outlineOffset: 2,
    outlineStyle: 'solid',
    outlineWidth: 3,
  },
  pressed: { opacity: 0.66 },
});
