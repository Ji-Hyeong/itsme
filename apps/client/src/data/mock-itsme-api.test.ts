import { MockItsmeApi } from '@/data/mock-itsme-api';

describe('MockItsmeApi 공개 경계와 버전 이력', () => {
  test('새 기록은 나만 보기이며 공개 응답에는 원문 자체가 포함되지 않는다', async () => {
    const api = new MockItsmeApi();

    const owner = await api.saveAnswer({
      questionId: 'favorite-color',
      answer: '이끼 초록',
      context: '비 오는 날의 숲을 떠올리게 해서',
    });
    const publicProfile = await api.getPublicProfile('my-scene');

    expect(owner.records[0].visibility).toBe('private');
    expect(publicProfile.records).toEqual([]);
    expect(JSON.stringify(publicProfile)).not.toContain('이끼 초록');
    expect(JSON.stringify(publicProfile)).not.toContain('비 오는 날의 숲');
  });

  test('공개 응답은 허용한 현재 답만 포함하고 owner 전용 필드를 직렬화하지 않는다', async () => {
    const api = new MockItsmeApi();
    const owner = await api.saveAnswer({ questionId: 'mbti-now', answer: 'INFP' });
    const recordId = owner.records[0].id;
    const preview = await api.previewPublicProfile({ recordId, visibility: 'public' });

    await api.setVisibility({ recordId, visibility: 'public', previewToken: preview.previewToken });
    const publicProfile = await api.getPublicProfile('my-scene');
    const serialized = JSON.stringify(publicProfile);

    expect(publicProfile.records[0].answer).toBe('INFP');
    expect(serialized).not.toContain('visibility');
    expect(serialized).not.toContain('versions');
    expect(serialized).not.toContain('questionId');
    expect(serialized).not.toContain('changedBecause');
    expect(serialized).not.toContain(recordId);
  });

  test('기록을 갱신하면 이전 답을 덮어쓰지 않고 시간 순서대로 보존한다', async () => {
    const api = new MockItsmeApi();
    const created = await api.saveAnswer({ questionId: 'learning-now', answer: '요리' });
    const recordId = created.records[0].id;
    const expectedVersionId = created.records[0].versions[0].id;

    const updated = await api.updateRecord({
      recordId,
      expectedVersionId,
      answer: '천천히 쉬는 법',
      changedBecause: '요즘은 회복이 먼저라는 걸 알게 됐어요.',
      nextStep: '저녁 한 시간은 화면을 끄기',
    });

    expect(updated.records[0].versions.map((version) => version.answer)).toEqual([
      '요리',
      '천천히 쉬는 법',
    ]);
    expect(updated.records[0].versions[1].changedBecause).toContain('회복');
  });

  test('공개 기록을 수정하면 새 문장을 다시 확인할 때까지 나만 보기로 돌아간다', async () => {
    const api = new MockItsmeApi();
    const created = await api.saveAnswer({ questionId: 'learning-now', answer: '요리' });
    const recordId = created.records[0].id;
    const preview = await api.previewPublicProfile({ recordId, visibility: 'public' });
    await api.setVisibility({ recordId, visibility: 'public', previewToken: preview.previewToken });

    const updated = await api.updateRecord({
      recordId,
      expectedVersionId: created.records[0].versions[0].id,
      answer: '천천히 쉬는 법',
    });
    const publicProfile = await api.getPublicProfile('my-scene');

    expect(updated.records[0].visibility).toBe('private');
    expect(publicProfile.records).toEqual([]);
  });

  test('저장 실패 후 기존 기록은 바뀌지 않아 화면 draft로 안전하게 재시도할 수 있다', async () => {
    const api = new MockItsmeApi();
    api.failNextMutation();

    await expect(
      api.saveAnswer({ questionId: 'favorite-color', answer: '깊은 잉크 블루' }),
    ).rejects.toMatchObject({ code: 'SAVE_FAILED' });

    expect((await api.getOwnerProfile()).records).toEqual([]);
  });

  test('오래된 expectedVersionId 수정은 거절하고 최신 기록을 덮어쓰지 않는다', async () => {
    const api = new MockItsmeApi();
    const created = await api.saveAnswer({ questionId: 'learning-now', answer: '요리' });
    const recordId = created.records[0].id;
    const staleVersionId = created.records[0].versions[0].id;

    await api.updateRecord({
      recordId,
      expectedVersionId: staleVersionId,
      answer: '천천히 쉬는 법',
    });

    await expect(
      api.updateRecord({ recordId, expectedVersionId: staleVersionId, answer: '덮어쓴 문장' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    expect((await api.getOwnerProfile()).records[0].versions).toHaveLength(2);
  });

  test('공개 후보는 상태를 바꾸지 않고 token을 최종 확정할 때만 공개한다', async () => {
    const api = new MockItsmeApi();
    const created = await api.saveAnswer({ questionId: 'favorite-color', answer: '이끼 초록' });
    const recordId = created.records[0].id;

    const preview = await api.previewPublicProfile({ recordId, visibility: 'public' });

    expect(preview.profile.records[0].answer).toBe('이끼 초록');
    expect((await api.getOwnerProfile()).records[0].visibility).toBe('private');
    expect((await api.getPublicProfile('my-scene')).records).toEqual([]);
    await expect(
      api.setVisibility({ recordId, visibility: 'public' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });

    await api.setVisibility({ recordId, visibility: 'public', previewToken: preview.previewToken });
    expect((await api.getPublicProfile('my-scene')).records[0].answer).toBe('이끼 초록');
  });

  test('알 수 없는 slug는 현재 owner 프로필로 대체하지 않는다', async () => {
    const api = new MockItsmeApi();
    await api.saveAnswer({ questionId: 'favorite-color', answer: '이끼 초록' });

    await expect(api.getPublicProfile('another-person')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  test('기록을 삭제하면 과거 버전과 공개 응답에서도 함께 제거된다', async () => {
    const api = new MockItsmeApi();
    const created = await api.saveAnswer({ questionId: 'mbti-now', answer: 'INFP' });
    const recordId = created.records[0].id;

    const preview = await api.previewPublicProfile({ recordId, visibility: 'public' });
    await api.setVisibility({ recordId, visibility: 'public', previewToken: preview.previewToken });
    await api.deleteRecord(recordId);
    const owner = await api.getOwnerProfile();
    const publicProfile = await api.getPublicProfile('my-scene');

    expect(owner.records).toEqual([]);
    expect(publicProfile.records).toEqual([]);
    expect(JSON.stringify(publicProfile)).not.toContain('INFP');
  });
});
