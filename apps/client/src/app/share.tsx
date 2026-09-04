import { useRouter } from 'expo-router';
import type { ComponentRef } from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { categoryMeta, getCurrentVersion, type OwnerRecord, type Visibility } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { AppShell } from '@/ui/AppShell';
import { FocusPressable } from '@/ui/FocusPressable';
import { FolioAction, FolioEntry, FolioHeader, FolioState, ShareProofDialog, VisibilityRow } from '@/ui/Folio';
import { Screen } from '@/ui/Screen';
import { Body, Question } from '@/ui/Type';
import { colors, space } from '@/ui/tokens';

type PendingChange = { record: OwnerRecord; visibility: Visibility };

export default function ShareScreen() {
  const router = useRouter();
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
      <Screen>
        <FolioHeader heading={false} title="공개" />
        <View style={styles.lead}>
          <Question accessibilityRole="header">어떤 문장을 보여줄까요?</Question>
          <Body style={styles.policy}>이름과 한 줄 소개는 기본으로 보여요. 기록은 하나씩 선택할 수 있어요.</Body>
        </View>

        {!profile && loading ? (
          <View style={styles.firstSection}>
            <FolioState rows={3} skeleton="entry" variant="loading" />
          </View>
        ) : null}

        {!profile && !loading && error ? (
          <View style={styles.firstSection}>
            <FolioState
              action={{ label: '다시 불러오기', onPress: () => void refresh() }}
              description={error}
              title="공개 범위를 불러오지 못했어요."
              variant="error"
            />
          </View>
        ) : null}

        {profile && error && !pending && !itemErrorRecordId ? (
          <View style={styles.refreshError}>
            <FolioState
              action={{ label: '다시 불러오기', onPress: () => void refresh() }}
              description={`${error} 현재 선택은 그대로 두었어요.`}
              title="최신 공개 범위를 확인하지 못했어요."
              variant="error"
            />
          </View>
        ) : null}

        {profile && !loading && records.length === 0 ? (
          <View style={styles.firstSection}>
            <FolioState
              action={{ label: '질문 펼치기', onPress: () => router.push('/discover') }}
              description="먼저 질문 하나를 펼쳐 지금의 나를 남겨보세요."
              title="아직 고를 문장이 없어요."
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
                  <FolioEntry
                    accentColor={categoryStyle[record.category].accent}
                    answer={current.answer}
                    category={categoryMeta[record.category].label}
                    index={categoryStyle[record.category].folioIndex}
                    title={record.title}
                  />
                  <VisibilityRow
                    accessibilityLabel={`${record.title}, 현재 ${isPublic ? '공개' : '나만 보기'}, ${isPublic ? '숨기기' : '보여주기'}`}
                    error={itemHasError ? `이 문장의 공개 범위를 바꾸지 못했어요. ${error}` : undefined}
                    onPress={() => openPending(record)}
                    controlRef={(node) => {
                      if (node) visibilityRefs.current.set(record.id, node);
                      else visibilityRefs.current.delete(record.id);
                    }}
                    visibility={record.visibility}
                  />
                </View>
              );
            })}
          </View>
        ) : null}

        {profile && records.length > 0 ? (
          <View style={styles.previewAction} testID="share-preview-action">
            <FolioAction onPress={previewCurrentProfile} tone="quiet">현재 공개 모습 보기</FolioAction>
          </View>
        ) : null}
      </Screen>

      <ShareProofDialog
        answer={pending ? getCurrentVersion(pending.record).answer : undefined}
        busy={saving}
        error={pending && itemErrorRecordId === pending.record.id ? error ?? undefined : undefined}
        nextVisibility={pending?.visibility ?? 'private'}
        onCancel={cancelPending}
        onConfirm={() => void confirmVisibility()}
        returnFocusRef={pendingReturnFocusRef}
        restoreFocus={!navigatingToPreview}
        visible={Boolean(pending)}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  lead: { width: '100%', gap: space.sm, marginTop: space.sm },
  policy: { color: colors.muted },
  firstSection: { width: '100%', marginTop: space.lg },
  refreshError: { width: '100%', marginTop: space.md },
  list: { width: '100%', marginTop: space.md },
  recordGroup: {
    width: '100%',
  },
  previewAction: { width: '100%', marginTop: 'auto', paddingTop: space.lg },
});
