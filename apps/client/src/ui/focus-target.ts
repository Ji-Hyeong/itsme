import type { ComponentRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Text, View } from 'react-native';

export type FocusTarget = ComponentRef<typeof View> | ComponentRef<typeof Text>;

/** Web DOM focus와 Native accessibility focus를 같은 화면 전환 계약으로 연결한다. */
export function focusTarget(target: FocusTarget | null | undefined) {
  if (!target) return;

  if ('focus' in target && typeof target.focus === 'function') {
    target.focus();
    return;
  }
  const handle = findNodeHandle(target);
  if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
}
