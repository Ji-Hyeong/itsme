import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/ui/ActionButton';
import { BrandLogo } from '@/ui/BrandLogo';
import { FolioEntry, useResponsiveGutter } from '@/ui/Folio';
import { Body, Meta, Question, SectionTitle } from '@/ui/Type';
import { colors, fonts, layout, space } from '@/ui/tokens';

const sampleScenes = [
  { index: '01', label: '취향', title: '좋아하는 것', value: '비 온 뒤의 초록', accent: colors.apricot },
  { index: '02', label: '성격', title: '요즘의 나', value: '혼자서도 천천히 잘 걷는 사람', accent: colors.indigo },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const gutter = useResponsiveGutter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mobileFrame}>
        <View style={[styles.masthead, { paddingHorizontal: gutter }]}>
          <BrandLogo />
          <Text style={styles.privacyText}>새 문장은 나만 보기</Text>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter }]}>
          <View style={styles.copy}>
            <Meta style={styles.smallLabelText}>나를 알아가는 프로필</Meta>
            <Question accessibilityRole="header" style={styles.title}>남에게 보이기 전에, 나부터 알아보는 곳.</Question>
            <Body style={styles.description}>좋아하는 것, 잘하는 것, 아직 서툰 것까지. 비교하지 않고 지금의 나를 한 문장씩 남겨요.</Body>
            <View style={styles.actions}>
              <ActionButton fullWidth onPress={() => router.replace('/discover')}>첫 기록 남기기</ActionButton>
              <ActionButton fullWidth onPress={() => router.replace('/me')} tone="quiet">먼저 둘러보기</ActionButton>
            </View>
            <Body style={styles.promiseText}>답하지 않아도 괜찮고, 언제든 고치거나 지울 수 있어요.</Body>
          </View>

          <View accessibilityLabel="it'sME 프로필 예시" style={styles.profilePreview}>
            <SectionTitle>문장은 이렇게 놓여요</SectionTitle>
            <View style={styles.sceneList}>
              {sampleScenes.map((scene) => (
                <FolioEntry
                  accentColor={scene.accent}
                  answer={scene.value}
                  category={scene.label}
                  index={scene.index}
                  key={scene.title}
                  title={scene.title}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', backgroundColor: colors.paperDeep },
  mobileFrame: { flex: 1, width: '100%', maxWidth: layout.maxContent, backgroundColor: colors.paper },
  masthead: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, borderBottomColor: colors.lineSubtle, borderBottomWidth: 1, backgroundColor: colors.canvas },
  privacyText: { color: colors.indigoDeep, fontFamily: fonts.sansBold, fontSize: 11 },
  scrollContent: { paddingTop: space.xl, paddingBottom: space.xxl },
  copy: { width: '100%' },
  smallLabelText: { color: colors.indigoDeep, fontFamily: fonts.sansBold },
  title: { marginTop: space.smMd },
  description: { color: colors.mutedInk, marginTop: space.md },
  actions: { width: '100%', gap: space.xs, marginTop: space.lg },
  promiseText: { color: colors.muted, marginTop: space.md },
  profilePreview: { width: '100%', marginTop: space.xl },
  sceneList: { marginTop: space.sm },
});
