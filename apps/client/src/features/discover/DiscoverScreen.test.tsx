import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DiscoverScreen from '@/app/discover';
import type { Question } from '@/domain/profile';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};
const mockSaveAnswer = jest.fn();
const mockClearError = jest.fn();
const mockRefresh = jest.fn();

const textQuestion: Question = {
  id: 'learning-now',
  category: 'learning',
  chapter: '배움에 관한 질문',
  title: '배우는 중',
  prompt: '아직 서툴지만 천천히 배우는 것은 무엇인가요?',
  kind: 'text',
  placeholder: '예: 조급해하지 않고 쉬는 법',
};

const choiceQuestion: Question = {
  id: 'favorite-color',
  category: 'preference',
  chapter: '취향에 관한 질문',
  title: '좋아하는 색',
  prompt: '요즘 자꾸 눈이 가는 색은 무엇인가요?',
  kind: 'choice',
  options: [
    { label: '이끼 초록', value: '이끼 초록', swatch: '#456349' },
    { label: '해 질 녘 산호', value: '해 질 녘 산호', swatch: '#A8462F' },
  ],
};

const mockItsmeState = {
  questions: [textQuestion] as readonly Question[],
  profile: { id: 'owner-me', displayName: '지금의 나', records: [] },
  loading: false,
  saving: false,
  error: null as string | null,
  clearError: mockClearError,
  refresh: mockRefresh,
  saveAnswer: mockSaveAnswer,
};

jest.mock('expo-router', () => ({
  usePathname: () => '/discover',
  useRouter: () => mockRouter,
}));
jest.mock('@/state/ItsmeProvider', () => ({ useItsme: () => mockItsmeState }));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <DiscoverScreen />
    </SafeAreaProvider>,
  );
}

describe('질문 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockItsmeState.error = null;
    mockItsmeState.saving = false;
    mockItsmeState.questions = [textQuestion];
    mockSaveAnswer.mockResolvedValue(true);
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('compact 화면명보다 실제 질문 문장 하나만 heading으로 노출한다', async () => {
    const screen = await renderScreen();

    const headings = screen.getAllByRole('header');
    expect(headings).toHaveLength(1);
    expect(headings[0].props.children).toBe(textQuestion.prompt);
  });

  test('선택 전에는 저장 행동을 점유하지 않고 문장을 고른 뒤에만 표시한다', async () => {
    mockItsmeState.questions = [choiceQuestion];
    const screen = await renderScreen();

    expect(screen.queryByLabelText('나만 보기로 남기기')).toBeNull();
    fireEvent.press(screen.getByLabelText('이끼 초록'));

    expect(await screen.findByLabelText('나만 보기로 남기기')).toBeTruthy();
    expect(screen.getByText('선택됨')).toBeTruthy();
  });

  test('자유 입력 counter를 표시하고 540자와 600자 경계에서만 접근성 안내를 보낸다', async () => {
    const screen = await renderScreen();
    const input = screen.getByPlaceholderText(textQuestion.placeholder!);

    expect(input.props.accessibilityLabelledBy).toBe('question-answer-label');
    expect(screen.getByTestId('answer-counter', { includeHiddenElements: true }).props.children.join('')).toBe('0 / 600');

    await act(() => fireEvent.changeText(input, '가'.repeat(539)));
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();

    await act(() => fireEvent.changeText(input, '가'.repeat(540)));
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenLastCalledWith(
      '600자 중 540자를 작성했어요. 60자 남았어요.',
    );

    await act(() => fireEvent.changeText(input, '가'.repeat(599)));
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);

    await act(() => fireEvent.changeText(input, '가'.repeat(600)));
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenLastCalledWith(
      '600자를 모두 작성했어요.',
    );
    expect(screen.getByTestId('answer-counter', { includeHiddenElements: true }).props.children.join('')).toBe('600 / 600');
  });

  test('저장 실패 뒤에도 원문을 유지하고 같은 답을 다시 시도한다', async () => {
    mockSaveAnswer.mockResolvedValue(false);
    const screen = await renderScreen();
    const input = screen.getByPlaceholderText(textQuestion.placeholder!);

    await act(() => fireEvent.changeText(input, '천천히 쉬는 법'));
    const saveButton = screen.getByLabelText('나만 보기로 남기기');
    await waitFor(() => expect(saveButton.props.accessibilityState.disabled).toBe(false));
    await act(() => fireEvent.press(saveButton));

    await waitFor(() => {
      expect(mockSaveAnswer).toHaveBeenCalledWith({
        questionId: 'learning-now',
        answer: '천천히 쉬는 법',
      });
    });
    expect(input.props.value).toBe('천천히 쉬는 법');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
