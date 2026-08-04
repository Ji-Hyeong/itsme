import type { ComponentRef, RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { ActionButton } from '@/ui/ActionButton';
import { FocusPressable } from '@/ui/FocusPressable';
import { Body } from '@/ui/Type';
import { focusTarget, type FocusTarget } from '@/ui/focus-target';
import { colors, fonts, layout, radii, screenGutter, space, typeScale } from '@/ui/tokens';

export type BlockingDialogProps = {
  visible: boolean;
  title: string;
  target?: string;
  description: string;
  error?: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  danger?: boolean;
  returnFocusRef?: RefObject<FocusTarget | null>;
  restoreFocus?: boolean;
  testID?: string;
};

function isHTMLElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
}

/** Web dialog의 키보드 경계를 한곳에서 관리해 portal 안팎으로 포커스가 새지 않게 한다. */
export function installWebDialogKeyboardGuard(
  dialog: HTMLElement,
  cancel: () => void,
  ownerDocument: Document = document,
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="button"]:not([aria-disabled="true"]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && ownerDocument.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && ownerDocument.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  ownerDocument.addEventListener('keydown', handleKeyDown);
  return () => ownerDocument.removeEventListener('keydown', handleKeyDown);
}

export function BlockingDialog({
  visible,
  title,
  target,
  description,
  error,
  cancelLabel = '취소',
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
  danger = false,
  returnFocusRef,
  restoreFocus = true,
  testID,
}: BlockingDialogProps) {
  const { width } = useWindowDimensions();
  const titleRef = useRef<ComponentRef<typeof FocusPressable>>(null);
  const dialogRef = useRef<ComponentRef<typeof View>>(null);
  const restoreFocusLatestRef = useRef(restoreFocus);

  useLayoutEffect(() => {
    // passive cleanup이 실행되기 전에 화면 이동 여부를 동기화해 이전 control로의 잘못된 focus를 막는다.
    restoreFocusLatestRef.current = restoreFocus;
  }, [restoreFocus]);

  const cancel = useCallback(() => {
    if (!busy) onCancel();
  }, [busy, onCancel]);

  const focusTitle = useCallback(() => {
    // Modal portal이 마운트된 다음 프레임에 이동해야 iOS와 Web 모두 제목을 안정적으로 찾는다.
    setTimeout(() => focusTarget(titleRef.current), 0);
  }, []);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;
    if (!isHTMLElement(dialogRef.current)) return;
    return installWebDialogKeyboardGuard(dialogRef.current, cancel);
  }, [cancel, visible]);

  useEffect(() => {
    if (!visible) return;
    const returnTarget = returnFocusRef?.current;
    return () => {
      // 취소에서는 연 control로 돌아가지만 화면 이동 확정은 restoreFocus를 끄고 새 화면의 진입 focus를 보존한다.
      if (restoreFocusLatestRef.current) setTimeout(() => focusTarget(returnTarget), 0);
    };
  }, [returnFocusRef, visible]);

  // 확인 상태가 닫힌 뒤 다른 pending 문구로 바뀌는 과도 프레임과 축소 모션 위험을 동시에 제거한다.
  return (
    <Modal
      accessibilityViewIsModal
      animationType="none"
      onRequestClose={cancel}
      onShow={focusTitle}
      statusBarTranslucent
      testID={testID ? `${testID}-modal` : 'blocking-dialog-modal'}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalRoot, { paddingHorizontal: screenGutter(width) }]}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.scrim} />
        <View
          accessibilityViewIsModal
          ref={dialogRef}
          role="dialog"
          style={styles.dialog}
          testID={testID}>
          <FocusPressable
            accessibilityRole="header"
            focusable
            ref={titleRef}
            style={({ focused }) => [styles.titleFocusTarget, focused && styles.titleFocused]}>
            <Text style={styles.title}>{title}</Text>
          </FocusPressable>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            style={styles.bodyScroll}>
            {target ? (
              <View style={styles.target}>
                <View accessible={false} style={styles.targetRegister} />
                <Text style={styles.targetText}>{target}</Text>
              </View>
            ) : null}
            <Body style={styles.description}>{description}</Body>
            {error ? (
              <Body accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>
                {error}
              </Body>
            ) : null}
          </ScrollView>
          <View style={styles.actions}>
            <ActionButton disabled={busy} fullWidth onPress={cancel} tone="paper">
              {cancelLabel}
            </ActionButton>
            <ActionButton
              fullWidth
              loading={busy}
              onPress={onConfirm}
              tone={danger ? 'danger' : 'ink'}>
              {confirmLabel}
            </ActionButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.mdLg,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
  },
  dialog: {
    width: '100%',
    maxWidth: layout.dialogMaxWidth,
    maxHeight: '100%',
    padding: space.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    gap: space.md,
  },
  titleFocusTarget: { alignSelf: 'flex-start', borderRadius: radii.sm },
  titleFocused: {
    // Dialog가 열릴 때 이동한 초기 포커스만 공용 control과 같은 고대비 규칙으로 드러낸다.
    outlineColor: colors.focus,
    outlineOffset: 2,
    outlineStyle: 'solid',
    outlineWidth: 3,
  },
  title: { color: colors.ink, ...typeScale.sectionTitle },
  bodyScroll: { flexShrink: 1 },
  bodyContent: { gap: space.md },
  target: {
    position: 'relative',
    width: '100%',
    paddingVertical: space.sm,
    paddingLeft: space.md,
    backgroundColor: colors.surface,
  },
  targetRegister: { position: 'absolute', top: space.sm, bottom: space.sm, left: 0, width: 3, backgroundColor: colors.apricot },
  targetText: { color: colors.ink, fontFamily: fonts.serifBold, fontSize: 22, lineHeight: 34 },
  description: { color: colors.muted },
  error: { color: colors.error },
  actions: { width: '100%', gap: space.sm },
});
