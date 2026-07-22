import { fireEvent, render, waitFor } from '@testing-library/react-native';

import PreviewScreen from '@/app/preview';

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};
const mockSetVisibility = jest.fn();
const mockClearVisibilityPreview = jest.fn();
const mockClearError = jest.fn();
const previewToken = 'p'.repeat(43);
const previewProfile = {
  displayName: '지금의 나',
  records: [{ category: 'learning' as const, title: '배우는 중', answer: '천천히 쉬는 법' }],
};
const mockItsmeState = {
  publicProfile: null,
  visibilityPreview: {
    recordId: 'record-me',
    previewToken,
    expiresAt: '2026-07-22T12:00:00.000Z',
    profile: previewProfile,
  },
  loading: false,
  saving: false,
  error: null,
  clearError: mockClearError,
  refresh: jest.fn(),
  clearVisibilityPreview: mockClearVisibilityPreview,
  setVisibility: mockSetVisibility,
};

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@/state/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'owner-me', slug: 'scene-me' } }),
}));
jest.mock('@/state/ItsmeProvider', () => ({ useItsme: () => mockItsmeState }));

describe('공개 후보 미리보기 확정', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetVisibility.mockResolvedValue(true);
  });

  test('서버 후보를 같은 공개 렌더러로 보여주고 최종 CTA에서만 token을 전송한다', async () => {
    const screen = await render(<PreviewScreen />);

    expect(screen.getByText('천천히 쉬는 법')).toBeTruthy();
    expect(mockSetVisibility).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('이대로 공개하기'));

    await waitFor(() => {
      expect(mockSetVisibility).toHaveBeenCalledWith({
        recordId: 'record-me',
        visibility: 'public',
        previewToken,
      });
    });
    expect(mockClearVisibilityPreview).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/share');
  });

  test('취소하면 후보만 폐기하고 공개 mutation은 실행하지 않는다', async () => {
    const screen = await render(<PreviewScreen />);

    fireEvent.press(screen.getByText('취소하고 선택으로 돌아가기'));

    expect(mockSetVisibility).not.toHaveBeenCalled();
    expect(mockClearVisibilityPreview).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/share');
  });
});
