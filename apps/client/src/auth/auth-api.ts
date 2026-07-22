import { z } from 'zod';
import type { components } from '@/generated/itsme-api';

export type AuthUser = components['schemas']['AuthUser'];
export type AuthSession = components['schemas']['SessionResponse'];
export type LoginInput = components['schemas']['LoginRequest'];

export const AuthUserSchema: z.ZodType<AuthUser> = z.strictObject({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{2,47}$/),
});

export const AuthSessionSchema: z.ZodType<AuthSession> = z.strictObject({
  token: z.string().length(43),
  expiresAt: z.iso.datetime(),
  user: AuthUserSchema,
});
export interface AuthApi {
  login(input: LoginInput): Promise<AuthSession>;
  getCurrentUser(): Promise<AuthUser>;
  logout(): Promise<void>;
}
