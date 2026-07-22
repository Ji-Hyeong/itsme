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
  type SaveAnswerInput,
  type UpdateRecordInput,
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
  private recordSequence = 0;
  private profile: OwnerProfile = OwnerProfileSchema.parse({
    id: 'owner-me',
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
    if (slug !== 'me') {
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
      return this.updateRecord({ recordId: existing.id, answer, changedBecause: input.context });
    }

    const now = new Date().toISOString();
    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: [
        ...this.profile.records,
        {
          // URL에 질문 의미나 민감한 범주가 드러나지 않도록 기록 ID는 불투명하게 발급한다.
          id: `record-${++this.recordSequence}-${Date.now().toString(36)}`,
          questionId: question.id,
          category: question.category,
          title: question.title,
          // 저장과 공개를 분리하기 위해 생성 경로에서는 공개 값을 받을 수조차 없다.
          visibility: 'private',
          versions: [
            {
              id: `version-${question.id}-${Date.now()}`,
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
    if (!answer) {
      throw new ItsmeApiError('INVALID_INPUT', '지금의 답을 한 글자 이상 남겨 주세요.');
    }

    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: this.profile.records.map((record) =>
        record.id === input.recordId
          ? {
              ...record,
              // 과거 배열은 수정하지 않고 새 버전을 끝에 추가해 당시의 맥락과 순서를 보존한다.
              versions: [
                ...record.versions,
                {
                  id: `version-${record.id}-${Date.now()}`,
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

  async setVisibility(recordId: string, visibility: Visibility) {
    await waitForPrototypeLatency();
    this.assertMutationCanProceed();

    const target = this.profile.records.find((record) => record.id === recordId);
    if (!target) {
      throw new ItsmeApiError('NOT_FOUND', '공개 범위를 바꿀 기록을 찾지 못했어요.');
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
      throw new ItsmeApiError('NOT_FOUND', '삭제할 기록을 찾지 못했어요.');
    }

    // 기록 객체 전체를 제거해 과거 버전과 공개 projection에도 민감한 원문이 남지 않게 한다.
    this.profile = OwnerProfileSchema.parse({
      ...this.profile,
      records: this.profile.records.filter((record) => record.id !== recordId),
    });
    return OwnerProfileSchema.parse(this.profile);
  }

  private assertMutationCanProceed() {
    if (this.shouldFailNextMutation) {
      this.shouldFailNextMutation = false;
      throw new ItsmeApiError('SAVE_FAILED', '잠시 연결이 고르지 못했어요. 입력은 그대로 두었어요.');
    }
  }

  private projectPublicProfile(): PublicProfile {
    const publicRecords = this.profile.records
      .filter((record) => record.visibility === 'public')
      .map((record) => ({
        id: record.id,
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
