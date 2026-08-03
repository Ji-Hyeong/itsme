import { render, waitFor } from '@testing-library/react-native';

import { BlockingDialog } from '@/ui/BlockingDialog';

const mockFocusTarget = jest.fn();

jest.mock('@/ui/focus-target', () => ({ focusTarget: (target: unknown) => mockFocusTarget(target) }));
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => ({
  __esModule: true,
  default: jest.requireActual('react-native/Libraries/Components/View/View').default,
}));

const baseProps = {
  confirmLabel: '확인',
  description: '확인할 내용',
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
  title: '확인할까요?',
};

describe('BlockingDialog focus 복귀 계약', () => {
  beforeEach(() => jest.clearAllMocks());

  test('취소로 닫히면 dialog를 연 control에 focus를 복귀한다', async () => {
    const returnFocusRef = { current: null };
    const screen = await render(<BlockingDialog {...baseProps} returnFocusRef={returnFocusRef} visible />);
    mockFocusTarget.mockClear();

    await screen.rerender(<BlockingDialog {...baseProps} returnFocusRef={returnFocusRef} visible={false} />);

    await waitFor(() => expect(mockFocusTarget).toHaveBeenCalledTimes(1));
  });

  test('다음 화면으로 이동하면 이전 control에 focus를 복귀하지 않는다', async () => {
    const returnFocusRef = { current: null };
    const screen = await render(
      <BlockingDialog {...baseProps} restoreFocus={false} returnFocusRef={returnFocusRef} visible />,
    );
    mockFocusTarget.mockClear();

    await screen.rerender(
      <BlockingDialog {...baseProps} restoreFocus={false} returnFocusRef={returnFocusRef} visible={false} />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockFocusTarget).not.toHaveBeenCalled();
  });
});
