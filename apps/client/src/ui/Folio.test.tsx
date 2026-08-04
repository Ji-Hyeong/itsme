import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated, Dimensions, StyleSheet } from 'react-native';

import { ChoiceList, FolioCover, FolioEntry, VisibilityRow } from '@/ui/Folio';

const mobileWindow = { width: 390, height: 844, scale: 1, fontScale: 1 };

describe('Living Folio 접근성·반응형 계약', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Dimensions.set({ screen: mobileWindow, window: mobileWindow });
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  });

  test('200% 글자 확대에서는 entry 메타와 공개 상태 control을 세로로 쌓는다', async () => {
    const expandedWindow = { ...mobileWindow, fontScale: 2 };
    Dimensions.set({ screen: expandedWindow, window: expandedWindow });
    const screen = await render(
      <>
        <FolioEntry
          answer="이끼 초록"
          category="취향"
          date="7월 20일에 바꿈"
          index="01"
          testID="entry"
          visibility="private"
        />
        <VisibilityRow onPress={jest.fn()} testID="visibility" visibility="private" />
      </>,
    );

    expect(StyleSheet.flatten(screen.getByTestId('entry-meta').props.style)).toMatchObject({
      alignItems: 'flex-start',
      flexDirection: 'column',
    });
    expect(StyleSheet.flatten(screen.getByTestId('visibility').props.style)).toMatchObject({
      alignItems: 'flex-start',
      flexDirection: 'column',
    });
  });

  test('클릭 가능한 entry의 접근성 이름에 범주와 질문 제목을 시각 순서대로 포함한다', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <FolioEntry
        answer="이끼 초록"
        category="취향"
        date="7월 20일에 바꿈"
        index="01"
        onPress={onPress}
        title="요즘 눈이 가는 색"
        visibility="private"
      />,
    );

    fireEvent.press(screen.getByLabelText('취향, 요즘 눈이 가는 색, 이끼 초록, 7월 20일에 바꿈, 나만 보기'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('Scene Register는 로고 대신 24x64 장면 세 장을 6pt씩 겹친다', async () => {
    const screen = await render(<FolioCover displayName="지금의 나" />);
    const queryOptions = { includeHiddenElements: true };

    expect(StyleSheet.flatten(screen.getByTestId('scene-register-sage', queryOptions).props.style)).toMatchObject({
      height: 64,
      left: 0,
      top: 0,
      width: 24,
    });
    expect(StyleSheet.flatten(screen.getByTestId('scene-register-apricot', queryOptions).props.style)).toMatchObject({ left: 6, top: 6 });
    expect(StyleSheet.flatten(screen.getByTestId('scene-register-indigo', queryOptions).props.style)).toMatchObject({ left: 12, top: 12 });
  });

  test('일반 모션에서는 entry가 180ms opacity와 8pt 이동으로 한 번 드러난다', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const timing = jest.spyOn(Animated, 'timing');

    await render(<FolioEntry answer="천천히 쉬는 법" category="배우는 중" index="05" />);

    await waitFor(() => {
      const configs = timing.mock.calls.map(([, config]) => config);
      expect(configs).toEqual(expect.arrayContaining([
        expect.objectContaining({ duration: 180, toValue: 1, useNativeDriver: true }),
        expect.objectContaining({ duration: 180, toValue: 0, useNativeDriver: true }),
      ]));
    });
  });

  test('축소 모션에서는 이동 없이 100ms 이하 opacity만 사용한다', async () => {
    const timing = jest.spyOn(Animated, 'timing');

    await render(<FolioEntry answer="천천히 쉬는 법" category="배우는 중" index="05" />);

    await waitFor(() => {
      expect(timing).toHaveBeenCalled();
      const configs = timing.mock.calls.map(([, config]) => config);
      expect(configs.every((config) => (config.duration ?? 0) <= 100)).toBe(true);
      expect(configs.some((config) => config.toValue === 0)).toBe(false);
    });
  });

  test('축소 모션 설정 조회가 실패해도 opacity-only 복구로 entry를 드러낸다', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(new Error('설정 조회 실패'));
    const timing = jest.spyOn(Animated, 'timing');

    const screen = await render(
      <FolioEntry answer="천천히 쉬는 법" category="배우는 중" index="05" testID="fallback-entry" />,
    );

    await waitFor(() => {
      expect(screen.getByText('천천히 쉬는 법')).toBeTruthy();
      expect(timing).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ duration: 80, toValue: 1, useNativeDriver: true }),
      );
    });
  });

  test('선택 상태는 색만 바꾸지 않고 check와 선택됨 문구를 함께 드러낸다', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <ChoiceList
        onChange={onChange}
        options={[{ label: '이끼 초록', value: 'green' }]}
        value="green"
      />,
    );

    expect(screen.getByText('선택됨')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('이끼 초록, 선택됨'));
    expect(onChange).toHaveBeenCalledWith('green');
  });
});
