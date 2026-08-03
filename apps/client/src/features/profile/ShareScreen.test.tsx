import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ShareScreen from '@/app/share';
import type { OwnerProfile } from '@/domain/profile';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};
const mockClearError = jest.fn();
const mockRefresh = jest.fn();
const mockPrepareVisibilityPreview = jest.fn();
const mockClearVisibilityPreview = jest.fn();
const mockSetVisibility = jest.fn();

const profile: OwnerProfile = {
  id: 'owner-me',
  displayName: '지금의 나',
  records: [
    {
      id: 'private-record',
      questionId: 'learning-now',
      category: 'learning',
      title: '배우는 중',
      visibility: 'private',
      versions: [
        {
          id: 'private-version',
          answer: '천천히 쉬는 법',
          recordedAt: '2026-07-20T12:00:00.000Z',
        },
      ],
    },
    {
      id: 'public-record',
      questionId: 'favorite-color',
      category: 'preference',
      title: '좋아하는 색',
      visibility: 'public',
      versions: [
        {
          id: 'public-version',
          answer: '이끼 초록',
          recordedAt: '2026-07-21T12:00:00.000Z',
        },
      ],
    },
  ],
};

const mockItsmeState = {
  profile,
  publicProfile: { displayName: '지금의 나', records: [] },
  loading: false,
  saving: false,
  error: null as string | null,
  clearError: mockClearError,
  refresh: mockRefresh,
  prepareVisibilityPreview: mockPrepareVisibilityPreview,
  clearVisibilityPreview: mockClearVisibilityPreview,
  setVisibility: mockSetVisibility,
};

jest.mock('expo-router', () => ({
  usePathname: () => '/share',
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
      <ShareScreen />
    </SafeAreaProvider>,
  );
}

describe('공개 선택 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockItsmeState.error = null;
    mockItsmeState.saving = false;
    mockPrepareVisibilityPreview.mockResolvedValue(true);
    mockSetVisibility.mockResolvedValue(true);
  });

  test('공개 정책과 제외 정보를 확인한 뒤 저장 없이 미리보기로 이동한다', async () => {
    const screen = await renderScreen();

    expect(screen.getByText(
      '이름과 한 줄 소개는 기본으로 보여요. 아래 기록만 하나씩 공개하거나 숨길 수 있어요.',
    )).toBeTruthy();

    await act(() => fireEvent.press(screen.getByLabelText('배우는 중, 현재 나만 보기')));

    await waitFor(() => {
      expect(screen.getByText('과거 기록, 변화 이유와 작성 맥락은 공개되지 않아요.')).toBeTruthy();
    });
    expect(screen.getByText('천천히 쉬는 법')).toBeTruthy();

    await act(() => fireEvent.press(
      within(screen.getByTestId('visibility-confirm-dialog')).getByLabelText('공개 모습 미리보기'),
    ));

    await waitFor(() => {
      expect(mockPrepareVisibilityPreview).toHaveBeenCalledWith({
        recordId: 'private-record',
        visibility: 'public',
      });
    });
    expect(mockSetVisibility).not.toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/preview');
    expect(screen.queryByTestId('visibility-confirm-dialog')).toBeNull();
  });

  test('공개 해제는 확인 뒤 해당 기록만 비공개로 바꾼다', async () => {
    const screen = await renderScreen();

    await act(() => fireEvent.press(screen.getByLabelText('좋아하는 색, 현재 공개')));
    await waitFor(() => {
      expect(screen.getByText('방문자 화면에서 바로 사라지고 내 기록은 남아요.')).toBeTruthy();
    });

    await act(() => fireEvent.press(
      within(screen.getByTestId('visibility-confirm-dialog')).getByLabelText('공개 해제하기'),
    ));

    await waitFor(() => {
      expect(mockSetVisibility).toHaveBeenCalledWith({
        recordId: 'public-record',
        visibility: 'private',
      });
    });
    expect(mockPrepareVisibilityPreview).not.toHaveBeenCalled();
  });
});
