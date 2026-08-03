import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import RecordDetailScreen from '@/app/record/[id]';
import type { OwnerProfile } from '@/domain/profile';

jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => ({
  __esModule: true,
  // KAV의 native keyboard subscription은 별도 실기기 테스트 대상이므로 이 화면 테스트에서는 레이아웃 컨테이너만 유지한다.
  default: jest.requireActual('react-native/Libraries/Components/View/View').default,
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};
const mockDeleteRecord = jest.fn();
const mockUpdateRecord = jest.fn();
const mockClearError = jest.fn();

const profile: OwnerProfile = {
  id: 'owner-me',
  displayName: '지금의 나',
  records: [
    {
      id: 'record-me',
      questionId: 'question-me',
      category: 'preference',
      title: '좋아하는 색',
      visibility: 'public',
      versions: [
        {
          id: 'version-me',
          answer: '비 온 뒤의 짙은 이끼 초록',
          recordedAt: '2026-07-22T12:00:00.000Z',
        },
      ],
    },
  ],
};

const mockItsmeState = {
  profile,
  loading: false,
  saving: false,
  error: null,
  clearError: mockClearError,
  refresh: jest.fn(),
  updateRecord: mockUpdateRecord,
  deleteRecord: mockDeleteRecord,
};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'record-me' }),
  usePathname: () => '/record/record-me',
  useRouter: () => mockRouter,
}));
jest.mock('@/state/ItsmeProvider', () => ({ useItsme: () => mockItsmeState }));
jest.mock('@/ui/AppShell', () => ({ AppShell: ({ children }: { children: ReactNode }) => children }));

describe('기록 상세 삭제 안전장치', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteRecord.mockResolvedValue(true);
  });

  test('대상 문장과 복구 불가·공개 영향을 확인한 뒤에만 삭제한다', async () => {
    const screen = await render(<RecordDetailScreen />);

    fireEvent.press(screen.getByLabelText('이 기록 삭제하기'));

    expect(await screen.findByText('이 기록을 삭제할까요?')).toBeTruthy();
    expect(screen.getByText('비 온 뒤의 짙은 이끼 초록')).toBeTruthy();
    expect(screen.getByText(/과거 버전이 모두 영구 삭제되며 복구할 수 없어요/)).toBeTruthy();
    expect(screen.getByText(/방문자 화면에서도 바로 내려가요/)).toBeTruthy();
    expect(mockDeleteRecord).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('영구 삭제하기'));

    await waitFor(() => expect(mockDeleteRecord).toHaveBeenCalledTimes(1));
    expect(mockDeleteRecord).toHaveBeenCalledWith('record-me');
    expect(mockRouter.replace).toHaveBeenCalledWith('/me');
  });

  test('취소하면 기록을 삭제하지 않고 dialog를 닫는다', async () => {
    const screen = await render(<RecordDetailScreen />);

    fireEvent.press(screen.getByLabelText('이 기록 삭제하기'));
    expect(await screen.findByText('이 기록을 삭제할까요?')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('취소'));

    await waitFor(() => expect(screen.queryByText('이 기록을 삭제할까요?')).toBeNull());
    expect(mockDeleteRecord).not.toHaveBeenCalled();
  });
});
