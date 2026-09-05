import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, ComponentRef, ReactNode, Ref } from 'react';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';

import { ActionButton, type ActionButtonProps } from '@/ui/ActionButton';
import { BlockingDialog } from '@/ui/BlockingDialog';
import { FocusPressable } from '@/ui/FocusPressable';
import { Body, Control, Meta, ProfileName, Question, SceneAnswer, SectionTitle } from '@/ui/Type';
import { colors, fonts, layout, radii, screenGutter, space, typeScale } from '@/ui/tokens';

type HeaderAction = {
  label: string;
  onPress(): void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function FolioHeader({
  title,
  backAction,
  trailingAction,
  trailingActionRef,
  heading = true,
}: {
  title: string;
  backAction?: HeaderAction;
  trailingAction?: HeaderAction;
  trailingActionRef?: Ref<ComponentRef<typeof FocusPressable>>;
  heading?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale >= layout.largeTextScale;

  return (
    <View style={[styles.header, expanded && styles.headerExpanded]}>
      {backAction ? <HeaderControl action={backAction} back expanded={expanded} /> : <View accessible={false} style={[styles.headerSlot, expanded && styles.headerSlotExpanded]} />}
      <Text accessibilityRole={heading ? 'header' : undefined} style={[styles.headerTitle, expanded && styles.headerTitleExpanded]}>{title}</Text>
      {trailingAction ? (
        <HeaderControl action={trailingAction} actionRef={trailingActionRef} expanded={expanded} />
      ) : <View accessible={false} style={[styles.headerSlot, expanded && styles.headerSlotExpanded]} />}
    </View>
  );
}

function HeaderControl({ action, back = false, actionRef, expanded = false }: {
  action: HeaderAction;
  back?: boolean;
  actionRef?: Ref<ComponentRef<typeof FocusPressable>>;
  expanded?: boolean;
}) {
  return (
    <FocusPressable
      accessibilityLabel={action.accessibilityLabel ?? action.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled}
      onPress={action.onPress}
      ref={actionRef}
      style={({ pressed }) => [styles.headerControl, expanded && styles.headerControlExpanded, pressed && styles.pressed]}>
      {back ? <MaterialCommunityIcons accessible={false} color={colors.indigoDeep} name="arrow-left" size={20} /> : null}
      <Control style={styles.headerControlLabel}>{action.label}</Control>
    </FocusPressable>
  );
}

function SceneRegister() {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.sceneRegister} testID="scene-register">
      <View style={[styles.registerSheet, styles.registerSage]} testID="scene-register-sage" />
      <View style={[styles.registerSheet, styles.registerApricot]} testID="scene-register-apricot" />
      <View style={[styles.registerSheet, styles.registerIndigo]} testID="scene-register-indigo" />
    </View>
  );
}

export function FolioCover({ displayName, intro, lead, heading = true }: {
  displayName: string;
  intro?: string;
  lead?: string;
  heading?: boolean;
}) {
  return (
    <View style={[styles.cover, lead ? styles.coverWithLead : styles.coverWithoutLead]}>
      <SceneRegister />
      <View style={styles.coverCopy}>
        <ProfileName accessibilityRole={heading ? 'header' : undefined}>{displayName}</ProfileName>
        {intro ? <Body style={styles.coverIntro}>{intro}</Body> : null}
        {lead ? <Question style={styles.coverLead}>{lead}</Question> : null}
      </View>
    </View>
  );
}

export type FolioEntryProps = {
  index: string;
  category: string;
  answer: string;
  title?: string;
  detail?: string;
  date?: string;
  visibility?: 'private' | 'public';
  accentColor?: string;
  onPress?: () => void;
  truncate?: boolean;
  testID?: string;
};

function useReducedMotionPreference() {
  const [preference, setPreference] = useState<{ reduced: boolean; resolved: boolean }>({
    // 설정을 읽기 전에는 보수적으로 이동을 생략해 축소 모션 사용자가 한 프레임도 translate를 보지 않게 한다.
    reduced: true,
    resolved: false,
  });

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (active) setPreference({ reduced, resolved: true });
      })
      .catch(() => {
        // OS 설정 조회 실패는 콘텐츠를 숨긴 채 두지 않고, 이동 없는 짧은 opacity 전환으로 안전하게 복구한다.
        if (active) setPreference({ reduced: true, resolved: true });
      });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
      setPreference({ reduced, resolved: true });
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return preference;
}

