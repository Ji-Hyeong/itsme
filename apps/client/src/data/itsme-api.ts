import type { OwnerProfile, PublicProfile, Question } from '@/domain/profile';
import type { components } from '@/generated/itsme-api';

export type SaveAnswerInput = components['schemas']['CreateRecordRequest'];

export type UpdateRecordInput = components['schemas']['UpdateRecordRequest'] & {
  recordId: string;
};

export type PublicProfilePreviewInput = components['schemas']['PublicProfilePreviewRequest'];
export type PublicProfilePreviewResponse = components['schemas']['PublicProfilePreviewResponse'];

export type UpdateVisibilityInput = components['schemas']['UpdateVisibilityRequest'] & {
  recordId: string;
};

export class ItsmeApiError extends Error {
  constructor(
    readonly code:
      | 'NOT_FOUND'
      | 'INVALID_INPUT'
      | 'CONFLICT'
      | 'SAVE_FAILED'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NETWORK'
      | 'SERVER_ERROR'
      | 'INVALID_RESPONSE',
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
  previewPublicProfile(input: PublicProfilePreviewInput): Promise<PublicProfilePreviewResponse>;
  setVisibility(input: UpdateVisibilityInput): Promise<OwnerProfile>;
  deleteRecord(recordId: string): Promise<void>;
}
