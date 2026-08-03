import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { categoryMeta, getCurrentVersion, type OwnerRecord, type Visibility } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { AppShell } from '@/ui/AppShell';
import { BlockingDialog } from '@/ui/BlockingDialog';
import { BottomActionBar } from '@/ui/BottomActionBar';
import { FocusPressable } from '@/ui/FocusPressable';
import { SceneCard } from '@/ui/SceneCard';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { StatePanel } from '@/ui/StatePanel';
import { Body, Control } from '@/ui/Type';
import { colors, layout, radii, space } from '@/ui/tokens';

type PendingChange = { record: OwnerRecord; visibility: Visibility };

export default function ShareScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= layout.largeTextScale;
  const {
    profile,
    loading,
    saving,
    error,
    clearError,
    refresh,
    prepareVisibilityPreview,
    clearVisibilityPreview,
    setVisibility,
  } = useItsme();
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [navigatingToPreview, setNavigatingToPreview] = useState(false);
  const [itemErrorRecordId, setItemErrorRecordId] = useState<string | null>(null);
  const visibilityRefs = useRef(new Map<string, ComponentRef<typeof FocusPressable>>());
  const pendingReturnFocusRef = useRef<ComponentRef<typeof FocusPressable>>(null);
  const records = profile?.records ?? [];

  const cancelPending = () => {
    clearError();
    clearVisibilityPreview();
    setNavigatingToPreview(false);
    setPending(null);
  };

  const confirmVisibility = async () => {
    if (!pending || saving) return;
    setItemErrorRecordId(null);

    if (pending.visibility === 'public') {
      // 공개 mutation은 이 화면에서 실행하지 않는다. 서버가 만든 후보만 받은 뒤 방문자와 같은 화면에서 확정한다.
      const prepared = await prepareVisibilityPreview({
        recordId: pending.record.id,
        visibility: 'public',
      });
      if (prepared) {
        // Expo Router가 이전 화면을 stack에 유지해도 Modal이 미리보기 위에 남지 않도록 먼저 닫는다.
        // 확정 이동은 취소가 아니므로 이전 switch로의 focus 복귀를 억제하고 Preview의 진입 focus를 따른다.
        setNavigatingToPreview(true);
        setPending(null);
        router.push('/preview');
      } else {
        setItemErrorRecordId(pending.record.id);
      }
      return;
    }

    const saved = await setVisibility({ recordId: pending.record.id, visibility: 'private' });
    if (saved) {
      setPending(null);
    } else {
      // 다른 카드의 공개 상태를 추정해 되돌리지 않고 실패한 항목만 명시해 병렬 변경과 안전하게 공존한다.
      setItemErrorRecordId(pending.record.id);
    }
  };

  const openPending = (record: OwnerRecord) => {
    clearError();
    clearVisibilityPreview();
    setItemErrorRecordId(null);
    setNavigatingToPreview(false);
    pendingReturnFocusRef.current = visibilityRefs.current.get(record.id) ?? null;
    setPending({ record, visibility: record.visibility === 'public' ? 'private' : 'public' });
  };

  const previewCurrentProfile = () => {
    clearError();
    clearVisibilityPreview();
    router.push('/preview');
  };

  return (
    <AppShell backgroundBlocked={Boolean(pending)}>
      <Screen bottomPadding={profile && !largeText ? 120 : undefined}>
        <ScreenHeader
          description="이름과 한 줄 소개는 기본으로 보여요. 아래 기록만 하나씩 공개하거나 숨길 수 있어요."
          title="보여줄 나 고르기"
        />

        {!profile && loading ? (
          <View style={styles.firstSection}>
            <StatePanel
              description="공개 범위를 안전하게 확인하고 있어요."
              skeletonRows={3}
              title="공개 범위를 불러오는 중"
              variant="loading"
            />
          </View>
        ) : null}

        {!profile && !loading && error ? (
          <View style={styles.firstSection}>
            <StatePanel
              action={{ label: '다시 불러오기', onPress: () => void refresh() }}
              description={error}
              title="공개 범위를 불러오지 못했어요."
              variant="error"
            />
          </View>
        ) : null}

        {profile && error && !pending && !itemErrorRecordId ? (
          <View style={styles.refreshError}>
            <StatePanel
              action={{ label: '다시 불러오기', onPress: () => void refresh() }}
              description={`${error} 현재 선택은 그대로 두었어요.`}
              title="최신 공개 범위를 확인하지 못했어요."
              variant="error"
            />
          </View>
        ) : null}

        {profile && !loading && records.length === 0 ? (
          <View style={styles.firstSection}>
            <StatePanel
              action={{ label: '질문 만나기', onPress: () => router.push('/discover') }}
              description="먼저 질문 하나를 만나 지금의 나를 남겨보세요."
              title="아직 고를 기록이 없어요"
              variant="empty"
            />
          </View>
        ) : null}

        {profile && records.length > 0 ? (
          <View style={styles.list}>
            {records.map((record) => {
              const current = getCurrentVersion(record);
              const isPublic = record.visibility === 'public';
              const itemHasError = itemErrorRecordId === record.id && Boolean(error);
              return (
                <View key={record.id} style={styles.recordGroup}>
                  <SceneCard
                    accentColor={categoryStyle[record.category].accent}
                    answer={current.answer}
                    category={categoryMeta[record.category].label}
                    title={record.title}
                  />
                  <FocusPressable
                    accessibilityHint={isPublic
                      ? '선택하면 방문자 화면에서 숨기기 전 확인합니다.'
                      : '선택하면 공개에서 제외되는 정보를 확인한 뒤 미리보기로 이동합니다.'}
                    accessibilityLabel={`${record.title}, 현재 ${isPublic ? '공개' : '나만 보기'}`}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: isPublic }}
                    onPress={() => openPending(record)}
                    ref={(node) => {
                      if (node) visibilityRefs.current.set(record.id, node);
                      else visibilityRefs.current.delete(record.id);
                    }}
                    style={({ focused, pressed }) => [
                      styles.visibility,
                      isPublic && styles.publicVisibility,
                      focused && styles.focused,
                      pressed && styles.pressed,
                    ]}>
                    <MaterialCommunityIcons
                      accessible={false}
                      color={isPublic ? colors.white : colors.muted}
                      name={isPublic ? 'eye-outline' : 'lock-outline'}
                      size={18}
                    />
                    <Control style={isPublic ? styles.publicVisibilityLabel : styles.privateVisibilityLabel}>
                      {isPublic ? '공개' : '나만 보기'}
                    </Control>
                  </FocusPressable>
                  {itemHasError ? (
                    <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.inlineError}>
                      <Body style={styles.errorText}>이 기록의 공개 범위를 바꾸지 못했어요. {error}</Body>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {profile ? (
          largeText ? (
            <BottomActionBar
              aboveTabBar
              contained
              forceInFlow
              primary={{ label: '공개 모습 미리보기', onPress: previewCurrentProfile }}
            />
          ) : null
        ) : null}
      </Screen>

      {profile && !largeText ? (
        <BottomActionBar
          aboveTabBar
          primary={{ label: '공개 모습 미리보기', onPress: previewCurrentProfile }}
        />
      ) : null}

      <BlockingDialog
        busy={saving}
        cancelLabel="취소"
        confirmLabel={pending?.visibility === 'public' ? '공개 모습 미리보기' : '공개 해제하기'}
        description={pending?.visibility === 'public'
          ? '과거 기록, 변화 이유와 작성 맥락은 공개되지 않아요.'
          : '방문자 화면에서 바로 사라지고 내 기록은 남아요.'}
        error={pending && itemErrorRecordId === pending.record.id ? error ?? undefined : undefined}
        onCancel={cancelPending}
        onConfirm={() => void confirmVisibility()}
        returnFocusRef={pendingReturnFocusRef}
        restoreFocus={!navigatingToPreview}
        target={pending ? getCurrentVersion(pending.record).answer : undefined}
        testID="visibility-confirm-dialog"
        title={pending?.visibility === 'public' ? '공개 모습을 먼저 확인할까요?' : '공개를 해제할까요?'}
        visible={Boolean(pending)}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  firstSection: { width: '100%', marginTop: space.lg },
  refreshError: { width: '100%', marginTop: space.md },
  list: { width: '100%', marginTop: space.lg, gap: space.smMd },
  recordGroup: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  visibility: {
    width: '100%',
    minHeight: layout.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderColor: colors.lineStrong,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  publicVisibility: { borderColor: colors.indigo, backgroundColor: colors.indigo },
  privateVisibilityLabel: { color: colors.muted },
  publicVisibilityLabel: { color: colors.white },
  inlineError: { width: '100%', padding: space.md, backgroundColor: colors.errorSoft },
  errorText: { color: colors.error },
  focused: {
    borderColor: colors.focus,
    outlineColor: colors.focus,
    outlineOffset: 2,
    outlineStyle: 'solid',
    outlineWidth: 3,
  },
  pressed: { opacity: 0.66 },
});
