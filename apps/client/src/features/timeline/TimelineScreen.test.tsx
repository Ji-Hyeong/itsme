import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AccessibilityInfo, Dimensions } from 'react-native';

import TimelineScreen from '@/app/timeline';
import type { OwnerProfile } from '@/domain/profile';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const longReason = '서두르지 않고 내 속도를 살펴보기로 한 날의 맥락을 오래 기억하고 싶어요. '.repeat(8);
const profile: OwnerProfile = {
  id: 'owner-me',
  displayName: '지금의 나',
  records: [
    {
      id: 'record-me',
      questionId: 'question-me',
      category: 'learning',
      title: '요즘 배우는 것',
      visibility: 'private',
      versions: [
        {
          id: 'version-before',
          answer: '빨리 답을 찾는 법',
          recordedAt: '2026-06-01T12:00:00.000Z',
        },
        {
          id: 'version-now',
          answer: '질문과 조금 더 오래 머무는 법',
          changedBecause: longReason,
          recordedAt: '2026-07-22T12:00:00.000Z',
        },
      ],
    },
  ],
};

const mockItsmeState = {
  profile,
  loading: false,
  error: null,
  refresh: jest.fn(),
};

jest.mock('expo-router', () => ({
  usePathname: () => '/timeline',
  useRouter: () => mockRouter,
}));
jest.mock('@/state/ItsmeProvider', () => ({ useItsme: () => mockItsmeState }));
jest.mock('@/ui/AppShell', () => ({ AppShell: ({ children }: { children: ReactNode }) => children }));

describe('변화 화면', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
    const mobileWindow = { width: 390, height: 844, scale: 1, fontScale: 1 };
    Dimensions.set({ screen: mobileWindow, window: mobileWindow });
  });

  test('판정 없이 이전과 현재를 보여주고 긴 맥락을 사용자가 펼칠 수 있다', async () => {
    const screen = await render(<TimelineScreen />);

    expect(screen.getByText('이전에는')).toBeTruthy();
    expect(screen.getByText('지금은')).toBeTruthy();
    expect(screen.queryByText(/성장|퇴보|점수/)).toBeNull();
    expect(screen.getByText('이어 읽기')).toBeTruthy();

    fireEvent.press(screen.getByText('이어 읽기'));
    await waitFor(() => expect(screen.queryByText('이어 읽기')).toBeNull());
  });

  test('현재 문장 묶음만 기록 상세 진입 control로 동작한다', async () => {
    const screen = await render(<TimelineScreen />);

    fireEvent.press(screen.getByLabelText('지금은, 질문과 조금 더 오래 머무는 법, 기록 상세 열기'));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/record/[id]',
      params: { id: 'record-me' },
    });
  });
});
