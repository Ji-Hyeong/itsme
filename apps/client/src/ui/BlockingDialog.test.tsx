/** @jest-environment jsdom */

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppShell } from '@/ui/AppShell';
import { BlockingDialog, installWebDialogKeyboardGuard } from '@/ui/BlockingDialog';

const mockFocusTarget = jest.fn();
const nativePlatform = Platform.OS;

jest.mock('@/ui/focus-target', () => ({ focusTarget: (target: unknown) => mockFocusTarget(target) }));
jest.mock('expo-router', () => ({
  usePathname: () => '/share',
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => ({
  __esModule: true,
  default: jest.requireActual('react-native/Libraries/Components/View/View').default,
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

const baseProps = {
  confirmLabel: '확인',
  description: '확인할 내용',
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
  title: '확인할까요?',
};

describe('BlockingDialog focus 복귀 계약', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => Object.defineProperty(Platform, 'OS', { configurable: true, value: nativePlatform }));

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

  test('Web Tab과 Shift+Tab이 dialog의 처음과 끝에서 양방향으로 순환한다', () => {
    const dialog = document.createElement('div');
    const first = document.createElement('button');
    const last = document.createElement('button');
    dialog.append(first, last);
    document.body.append(dialog);
    const cleanup = installWebDialogKeyboardGuard(dialog, jest.fn());

    last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);

    cleanup();
    dialog.remove();
  });

  test('Web Escape는 dialog 취소 동작을 요청하고 기본 브라우저 동작을 막는다', () => {
    const onCancel = jest.fn();
    const dialog = document.createElement('div');
    document.body.append(dialog);
    const cleanup = installWebDialogKeyboardGuard(dialog, onCancel);
    const event = new KeyboardEvent('keydown', { cancelable: true, key: 'Escape', bubbles: true });

    document.dispatchEvent(event);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    cleanup();
    dialog.remove();
  });

  test('busy 중에는 취소 버튼과 시스템 닫기 요청이 모두 차단된다', async () => {
    const onCancel = jest.fn();
    const screen = await render(<BlockingDialog {...baseProps} busy onCancel={onCancel} visible />);

    fireEvent.press(screen.getByLabelText('취소'));
    screen.getByTestId('blocking-dialog-modal').props.onRequestClose();

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByLabelText('취소').props.accessibilityState).toMatchObject({ disabled: true });
  });

  test('Web modal이 열리면 앱 배경을 읽기와 포인터 입력에서 함께 제외한다', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const screen = await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <AppShell backgroundBlocked>
          <View />
        </AppShell>
      </SafeAreaProvider>,
    );

    const background = screen.getByTestId('app-background', { includeHiddenElements: true });
    expect(background.props.accessibilityElementsHidden).toBe(true);
    expect(background.props['aria-hidden']).toBe(true);
    expect(background.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(background.props.pointerEvents).toBe('none');
  });
});
