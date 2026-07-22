import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/ui/ActionButton';
import { BrandLogo } from '@/ui/BrandLogo';
import { Body, Meta } from '@/ui/Type';
import { colors, fonts, layout, radii, space } from '@/ui/tokens';

const sampleScenes = [
  { label: '좋아하는 것', value: '비 온 뒤의 초록', accent: colors.sage },
  { label: '요즘의 나', value: '혼자서도 천천히 잘 걷는 사람', accent: colors.brand },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mobileFrame}>
        <View style={styles.masthead}>
          <BrandLogo />
          <View style={styles.privacyBadge}>
            <MaterialCommunityIcons color={colors.brandDeep} name="lock-outline" size={13} />
            <Text style={styles.privacyText}>나만 보기로 시작</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.copy}>
            <View style={styles.smallLabel}><View style={styles.labelDot} /><Text style={styles.smallLabelText}>나를 알아가는 프로필</Text></View>
            <Text accessibilityRole="header" style={styles.title}>남에게 보이기 전에, 나부터 알아보는 곳.</Text>
            <Body style={styles.description}>좋아하는 것, 잘하는 것, 아직 서툰 것까지. 비교하지 않고 지금의 나를 한 문장씩 남겨요.</Body>
            <View style={styles.actions}>
              <ActionButton fullWidth onPress={() => router.replace('/discover')}>첫 기록 남기기</ActionButton>
              <ActionButton fullWidth onPress={() => router.replace('/me')} tone="quiet">먼저 둘러보기</ActionButton>
            </View>
            <View style={styles.promiseRow}>
              <MaterialCommunityIcons color={colors.sage} name="shield-check-outline" size={19} />
              <Text style={styles.promiseText}>답하지 않아도 괜찮고, 언제든 고치거나 지울 수 있어요.</Text>
            </View>
          </View>

          <View accessibilityLabel="it'sME 프로필 예시" style={styles.profilePreview}>
            <View style={styles.previewHead}>
              <BrandLogo markOnly size={45} />
              <Meta>나의 장면</Meta>
            </View>
            <Text style={styles.previewName}>지금의 나</Text>
            <Body style={styles.previewIntro}>한 문장으로 다 설명하지 않아도 괜찮아요.</Body>
            <View style={styles.sceneList}>
              {sampleScenes.map((scene) => (
                <View key={scene.label} style={[styles.scene, { borderLeftColor: scene.accent }]}>
                  <Meta>{scene.label}</Meta>
                  <Text style={styles.sceneValue}>{scene.value}</Text>
                </View>
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
  masthead: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, paddingHorizontal: layout.mobileGutter, borderBottomColor: colors.line, borderBottomWidth: 1, backgroundColor: colors.white },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: 9, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.brandSoft },
  privacyText: { color: colors.brandDeep, fontFamily: fonts.sansBold, fontSize: 11 },
  scrollContent: { paddingHorizontal: layout.mobileGutter, paddingTop: space.xl, paddingBottom: space.xxl },
  copy: { width: '100%' },
  smallLabel: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: 11, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.white },
  labelDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand },
  smallLabelText: { color: colors.brandDeep, fontFamily: fonts.sansBold, fontSize: 12 },
  title: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 38, letterSpacing: -1.2, lineHeight: 50, marginTop: space.lg },
  description: { color: colors.mutedInk, marginTop: space.md },
  actions: { width: '100%', gap: space.xs, marginTop: space.lg },
  promiseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginTop: space.md },
  promiseText: { flex: 1, color: colors.mutedInk, fontFamily: fonts.sans, fontSize: 13, lineHeight: 21 },
  profilePreview: { width: '100%', marginTop: space.xl, padding: 20, borderColor: colors.line, borderWidth: 1, borderRadius: radii.xl, backgroundColor: colors.white },
  previewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewName: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 28, letterSpacing: -0.8, lineHeight: 38, marginTop: space.xl },
  previewIntro: { color: colors.mutedInk, marginTop: space.xs },
  sceneList: { gap: 10, marginTop: space.lg },
  scene: { minHeight: 110, justifyContent: 'space-between', padding: space.md, borderColor: colors.line, borderWidth: 1, borderLeftWidth: 4, borderRadius: radii.md, backgroundColor: colors.surfaceMuted },
  sceneValue: { color: colors.ink, fontFamily: fonts.sansBold, fontSize: 20, letterSpacing: -0.4, lineHeight: 30, marginTop: space.md },
});
