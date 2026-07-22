import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/state/AuthProvider';
import { ActionButton } from '@/ui/ActionButton';
import { AppShell } from '@/ui/AppShell';
import { Screen } from '@/ui/Screen';
import { Body, Heading, Meta } from '@/ui/Type';
import { colors, radii, space } from '@/ui/tokens';

export default function AccountScreen() {
  const router = useRouter();
  const { user, busy, error, dismissError, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <AppShell>
      <Screen>
        <Heading accessibilityRole="header">계정</Heading>
        <View style={styles.accountCard}>
          <Meta>현재 로그인한 계정</Meta>
          <Body style={styles.email}>{user?.email}</Body>
          <Meta>{user?.displayName}</Meta>
        </View>
        {!confirming ? (
          <View style={styles.actions}>
            <ActionButton fullWidth onPress={() => { dismissError(); setConfirming(true); }} tone="paper">로그아웃</ActionButton>
            <ActionButton fullWidth onPress={() => router.back()} tone="quiet">현재의 나로 돌아가기</ActionButton>
          </View>
        ) : (
          <View accessibilityLiveRegion="polite" style={styles.confirmation}>
            <Heading>이 기기에서 로그아웃할까요?</Heading>
            <Body>남긴 기록과 공개 링크는 그대로 보관돼요.</Body>
            {error ? <Body accessibilityRole="alert" style={styles.error}>{error}</Body> : null}
            <ActionButton fullWidth loading={busy} onPress={() => void logout()}>로그아웃</ActionButton>
            <ActionButton fullWidth disabled={busy} onPress={() => { dismissError(); setConfirming(false); }} tone="quiet">계속 머물기</ActionButton>
          </View>
        )}
      </Screen>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  accountCard: { width: '100%', gap: space.sm, marginTop: space.lg, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: radii.lg, backgroundColor: colors.white },
  email: { flexShrink: 1 },
  actions: { width: '100%', gap: space.sm, marginTop: space.lg },
  confirmation: { width: '100%', gap: space.md, marginTop: space.lg, padding: space.lg, borderColor: colors.line, borderWidth: 1, borderRadius: radii.lg, backgroundColor: colors.white },
  error: { color: colors.error },
});
