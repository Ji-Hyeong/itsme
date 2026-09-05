import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/state/AuthProvider';
import { ActionButton } from '@/ui/ActionButton';
import { BrandLogo } from '@/ui/BrandLogo';
import { useResponsiveGutter } from '@/ui/Folio';
import { Body, Heading } from '@/ui/Type';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

export function SessionGate({ children }: { children: ReactNode }) {
  const gutter = useResponsiveGutter();
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, busy, error, retry, leaveToLogin, login, dismissError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const expiredUserId = useRef<string | null>(null);
  const isPublicRoute = pathname.startsWith('/p/');

  useEffect(() => {
    if (status === 'expired') {
      expiredUserId.current = user?.id ?? null;
      return;
    }
    if (status === 'authenticated' && expiredUserId.current) {
      const switchedAccount = user?.id !== expiredUserId.current;
      expiredUserId.current = null;
      if (switchedAccount) {
        // 다른 계정의 화면에 이전 라우트 draft가 남지 않도록 개인 홈을 새 루트로 삼는다.
        router.replace('/me');
      }
    }
  }, [router, status, user?.id]);

  if (!isPublicRoute && status === 'bootstrapping') {
    return <SessionState title="내 기록을 불러오는 중…" />;
  }

  if (!isPublicRoute && status === 'error') {
    return (
      <SessionState title="지금은 기록을 불러오지 못했어요" description={error ?? undefined}>
        <ActionButton fullWidth onPress={() => void retry()}>다시 불러오기</ActionButton>
        <ActionButton fullWidth onPress={() => void leaveToLogin()} tone="paper">로그인 화면으로</ActionButton>
      </SessionState>
    );
  }

  const submitReauthentication = async () => {
    await login({ email, password });
  };

  return (
    <>
      {children}
      <Modal
        accessibilityViewIsModal
        animationType="fade"
        onRequestClose={() => undefined}
        transparent={false}
        visible={!isPublicRoute && status === 'expired'}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.frame, { paddingHorizontal: gutter }]}>
            <BrandLogo />
            <Heading accessibilityRole="header" style={styles.title}>로그인이 만료됐어요</Heading>
            <Body style={styles.description}>작성한 내용은 이 화면에 그대로 있어요. 다시 로그인한 뒤 직접 저장해 주세요.</Body>
            <View style={styles.form}>
              <Body style={styles.label}>이메일</Body>
              <TextInput
                accessibilityLabel="이메일"
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                maxLength={320}
                onBlur={() => setFocusedField(null)}
                onChangeText={(value) => { dismissError(); setEmail(value); }}
                onFocus={() => setFocusedField('email')}
                style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                value={email}
              />
              <Body style={styles.label}>비밀번호</Body>
              <TextInput
                accessibilityLabel="비밀번호"
                autoCapitalize="none"
                autoComplete="current-password"
                maxLength={72}
                onBlur={() => setFocusedField(null)}
                onChangeText={(value) => { dismissError(); setPassword(value); }}
                onFocus={() => setFocusedField('password')}
                secureTextEntry
                style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                value={password}
              />
              {error ? <Body accessibilityLiveRegion="assertive" style={styles.error}>{error}</Body> : null}
              <ActionButton
                fullWidth
                disabled={!email.trim() || !password}
                loading={busy}
                onPress={() => void submitReauthentication()}>
                다시 로그인
              </ActionButton>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function SessionState({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  const gutter = useResponsiveGutter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View accessibilityLiveRegion="polite" style={[styles.frame, { paddingHorizontal: gutter }]}>
        <BrandLogo markOnly size={54} />
        <Heading accessibilityRole="header" style={styles.title}>{title}</Heading>
        {description ? <Body style={styles.description}>{description}</Body> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  frame: { width: '100%', maxWidth: layout.maxContent, alignItems: 'stretch', paddingVertical: layout.mobileGutter },
  title: { marginTop: space.lg },
  description: { color: colors.mutedInk, marginTop: space.sm },
  form: { width: '100%', gap: space.sm, marginTop: space.xl },
  label: { fontFamily: fonts.sansBold },
  input: { minHeight: 52, width: '100%', color: colors.ink, fontFamily: fonts.sans, fontSize: 16, paddingHorizontal: space.md, borderColor: colors.line, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.white },
  inputFocused: { outlineColor: colors.focus, outlineOffset: 2, outlineStyle: 'solid', outlineWidth: 3 },
  error: { color: colors.error, padding: space.md, borderRadius: radii.md, backgroundColor: colors.errorSoft },
  actions: { width: '100%', gap: space.sm, marginTop: space.xl },
});