function EntryReveal({ children, testID }: { children: ReactNode; testID?: string }) {
  const { reduced, resolved } = useReducedMotionPreference();
  const [opacity] = useState(() => new Animated.Value(0));
  const [offset] = useState(() => new Animated.Value(8));

  useEffect(() => {
    if (!resolved) return;
    opacity.stopAnimation();
    offset.stopAnimation();

    if (reduced) {
      offset.setValue(0);
      Animated.timing(opacity, {
        duration: 80,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [offset, opacity, reduced, resolved]);

  return (
    <Animated.View
      style={[styles.entryReveal, { opacity }, !reduced && { transform: [{ translateY: offset }] }]}
      testID={testID}>
      {children}
    </Animated.View>
  );
}

export function FolioEntry({
  index,
  category,
  answer,
  title,
  detail,
  date,
  visibility,
  accentColor = colors.indigo,
  onPress,
  truncate = true,
  testID,
}: FolioEntryProps) {
  const { fontScale } = useWindowDimensions();
  const expandedMeta = fontScale >= layout.largeTextScale;
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [measuredLong, setMeasuredLong] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const canTruncate = truncate && fontScale < layout.largeTextScale && !screenReaderEnabled && !expanded;
  const likelyLong = answer.length > 92 || answer.split(/\r?\n/).length > 5;
  const showReadMore = canTruncate && (measuredLong || likelyLong);
  const visibilityLabel = visibility === 'public' ? '공개' : visibility === 'private' ? '나만 보기' : undefined;
  const accessibilityLabel = [category, title, answer, date, visibilityLabel].filter(Boolean).join(', ');

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isScreenReaderEnabled().then((enabled) => active && setScreenReaderEnabled(enabled));
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const onTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    if (event.nativeEvent.lines.length > 5) setMeasuredLong(true);
  };

  const content = (
    <>
      <View accessible={false} style={[styles.entryRegister, { backgroundColor: accentColor }]} />
      <Meta style={styles.entryIndex}>{index} {category}</Meta>
      {title ? <Meta style={styles.entryTitle}>{title}</Meta> : null}
      <SceneAnswer numberOfLines={canTruncate ? 5 : undefined} onTextLayout={onTextLayout}>{answer}</SceneAnswer>
      {detail ? <Body style={styles.entryDetail}>{detail}</Body> : null}
      {showReadMore ? (
        onPress ? <Control style={styles.readMore}>이 문장 이어 읽기</Control> : (
          <FocusPressable
            accessibilityLabel="이 문장 이어 읽기"
            accessibilityRole="button"
            onPress={() => setExpanded(true)}
            style={({ pressed }) => [styles.readMoreButton, pressed && styles.pressed]}>
            <Control style={styles.readMore}>이 문장 이어 읽기</Control>
          </FocusPressable>
        )
      ) : null}
      {date || visibilityLabel ? (
        <View
          style={[styles.entryMetaRow, expandedMeta && styles.entryMetaRowExpanded]}
          testID={testID ? `${testID}-meta` : undefined}>
          {date ? <Meta>{date}</Meta> : null}
          {visibilityLabel ? (
            <View style={styles.visibilityMeta}>
              <MaterialCommunityIcons
                accessible={false}
                color={colors.muted}
                name={visibility === 'public' ? 'eye-outline' : 'lock-outline'}
                size={16}
              />
              <Meta>{visibilityLabel}</Meta>
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <EntryReveal testID={testID ? `${testID}-reveal` : undefined}>
        <FocusPressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
          testID={testID}>
          {content}
        </FocusPressable>
      </EntryReveal>
    );
  }
  return <EntryReveal testID={testID ? `${testID}-reveal` : undefined}><View style={styles.entry} testID={testID}>{content}</View></EntryReveal>;
}

export function PromptSheet({ index, category, prompt, guidance, children }: {
  index: string;
  category: string;
  prompt: string;
  guidance?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.promptSheet}>
      <Meta style={styles.entryIndex}>{index} {category}</Meta>
      <Question accessibilityRole="header" nativeID="question-prompt">{prompt}</Question>
      <Body style={styles.promptGuidance}>{guidance ?? '한 문장만 남겨도 좋고, 오늘은 지나가도 괜찮아요.'}</Body>
      {children}
    </View>
  );
}

export type ChoiceItem = { label: string; value: string; swatch?: string };

function ChoiceOption({ option, selected, onPress }: { option: ChoiceItem; selected: boolean; onPress(): void }) {
  const { reduced, resolved } = useReducedMotionPreference();
  const [selection] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    if (!resolved) return;
    selection.stopAnimation();
    Animated.timing(selection, {
      duration: reduced ? 80 : 140,
      easing: Easing.out(Easing.cubic),
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [reduced, resolved, selected, selection]);

  return (
    <FocusPressable
      accessibilityLabel={`${option.label}${selected ? ', 선택됨' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, pressed && styles.pressed]}>
      <Animated.View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.choiceWash, { opacity: selection }]}
      />
      <Animated.View
        accessible={false}
        style={[styles.choiceRegister, { opacity: selection }]}
      />
      {option.swatch ? <View accessible={false} style={[styles.swatch, { backgroundColor: option.swatch }]} /> : null}
      <Control style={styles.choiceLabel}>{option.label}</Control>
      {selected ? (
        <Animated.View style={[styles.selectedLabel, { opacity: selection }]}>
          <MaterialCommunityIcons accessible={false} color={colors.indigoDeep} name="check" size={20} />
          <Meta style={styles.selectedText}>선택됨</Meta>
        </Animated.View>
      ) : null}
    </FocusPressable>
  );
}

export function ChoiceList({ options, value, onChange }: {
  options: readonly ChoiceItem[];
  value: string;
  onChange(value: string): void;
}) {
  return (
    <View accessibilityLabel="답변 선택지" accessibilityRole="radiogroup" style={styles.choiceList}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <ChoiceOption
            key={option.value}
            onPress={() => onChange(option.value)}
            option={option}
            selected={selected}
          />
        );
      })}
    </View>
  );
}

export function VisibilityRow({ visibility, onPress, controlRef, disabled, error, accessibilityLabel, testID }: {
  visibility: 'private' | 'public';
  onPress(): void;
  controlRef?: Ref<ComponentRef<typeof FocusPressable>>;
  disabled?: boolean;
  error?: string;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale >= layout.largeTextScale;
  const isPublic = visibility === 'public';
  return (
    <View>
      <FocusPressable
        accessibilityLabel={accessibilityLabel ?? `${isPublic ? '공개' : '나만 보기'}, ${isPublic ? '숨기기' : '보여주기'}`}
        accessibilityRole="switch"
        accessibilityState={{ checked: isPublic, disabled }}
        disabled={disabled}
        onPress={onPress}
        ref={controlRef}
        style={({ pressed }) => [styles.visibilityRow, expanded && styles.visibilityRowExpanded, pressed && styles.pressed]}
        testID={testID}>
        <View style={styles.visibilityStatus}>
          <MaterialCommunityIcons
            accessible={false}
            color={colors.ink}
            name={isPublic ? 'eye-outline' : 'lock-outline'}
            size={20}
          />
          <Control>{isPublic ? '공개' : '나만 보기'}</Control>
        </View>
        <Control style={styles.visibilityVerb}>{isPublic ? '숨기기' : '보여주기'}</Control>
      </FocusPressable>
      {error ? <Body accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.inlineError}>{error}</Body> : null}
    </View>
  );
}

export function PreviewRibbon({ ribbonRef }: { ribbonRef?: Ref<ComponentRef<typeof FocusPressable>> }) {
  return (
    <FocusPressable
      accessibilityLabel="공개 전 미리보기. 다른 사람도 이 모습 그대로 봐요."
      accessibilityLiveRegion="polite"
      focusable
      ref={ribbonRef}
      style={styles.previewRibbon}>
      <View accessible={false} style={styles.previewRegister} />
      <View style={styles.previewCopy}>
        <Control>공개 전 미리보기</Control>
        <Meta>다른 사람도 이 모습 그대로 봐요.</Meta>
      </View>
    </FocusPressable>
  );
}

export function ShareProofDialog({
  visible,
  nextVisibility,
  answer,
  busy,
  error,
  onCancel,
  onConfirm,
  returnFocusRef,
  restoreFocus,
}: {
  visible: boolean;
  nextVisibility: 'private' | 'public';
  answer?: string;
  busy?: boolean;
  error?: string;
  onCancel(): void;
  onConfirm(): void;
  returnFocusRef?: ComponentProps<typeof BlockingDialog>['returnFocusRef'];
  restoreFocus?: boolean;
}) {
  const publishing = nextVisibility === 'public';
  return (
    <BlockingDialog
      busy={busy}
      cancelLabel={publishing ? '그대로 나만 보기' : '계속 보여주기'}
      confirmLabel={publishing ? '공개 모습에서 확인하기' : '나만 보기로 바꾸기'}
      description={publishing
        ? '지금 문장만 공개돼요. 이전 기록과 남긴 이유는 나만 볼 수 있어요.'
        : '방문자 화면에서는 바로 사라지고 내 기록은 남아요.'}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
      restoreFocus={restoreFocus}
      returnFocusRef={returnFocusRef}
      target={answer}
      testID="visibility-confirm-dialog"
      title={publishing ? '이 문장을 보여줄까요?' : '이 문장을 숨길까요?'}
      visible={visible}
    />
  );
}

export function FolioAction(props: ActionButtonProps) {
  return <ActionButton fullWidth {...props} />;
}

export function LayeredHistory({ children, accentColor = colors.indigo }: { children: ReactNode; accentColor?: string }) {
  return (
    <View style={styles.layeredHistory}>
      <View accessible={false} style={[styles.historyLayer, styles.historyLayerBack, { borderTopColor: accentColor }]} />
      <View accessible={false} style={[styles.historyLayer, styles.historyLayerMiddle]} />
      <View style={styles.historyContent}>{children}</View>
    </View>
  );
}

export type FolioStateVariant = 'empty' | 'loading' | 'error' | 'permission';

export function FolioState({ variant, title, description, action, skeleton = 'entry', rows = 2 }: {
  variant: FolioStateVariant;
  title?: string;
  description?: string;
  action?: { label: string; onPress(): void; loading?: boolean };
  skeleton?: 'cover' | 'entry' | 'choice' | 'history';
  rows?: number;
}) {
  if (variant === 'loading') {
    const skeletonStyle = skeleton === 'choice'
      ? styles.skeletonChoice
      : skeleton === 'history'
        ? styles.skeletonHistory
        : styles.skeletonEntry;
    return (
      <View accessibilityLabel="불러오는 중" accessibilityRole="progressbar" style={styles.skeletonGroup}>
        {skeleton === 'cover' ? <View style={[styles.skeletonBlock, styles.skeletonCover]} /> : null}
        {Array.from({ length: rows }, (_, item) => (
          <View key={item} style={[styles.skeletonBlock, skeletonStyle]} />
        ))}
      </View>
    );
  }
  const alert = variant === 'error' || variant === 'permission';
  return (
    <View
      accessibilityLiveRegion={alert ? 'assertive' : 'polite'}
      accessibilityRole={alert ? 'alert' : undefined}
      style={[styles.folioState, alert && styles.folioStateAlert]}>
      <View accessible={false} style={[styles.stateRegister, alert && styles.stateRegisterError]} />
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      {description ? <Body style={styles.stateDescription}>{description}</Body> : null}
      {action ? <FolioAction loading={action.loading} onPress={action.onPress} tone="quiet">{action.label}</FolioAction> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  headerExpanded: { minHeight: 52, flexDirection: 'column', alignItems: 'stretch' },
  headerSlot: { width: 72, height: 44 },
  headerSlotExpanded: { display: 'none' },
  headerControl: { minWidth: 72, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, borderRadius: radii.xs },
  headerControlExpanded: { width: '100%', justifyContent: 'flex-start' },
  headerControlLabel: { color: colors.indigoDeep },
  headerTitle: { flex: 1, color: colors.ink, textAlign: 'center', ...typeScale.navTitle },
  headerTitleExpanded: { width: '100%', textAlign: 'left' },
  cover: { position: 'relative', width: '100%', overflow: 'hidden', padding: space.lg, borderRadius: 20, backgroundColor: colors.surface },
  coverWithLead: { minHeight: layout.profileCoverWithLeadMinHeight },
  coverWithoutLead: { minHeight: layout.profileCoverMinHeight },
  coverCopy: { minWidth: 0, paddingRight: 42 },
  coverIntro: { color: colors.muted, marginTop: space.sm },
  coverLead: { marginTop: space.lg },
  sceneRegister: { position: 'absolute', top: 20, right: 18, width: 36, height: 76 },
  registerSheet: { position: 'absolute', width: 24, height: 64, borderRadius: 4 },
  registerSage: { left: 0, top: 0, backgroundColor: colors.sage },
  registerApricot: { left: 6, top: 6, backgroundColor: colors.apricot },
  registerIndigo: { left: 12, top: 12, backgroundColor: colors.indigo },
  entryReveal: { width: '100%' },
  entry: { position: 'relative', width: '100%', minHeight: layout.minTouch, paddingTop: space.mdLg, paddingRight: 0, paddingBottom: space.lg, paddingLeft: space.mdLg, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1, gap: space.sm },
  entryRegister: { position: 'absolute', top: space.mdLg, bottom: space.lg, left: 0, width: 3 },
  entryIndex: { color: colors.indigoDeep, fontFamily: fonts.sansBold },
  entryTitle: { color: colors.muted },
  entryDetail: { color: colors.muted, marginTop: space.xs },
  entryMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, marginTop: space.xs },
  entryMetaRowExpanded: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' },
  visibilityMeta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  readMoreButton: { minHeight: layout.minTouch, alignSelf: 'flex-start', justifyContent: 'center' },
  readMore: { color: colors.indigoDeep },
  promptSheet: { width: '100%', gap: space.sm, paddingTop: space.sm },
  promptGuidance: { color: colors.muted, marginTop: space.xs },
  choiceList: { width: '100%', marginTop: space.smMd, borderTopColor: colors.lineStrong, borderTopWidth: 1 },
  choice: { position: 'relative', width: '100%', minHeight: layout.optionMinHeight, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, borderBottomColor: colors.lineStrong, borderBottomWidth: 1, backgroundColor: 'transparent' },
  choiceWash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.indigoSoft },
  choiceRegister: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, backgroundColor: colors.indigo },
  swatch: { width: 20, height: 20, borderColor: colors.lineStrong, borderWidth: 1, borderRadius: 10 },
  choiceLabel: { flex: 1 },
  selectedLabel: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  selectedText: { color: colors.indigoDeep, fontFamily: fonts.sansBold },
  visibilityRow: { width: '100%', minHeight: layout.visibilityHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, borderTopColor: colors.lineStrong, borderTopWidth: 1 },
  visibilityRowExpanded: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingVertical: space.smMd },
  visibilityStatus: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  visibilityVerb: { color: colors.indigoDeep },
  inlineError: { color: colors.error, paddingVertical: space.sm },
  previewRibbon: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  previewRegister: { width: 8, height: 18, backgroundColor: colors.apricot },
  previewCopy: { flex: 1 },
  layeredHistory: { position: 'relative', width: '100%', paddingTop: space.smMd },
  historyLayer: { position: 'absolute', left: space.sm, right: space.sm, height: 28, borderTopWidth: 3, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  historyLayerBack: { top: 0, backgroundColor: colors.surfaceMuted },
  historyLayerMiddle: { top: 6, left: space.xs, right: space.xs, borderTopColor: colors.lineSubtle, backgroundColor: colors.surface },
  historyContent: { position: 'relative', width: '100%', backgroundColor: colors.surface },
  folioState: { position: 'relative', width: '100%', minHeight: 120, justifyContent: 'center', gap: space.sm, paddingVertical: space.lg, paddingLeft: space.mdLg },
  folioStateAlert: { padding: space.mdLg, borderRadius: 20, backgroundColor: colors.surface },
  stateRegister: { position: 'absolute', top: space.lg, bottom: space.lg, left: 0, width: 3, backgroundColor: colors.indigo },
  stateRegisterError: { backgroundColor: colors.error },
  stateDescription: { color: colors.muted },
  skeletonGroup: { width: '100%', gap: space.md },
  skeletonBlock: { width: '100%', borderRadius: 12, backgroundColor: colors.surfaceMuted },
  skeletonCover: { height: 160, borderRadius: 20 },
  skeletonEntry: { height: 148, borderRadius: 0 },
  skeletonChoice: { height: 64, borderRadius: 0 },
  skeletonHistory: { height: 220, borderRadius: 20 },
  pressed: { opacity: 0.68 },
});

export function useResponsiveGutter() {
  const { width } = useWindowDimensions();
  return screenGutter(width);
}
