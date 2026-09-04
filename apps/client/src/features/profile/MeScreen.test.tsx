import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

import MeScreen from '@/app/me';
import type { OwnerProfile } from '@/domain/profile';

const profile: OwnerProfile = {
  id: 'owner-me',
  displayName: '지금의 나',
  intro: '천천히 나를 알아가는 중',
  records: [{
    id: 'record-me',
    questionId: 'favorite-color',
    category: 'preference',
    title: '좋아하는 색',
    visibility: 'private',
    versions: [{
      id: 'version-me',
      answer: '이끼 초록',
      recordedAt: '2026-08-04T12:00:00.000Z',
    }],
  }],
};

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockRouterPush }) }));
jest.mock('@/state/ItsmeProvider', () => ({
  useItsme: () => ({ profile, loading: false, error: null, refresh: jest.fn() }),
}));
jest.mock('@/ui/AppShell', () => ({ AppShell: ({ children }: { children: ReactNode }) => children }));

describe('나 화면 표지와 문장 목록', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  });

  afterEach(() => jest.restoreAllMocks());

  test('표지는 이름과 소개에 집중하고 대표 문장을 첫 entry와 중복하지 않는다', async () => {
    const screen = await render(<MeScreen />);

    expect(screen.getByText('지금의 나')).toBeTruthy();
    expect(screen.getByText('천천히 나를 알아가는 중')).toBeTruthy();
    expect(screen.getAllByText('이끼 초록')).toHaveLength(1);
  });

  test('공개 미리보기를 이름이 있는 button으로 제공하고 눌렀을 때 미리보기로 이동한다', async () => {
    const screen = await render(<MeScreen />);
    const preview = screen.getByRole('button', { name: '다른 사람이 보는 공개 모습 미리보기' });

    fireEvent.press(preview);

    expect(mockRouterPush).toHaveBeenCalledWith('/preview');
  });
});
