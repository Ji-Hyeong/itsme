import type { OwnerProfile, PublicProfile, Question, Visibility } from '@/domain/profile';

export type SaveAnswerInput = {
  questionId: string;
  answer: string;
  context?: string;
};

export type UpdateRecordInput = {
  recordId: string;
  answer: string;
  changedBecause?: string;
  nextStep?: string;
};

export class ItsmeApiError extends Error {
  constructor(
    readonly code: 'NOT_FOUND' | 'INVALID_INPUT' | 'SAVE_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'ItsmeApiError';
  }
}

export interface ItsmeApi {
  getQuestions(): Promise<readonly Question[]>;
  getOwnerProfile(): Promise<OwnerProfile>;
  getPublicProfile(slug: string): Promise<PublicProfile>;
  saveAnswer(input: SaveAnswerInput): Promise<OwnerProfile>;
  updateRecord(input: UpdateRecordInput): Promise<OwnerProfile>;
  setVisibility(recordId: string, visibility: Visibility): Promise<OwnerProfile>;
  deleteRecord(recordId: string): Promise<OwnerProfile>;
}
