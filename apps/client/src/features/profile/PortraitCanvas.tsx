import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { categoryMeta, getCurrentVersion, type OwnerRecord } from '@/domain/profile';
import { categoryStyle } from '@/features/profile/category-style';
import { FolioEntry, FolioState } from '@/ui/Folio';
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
        <FolioState
          action={{ label: '질문 하나 펼쳐보기', onPress: () => router.push('/discover') }}
          title="아직 문장으로 정하지 않은 나도 그대로 괜찮아요."
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
          <FolioEntry
            accentColor={categoryStyle[record.category].accent}
            answer={current.answer}
            category={categoryMeta[record.category].label}
            date={`${formatRecordedAt(current.recordedAt)}에 바꿈`}
            index={categoryStyle[record.category].folioIndex}
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
  list: { width: '100%', marginTop: space.sm },
  empty: { width: '100%', marginTop: space.sm },
});
