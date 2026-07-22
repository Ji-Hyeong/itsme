import { z } from 'zod';

export const CategorySchema = z.enum([
  'preference',
  'personality',
  'value',
  'strength',
  'learning',
  'support',
]);
export type Category = z.infer<typeof CategorySchema>;

export const VisibilitySchema = z.enum(['private', 'public']);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const RecordVersionSchema = z.strictObject({
  id: z.string().min(1),
  answer: z.string().trim().min(1).max(600),
  context: z.string().trim().max(1200).optional(),
  changedBecause: z.string().trim().max(1200).optional(),
  nextStep: z.string().trim().max(600).optional(),
  recordedAt: z.iso.datetime(),
});
export type RecordVersion = z.infer<typeof RecordVersionSchema>;

export const OwnerRecordSchema = z.strictObject({
  id: z.string().min(1),
  questionId: z.string().min(1),
  category: CategorySchema,
  title: z.string().min(1),
  visibility: VisibilitySchema,
  versions: z.array(RecordVersionSchema).min(1),
});
export type OwnerRecord = z.infer<typeof OwnerRecordSchema>;

export const OwnerProfileSchema = z.strictObject({
  id: z.string().min(1),
  displayName: z.string().min(1),
  intro: z.string().max(180).optional(),
  records: z.array(OwnerRecordSchema),
});
export type OwnerProfile = z.infer<typeof OwnerProfileSchema>;

/**
 * 공개 모델은 OwnerRecord를 부분 선택하지 않고 별도 스키마로 정의한다.
 * 이 경계 덕분에 비공개 맥락, 변경 이유와 과거 버전이 실수로 직렬화될 수 없다.
 */
export const PublicRecordSchema = z.strictObject({
  category: CategorySchema,
  title: z.string().min(1),
  answer: z.string().min(1),
});
export type PublicRecord = z.infer<typeof PublicRecordSchema>;

export const PublicProfileSchema = z.strictObject({
  displayName: z.string().min(1),
  intro: z.string().max(180).optional(),
  records: z.array(PublicRecordSchema),
});
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

export const PublicProfilePreviewResponseSchema = z.strictObject({
  previewToken: z.string().min(43).max(128),
  expiresAt: z.iso.datetime(),
  profile: PublicProfileSchema,
});

export const QuestionOptionSchema = z.strictObject({
  label: z.string().min(1),
  value: z.string().min(1),
  swatch: z.string().optional(),
});

export const QuestionSchema = z.strictObject({
  id: z.string().min(1),
  category: CategorySchema,
  chapter: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  kind: z.enum(['choice', 'text']),
  options: z.array(QuestionOptionSchema).optional(),
  guidance: z.string().optional(),
  placeholder: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export function getCurrentVersion(record: OwnerRecord): RecordVersion {
  const current = record.versions.at(-1);
  if (!current) {
    throw new Error(`기록 ${record.id}에 현재 버전이 없습니다.`);
  }
  return current;
}

export const categoryMeta: Record<Category, { label: string; chapter: string }> = {
  preference: { label: '취향', chapter: '내가 좋아하는 세계' },
  personality: { label: '성격', chapter: '요즘의 나를 설명하는 말' },
  value: { label: '가치', chapter: '나를 움직이는 생각' },
  strength: { label: '강점', chapter: '내가 자연스럽게 해내는 것' },
  learning: { label: '배움', chapter: '요즘 배우는 중' },
  support: { label: '도움', chapter: '함께하면 좋은 것' },
};
