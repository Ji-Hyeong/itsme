import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { categoryMeta, getCurrentVersion, type OwnerRecord } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { SceneCard } from '@/ui/SceneCard';
import { StatePanel } from '@/ui/StatePanel';
import { space } from '@/ui/tokens';

function formatRecordedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(value));
}

/** 모바일에서는 모든 범주를 같은 크기로 보여 첫 기록에 임의의 우선순위를 만들지 않는다. */
export function PortraitCanvas({ records }: { records: readonly OwnerRecord[] }) {
  const router = useRouter();

  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <StatePanel
          action={{ label: '질문 하나 만나기', onPress: () => router.push('/discover') }}
          description="지금 답하기 편한 질문 하나부터 만나보세요."
          title="아직 말로 정하지 않은 나도 괜찮아요"
          variant="empty"
        />
      </View>
    );
  }

  return (
    <View accessibilityLabel="현재의 나를 이루는 기록" style={styles.list}>
      {records.map((record) => {
        const current = getCurrentVersion(record);
        return (
          <SceneCard
            accentColor={categoryStyle[record.category].accent}
            answer={current.answer}
            category={categoryMeta[record.category].label}
            date={`${formatRecordedAt(current.recordedAt)}에 바꿈`}
            key={record.id}
            onPress={() => router.push({ pathname: '/record/[id]', params: { id: record.id } })}
            title={record.title}
            visibility={record.visibility}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { width: '100%', gap: 12, marginTop: space.md },
  empty: { width: '100%', marginTop: space.md },
});
