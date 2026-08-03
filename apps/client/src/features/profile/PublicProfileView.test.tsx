import { render } from '@testing-library/react-native';

import { PublicProfileSchema } from '@/domain/profile';
import { PublicProfileView } from '@/features/profile/PublicProfileView';

describe('PublicProfileView', () => {
  test('공개 항목이 없어도 미완성이 아닌 중립적인 방문자 화면을 보여준다', async () => {
    const profile = PublicProfileSchema.parse({
      displayName: '지금의 나',
      records: [],
    });

    const screen = await render(<PublicProfileView profile={profile} />);

    expect(screen.getByText('공개한 기록은 아직 없어요.')).toBeTruthy();
    expect(screen.queryByText(/미완성|완성도|팔로워|좋아요/)).toBeNull();
  });

  test('공개 계약으로 전달된 현재 답을 방문자용 지면에 렌더링한다', async () => {
    const profile = PublicProfileSchema.parse({
      displayName: '지금의 나',
      records: [
        {
          category: 'preference',
          title: '좋아하는 색',
          answer: '이끼 초록',
        },
      ],
    });

    const screen = await render(<PublicProfileView profile={profile} />);

    expect(screen.getByText('이끼 초록')).toBeTruthy();
    expect(screen.getByText('좋아하는 색')).toBeTruthy();
  });
});
