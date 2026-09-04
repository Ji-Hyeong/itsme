import {
  getCurrentVersion,
  OwnerProfileSchema,
  PublicProfileSchema,
  QuestionSchema,
  type OwnerProfile,
  type PublicProfile,
  type Visibility,
} from '@/domain/profile';
import { questions } from '@/domain/questions';
import {
  ItsmeApiError,
  type ItsmeApi,
  type PublicProfilePreviewInput,
  type SaveAnswerInput,
  type UpdateRecordInput,
  type UpdateVisibilityInput,
} from '@/data/itsme-api';

const NETWORK_DELAY_MS = 260;

function waitForPrototypeLatency() {
  return new Promise<void>((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
}

function optionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export class MockItsmeApi implements ItsmeApi {
  private idSequence = 0;
  private previewSequence = 0;
  private readonly previewTokens = new Map<
    string,
    { expectedVersionId: string; recordId: string; visibility: Visibility }
  >();
  private profile: OwnerProfile = OwnerProfileSchema.parse({
    id: '6b133f38-4966-4c0f-91da-878830506a66',
    displayName: '지금의 나',
    intro: '아직 한 문장으로 정하지 않아도 괜찮아요.',
    records: [],
  });

  private shouldFailNextMutation = false;

  /** 자동 테스트가 입력 보존·재시도 경로를 재현할 때만 사용한다. */
  failNextMutation() {
    this.shouldFailNextMutation = true;
  }

  async getQuestions() {
    await waitForPrototypeLatency();
    return QuestionSchema.array().parse(questions);
  }

  async getOwnerProfile() {
    await waitForPrototypeLatency();
    return OwnerProfileSchema.parse(this.profile);
  }

  async getPublicProfile(slug: string) {
    await waitForPrototypeLatency();
    if (slug !== 'my-scene') {
      throw new ItsmeApiError('NOT_FOUND', '공개 프로필을 찾지 못했어요.');
    }
    return this.projectPublicProfile();
  }

  async saveAnswer(input: SaveAnswerInput) {
    await waitForPrototypeLatency();
    this.assertMutationCanProceed();

    const question = questions.find((candidate) => candidate.id === input.questionId);
    const answer = input.answer.trim();
    if (!question || !answer) {
      throw new ItsmeApiError('INVALID_INPUT', '남길 답변을 확인해 주세요.');
    }

    const existing = this.profile.records.find((record) => record.questionId === input.questionId);
    if (existing) {
      return this.updateRecord({
        recordId: existing.id,
        expectedVersionId: getCurrentVersion(existing).id,
        answer,
        changedBecause: input.context,
      });
    }

    const now = new Date().toISOString();
    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: [
        ...this.profile.records,
        {
          // URL에 질문 의미나 민감한 범주가 드러나지 않도록 기록 ID는 불투명하게 발급한다.
          id: this.createUuid(),
          questionId: question.id,
          category: question.category,
          title: question.title,
          // 저장과 공개를 분리하기 위해 생성 경로에서는 공개 값을 받을 수조차 없다.
          visibility: 'private',
          versions: [
            {
              id: this.createUuid(),
              answer,
              context: optionalText(input.context),
              recordedAt: now,
            },
          ],
        },
      ],
    });
    return OwnerProfileSchema.parse(this.profile);
  }

  async updateRecord(input: UpdateRecordInput) {
    await waitForPrototypeLatency();
    this.assertMutationCanProceed();

    const answer = input.answer.trim();
    const target = this.profile.records.find((record) => record.id === input.recordId);
    if (!target) {
      throw new ItsmeApiError('NOT_FOUND', '변경할 기록을 찾지 못했어요.');
    }
    if (getCurrentVersion(target).id !== input.expectedVersionId) {
      throw new ItsmeApiError(
        'CONFLICT',
        '다른 곳에서 이 기록이 먼저 바뀌었어요. 최신 내용을 확인한 뒤 다시 남겨 주세요.',
      );
    }
    if (!answer) {
      throw new ItsmeApiError('INVALID_INPUT', '지금의 답을 한 글자 이상 남겨 주세요.');
    }

    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: this.profile.records.map((record) =>
        record.id === input.recordId
          ? {
              ...record,
              // 공개 중인 문장을 고치면 새 원문을 사용자가 다시 확인하기 전까지 공개하지 않는다.
              visibility: 'private',
              // 과거 배열은 수정하지 않고 새 버전을 끝에 추가해 당시의 맥락과 순서를 보존한다.
              versions: [
                ...record.versions,
                {
                  id: this.createUuid(),
                  answer,
                  changedBecause: optionalText(input.changedBecause),
                  nextStep: optionalText(input.nextStep),
                  recordedAt: new Date().toISOString(),
                },
              ],
            }
          : record,
      ),
    });
    return OwnerProfileSchema.parse(this.profile);
  }

  async previewPublicProfile(input: PublicProfilePreviewInput) {
    await waitForPrototypeLatency();

    const target = this.profile.records.find((record) => record.id === input.recordId);
    if (!target) {
      throw new ItsmeApiError('NOT_FOUND', '미리 볼 기록을 찾지 못했어요.');
    }

    const previewToken = `mock-preview-${++this.previewSequence}`.padEnd(43, 'x');
    this.previewTokens.set(previewToken, {
      expectedVersionId: getCurrentVersion(target).id,
      recordId: target.id,
      visibility: input.visibility,
    });

    // 실제 저장 상태는 건드리지 않고, 서버가 공개를 가정해 만든 projection과 일회성 증표만 반환한다.
    return {
      previewToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      profile: this.projectPublicProfile(input),
    };
  }

  async setVisibility(input: UpdateVisibilityInput) {
    await waitForPrototypeLatency();
    this.assertMutationCanProceed();

    const { recordId, visibility } = input;
    const target = this.profile.records.find((record) => record.id === recordId);
    if (!target) {
      throw new ItsmeApiError('NOT_FOUND', '공개 범위를 바꿀 기록을 찾지 못했어요.');
    }
    if (visibility === 'public') {
      const previewToken = input.previewToken;
      const preview = previewToken ? this.previewTokens.get(previewToken) : undefined;
      if (
        !previewToken
        || !preview
        || preview.recordId !== recordId
        || preview.visibility !== 'public'
        || preview.expectedVersionId !== getCurrentVersion(target).id
      ) {
        throw new ItsmeApiError('CONFLICT', '공개 모습이 오래되었어요. 다시 미리 본 뒤 공개해 주세요.');
      }
      this.previewTokens.delete(previewToken);
    }

    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: this.profile.records.map((record) =>
        record.id === recordId ? { ...record, visibility } : record,
      ),
    });
    return OwnerProfileSchema.parse(this.profile);
  }

  async deleteRecord(recordId: string) {
    await waitForPrototypeLatency();
    this.assertMutationCanProceed();

    const target = this.profile.records.find((record) => record.id === recordId);
    if (!target) {
      return;
    }

    // 기록 객체 전체를 제거해 과거 버전과 공개 projection에도 민감한 원문이 남지 않게 한다.
    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: this.profile.records.filter((record) => record.id !== recordId),
    });
  }

  private createUuid() {
    // mock에서도 format: uuid 계약을 지켜 실제 HTTP 응답과 같은 식별자 형태를 사용한다.
    const suffix = (++this.idSequence).toString(16).padStart(12, '0');
    return `00000000-0000-4000-8000-${suffix}`;
  }

  private assertMutationCanProceed() {
    if (this.shouldFailNextMutation) {
      this.shouldFailNextMutation = false;
      throw new ItsmeApiError('SAVE_FAILED', '잠시 연결이 고르지 못했어요. 입력은 그대로 두었어요.');
    }
  }

  private projectPublicProfile(override?: PublicProfilePreviewInput): PublicProfile {
    const publicRecords = this.profile.records
      .filter((record) =>
        record.id === override?.recordId ? override.visibility === 'public' : record.visibility === 'public',
      )
      .map((record) => ({
        category: record.category,
        title: record.title,
        answer: getCurrentVersion(record).answer,
      }));

    // 공개 응답은 허용된 필드만 새 객체로 조립한다. owner 객체를 펼치거나 null로 마스킹하지 않는다.
    return PublicProfileSchema.parse({
      displayName: this.profile.displayName,
      intro: this.profile.intro,
      records: publicRecords,
    });
  }
}
