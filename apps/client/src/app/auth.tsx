import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import type { ComponentProps, RefObject, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/state/AuthProvider';
import { ActionButton } from '@/ui/ActionButton';
import { BrandLogo } from '@/ui/BrandLogo';
import { FocusPressable } from '@/ui/FocusPressable';
import { Body, Heading, Meta } from '@/ui/Type';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export default function AuthScreen() {
  const router = useRouter();
  const { busy, error, dismissError, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    const nextErrors = validate(email, password);
    setFieldErrors(nextErrors);
    if (nextErrors.email) emailRef.current?.focus();
    else if (nextErrors.password) passwordRef.current?.focus();
    if (nextErrors.email || nextErrors.password) {
      AccessibilityInfo.announceForAccessibility('입력 내용을 확인해 주세요.');
      return;
    }

    if (await login({ email: email.trim(), password })) {
      AccessibilityInfo.announceForAccessibility('로그인했어요.');
      router.replace('/me');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.frame}>
          <BrandLogo />
          <View style={styles.copy}>
            <Heading accessibilityRole="header">내 기록으로 돌아가기</Heading>
            <Body style={styles.description}>초대받은 내부 테스터 계정으로 로그인해 주세요. 남겨 둔 장면과 변화가 같은 자리에서 기다리고 있어요.</Body>
          </View>
          <View style={styles.form}>
            <Field
              autoCapitalize="none"
              autoComplete="email"
              error={fieldErrors.email}
              inputMode="email"
              inputRef={emailRef}
              label="이메일"
              maxLength={320}
              onChangeText={(value) => { dismissError(); setFieldErrors((current) => ({ ...current, email: undefined })); setEmail(value); }}
              onSubmitEditing={() => passwordRef.current?.focus()}
              returnKeyType="next"
              value={email}
            />
            <Field
              autoCapitalize="none"
              autoComplete="current-password"
              error={fieldErrors.password}
              inputRef={passwordRef}
              label="비밀번호"
              maxLength={72}
              onChangeText={(value) => { dismissError(); setFieldErrors((current) => ({ ...current, password: undefined })); setPassword(value); }}
              onSubmitEditing={() => void submit()}
              returnKeyType="done"
              secureTextEntry={!showPassword}
              value={password}
              trailingAction={
                <FocusPressable
                  accessibilityLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showPassword }}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={({ focused, pressed }) => [styles.passwordToggle, focused && styles.focused, pressed && styles.pressed]}>
                  <MaterialCommunityIcons color={colors.brandDeep} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} />
                  <Text style={styles.passwordToggleText}>{showPassword ? '숨기기' : '보기'}</Text>
                </FocusPressable>
              }
            />
            {error ? (
              <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.requestError}>
                <Text style={styles.errorTitle}>로그인하지 못했어요</Text>
                <Body style={styles.errorText}>{error}</Body>
              </View>
            ) : null}
            <ActionButton fullWidth loading={busy} onPress={() => void submit()}>로그인</ActionButton>
            <Meta style={styles.privacyNote}>계정이 필요하면 내부 알파 운영자에게 초대를 요청해 주세요. 이메일과 비밀번호는 공개 프로필에 포함하지 않아요.</Meta>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  error?: string;
  inputRef: RefObject<TextInput | null>;
  label: string;
  trailingAction?: ReactNode;
};

function Field({ error, inputRef, label, trailingAction, style, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.faintInk}
          ref={inputRef}
          style={[styles.input, trailingAction ? styles.inputWithAction : null, error ? styles.inputError : null, style]}
          {...props}
        />
        {trailingAction ? <View style={styles.trailingAction}>{trailingAction}</View> : null}
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = '이메일을 입력해 주세요.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = '이메일 형식을 다시 확인해 주세요.';
  if (!password) errors.password = '비밀번호를 입력해 주세요.';
  return errors;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', backgroundColor: colors.paperDeep },
  scrollContent: { flexGrow: 1 },
  frame: { width: '100%', maxWidth: layout.maxContent, alignSelf: 'center', paddingHorizontal: layout.mobileGutter, paddingTop: space.lg, paddingBottom: space.xxl, backgroundColor: colors.paper },
  copy: { marginTop: space.xl },
  description: { color: colors.mutedInk, marginTop: space.sm },
  form: { width: '100%', gap: space.md, marginTop: space.xl },
  field: { width: '100%', gap: space.xs },
  label: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 22 },
  inputRow: { position: 'relative', width: '100%' },
  input: { width: '100%', minHeight: 52, color: colors.ink, fontFamily: fonts.sans, fontSize: 16, paddingHorizontal: space.md, borderColor: colors.line, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.white },
  inputWithAction: { paddingRight: 96 },
  inputError: { borderColor: colors.error, borderWidth: 2 },
  trailingAction: { position: 'absolute', top: 4, right: 4 },
  passwordToggle: { minWidth: 84, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, borderColor: 'transparent', borderWidth: 2, borderRadius: radii.sm },
  passwordToggleText: { color: colors.brandDeep, fontFamily: fonts.sansBold, fontSize: 13 },
  fieldError: { color: colors.error, fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20 },
  requestError: { width: '100%', gap: space.xs, padding: space.md, borderRadius: radii.md, backgroundColor: colors.errorSoft },
  errorTitle: { color: colors.error, fontFamily: fonts.sansBold, fontSize: 15 },
  errorText: { color: colors.error },
  privacyNote: { textAlign: 'center' },
  focused: { borderColor: colors.focus },
  pressed: { opacity: 0.65 },
});
