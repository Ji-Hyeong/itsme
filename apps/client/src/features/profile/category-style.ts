import type { Category } from '@/domain/profile';
import { colors } from '@/ui/tokens';

export const categoryStyle: Record<Category, { accent: string; soft: string; symbol: string }> = {
  preference: { accent: colors.apricot, soft: colors.white, symbol: '취향' },
  personality: { accent: colors.brand, soft: colors.white, symbol: '성격' },
  value: { accent: colors.sage, soft: colors.white, symbol: '가치' },
  strength: { accent: colors.sky, soft: colors.white, symbol: '강점' },
  learning: { accent: colors.brand, soft: colors.white, symbol: '배움' },
  support: { accent: colors.sage, soft: colors.white, symbol: '도움' },
};
