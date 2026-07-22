import { z } from 'zod';

import {
  OwnerProfileSchema,
  PublicProfilePreviewResponseSchema,
  PublicProfileSchema,
  QuestionSchema,
} from '@/domain/profile';
import { HttpTransport } from '@/data/http-transport';
import { ItsmeApiError } from '@/data/itsme-api';
import type {
  ItsmeApi,
  PublicProfilePreviewInput,
  SaveAnswerInput,
  UpdateRecordInput,
  UpdateVisibilityInput,
} from '@/data/itsme-api';

export class HttpItsmeApi implements ItsmeApi {
  constructor(private readonly http: HttpTransport) {}

  async getQuestions() {
    const response = await this.http.request('/v1/questions');
    return QuestionSchema.array().parse(
      // OpenAPI의 collection envelope는 확장 가능한 metadata와 실제 항목을 분리한다.
      QuestionCollectionSchema.parse(response).items,
    );
  }

  async getOwnerProfile() {
    return OwnerProfileSchema.parse(await this.http.request('/v1/me/profile', { authenticated: true }));
  }

  async getPublicProfile(slug: string) {
    // 공개 endpoint에는 토큰을 읽거나 Authorization 헤더를 붙이지 않아 익명 조회 경계를 보존한다.
    return PublicProfileSchema.parse(
      await this.http.request(`/v1/public/profiles/${encodeURIComponent(slug)}`),
    );
  }

  async saveAnswer(input: SaveAnswerInput) {
    return OwnerProfileSchema.parse(
      await this.http.request('/v1/me/records', { authenticated: true, method: 'POST', body: input }),
    );
  }

  async updateRecord(input: UpdateRecordInput) {
    const { recordId, ...body } = input;
    return OwnerProfileSchema.parse(await this.http.request(`/v1/me/records/${encodeURIComponent(recordId)}`, {
      authenticated: true,
      method: 'PATCH',
      body,
    }));
  }

  async previewPublicProfile(input: PublicProfilePreviewInput) {
    return PublicProfilePreviewResponseSchema.parse(
      await this.http.request('/v1/me/public-profile-preview', {
        authenticated: true,
        method: 'POST',
        body: input,
      }),
    );
  }

  async setVisibility(input: UpdateVisibilityInput) {
    const { recordId, ...body } = input;
    return OwnerProfileSchema.parse(await this.http.request(`/v1/me/records/${encodeURIComponent(recordId)}/visibility`, {
      authenticated: true,
      method: 'PATCH',
      body,
    }));
  }

  async deleteRecord(recordId: string) {
    try {
      await this.http.request(`/v1/me/records/${encodeURIComponent(recordId)}`, {
        authenticated: true,
        method: 'DELETE',
      });
    } catch (cause) {
      // 직전 204 뒤 reconcile이 끊긴 재시도라도 목표 상태는 이미 충족됐으므로 404는 멱등 성공이다.
      if (cause instanceof ItsmeApiError && cause.code === 'NOT_FOUND') return;
      throw cause;
    }
  }
}

const QuestionCollectionSchema = z.strictObject({ items: QuestionSchema.array() });
