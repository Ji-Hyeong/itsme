import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { categoryMeta, getCurrentVersion, type OwnerRecord, type Visibility } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { useItsme } from '@/state/ItsmeProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { FocusPressable } from '@/ui/FocusPressable';
import { Screen } from '@/ui/Screen';
import { Body, Display, Eyebrow, Heading, Meta } from '@/ui/Type';
import { colors, fonts, layout, space } from '@/ui/tokens';

type PendingChange = { record: OwnerRecord; visibility: Visibility };

export default function ShareScreen() {
  const router = useRouter();
  const {
    profile,
    publicProfile,
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
  const records = profile?.records ?? [];

  const confirmVisibility = async () => {
    if (!pending) return;
    if (pending.visibility === 'public') {
      const prepared = await prepareVisibilityPreview({
        recordId: pending.record.id,
        visibility: 'public',
      });
      if (prepared) router.push('/preview');
      return;
    }
    const saved = await setVisibility({ recordId: pending.record.id, visibility: 'private' });
    if (saved) setPending(null);
  };

  return (
    <AppShell>
      <Screen>
        <Eyebrow>공개할 기록</Eyebrow>
        <Display accessibilityRole="header">보여줄 나 고르기</Display>
        <Body style={styles.intro}>공개할 항목이 없어도 괜찮아요. 저장과 공개는 언제나 다른 행동이에요.</Body>

        {pending ? (
          <View accessibilityLiveRegion="polite" style={styles.confirmation}>
            <View style={styles.confirmationLabel}>
              <Meta style={styles.confirmationLabelText}>{pending.visibility === 'public' ? '공개 전 확인' : '공개 해제 전 확인'}</Meta>
            </View>
            <Heading style={styles.confirmationAnswer}>{getCurrentVersion(pending.record).answer}</Heading>
            <Body>
              {pending.visibility === 'public'
                ? '아직 공개되지는 않아요. 방문자와 같은 화면을 확인한 뒤에만 최종 공개할 수 있어요.'
                : '이 항목은 방문자 화면에서 바로 사라집니다. 내 기록과 이력은 그대로 남아요.'}
            </Body>
            {error ? <Body style={styles.error}>{error}</Body> : null}
            <View style={styles.confirmationActions}>
              <ActionButton fullWidth loading={saving} onPress={() => void confirmVisibility()}>
                {pending.visibility === 'public' ? '공개 모습 확인하기' : '공개 해제하기'}
              </ActionButton>
              <ActionButton
                disabled={saving}
                onPress={() => {
                  clearError();
                  clearVisibilityPreview();
                  setPending(null);
                }}
                fullWidth
                tone="quiet">
                취소
              </ActionButton>
            </View>
          </View>
        ) : null}

        {loading ? <Body accessibilityRole="progressbar" style={styles.state}>공개 범위를 불러오는 중…</Body> : null}
        {!loading && error && !profile ? (
          <View accessibilityLiveRegion="assertive" style={styles.empty}>
            <Heading>공개 범위를 불러오지 못했어요.</Heading>
            <Body style={styles.error}>{error}</Body>
            <View style={styles.startAction}><ActionButton fullWidth onPress={() => void refresh()} tone="paper">다시 불러오기</ActionButton></View>
          </View>
        ) : null}
        {!loading && !error && records.length === 0 ? (
          <View style={styles.empty}>
            <Heading>아직 고를 기록이 없어요.</Heading>
            <Body style={styles.intro}>먼저 질문 하나를 만나 지금의 나를 남겨보세요.</Body>
            <View style={styles.startAction}><ActionButton fullWidth onPress={() => router.push('/discover')}>질문 만나기</ActionButton></View>
          </View>
        ) : null}

        <View style={styles.list}>
          {records.map((record) => {
            const current = getCurrentVersion(record);
            const isPublic = record.visibility === 'public';
            const tone = categoryStyle[record.category];
            return (
              <View key={record.id} style={styles.item}>
                <View accessible={false} style={[styles.categoryAccent, { backgroundColor: tone.accent }]} />
                <View style={styles.itemBody}>
                  <Meta>{categoryMeta[record.category].label} · {record.title}</Meta>
                  <Text style={styles.answer}>{current.answer}</Text>
                </View>
                <FocusPressable
                  accessibilityHint="선택 후 공개 결과를 한 번 더 확인합니다"
                  accessibilityLabel={`${record.title}, 현재 ${isPublic ? '공개' : '나만 보기'}`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isPublic }}
                  onPress={() => {
                    clearError();
                    clearVisibilityPreview();
                    setPending({ record, visibility: isPublic ? 'private' : 'public' });
                  }}
                  style={({ focused, pressed }) => [
                    styles.visibility,
                    isPublic && styles.publicVisibility,
                    focused && styles.focused,
                    pressed && styles.pressed,
                  ]}>
                  <MaterialCommunityIcons
                    color={isPublic ? colors.white : colors.mutedInk}
                    name={isPublic ? 'eye-outline' : 'lock-outline'}
                    size={17}
                  />
                  <Text style={[styles.visibilityLabel, isPublic && styles.publicVisibilityLabel]}>
                    {isPublic ? '공개' : '나만 보기'}
                  </Text>
                </FocusPressable>
              </View>
            );
          })}
        </View>

        {profile ? <View style={styles.previewSummary}>
          <View style={styles.previewCopy}>
            <Eyebrow>공개 모습 미리보기</Eyebrow>
            <Heading>지금 보이는 모습</Heading>
            <Body style={styles.intro}>
              {publicProfile?.records.length
                ? '선택한 이야기만 방문자에게 보여요.'
                : '아직 공개한 이야기가 없어요. 이 상태도 온전한 공개 프로필이에요.'}
            </Body>
          </View>
          <ActionButton
            fullWidth
            onPress={() => {
              clearError();
              clearVisibilityPreview();
              router.push('/preview');
            }}
            tone="paper">
            실제 모습 미리보기
          </ActionButton>
        </View> : null}
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  intro: { width: '100%', color: colors.mutedInk, marginTop: space.sm },
  state: { marginTop: space.xxl },
  confirmation: { width: '100%', marginTop: space.lg, padding: space.lg, borderColor: colors.line, borderLeftColor: colors.brand, borderLeftWidth: 4, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1, borderRadius: 18, backgroundColor: colors.white, gap: space.md },
  confirmationLabel: { alignSelf: 'flex-start', paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: 999, backgroundColor: colors.ink },
  confirmationLabelText: { color: colors.white },
  confirmationAnswer: { width: '100%', marginTop: space.xs, fontSize: 24, lineHeight: 36 },
  confirmationActions: { width: '100%', alignItems: 'stretch', gap: space.xs, marginTop: space.md },
  error: { color: colors.error },
  empty: { width: '100%', marginTop: space.xl, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  startAction: { width: '100%', marginTop: space.lg },
  list: { width: '100%', marginTop: space.xl, gap: space.sm },
  item: { width: '100%', flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden', borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  categoryAccent: { width: '100%', height: 4 },
  itemBody: { flex: 1, minWidth: 0, justifyContent: 'center', paddingHorizontal: space.lg, paddingVertical: space.md },
  answer: { color: colors.ink, fontFamily: fonts.serifBold, fontSize: 22, lineHeight: 32, marginTop: space.xs },
  visibility: { width: '100%', minHeight: layout.minTouch, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: space.sm, paddingVertical: space.md, borderTopColor: colors.line, borderTopWidth: 1, backgroundColor: colors.white },
  publicVisibility: { backgroundColor: colors.ink, borderColor: colors.ink },
  visibilityLabel: { color: colors.mutedInk, fontFamily: fonts.sansMedium, fontSize: 12 },
  publicVisibilityLabel: { color: colors.white },
  focused: { borderColor: colors.focus, borderWidth: 3 },
  pressed: { opacity: 0.64 },
  previewSummary: { width: '100%', alignItems: 'stretch', gap: space.lg, marginTop: space.xl, marginBottom: space.xxl, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: 18, backgroundColor: colors.white },
  previewCopy: { width: '100%' },
});
