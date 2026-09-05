import type { Category } from '@/domain/profile';
import { colors } from '@/ui/tokens';

export const categoryStyle: Record<Category, { accent: string; soft: string; symbol: string; folioIndex: string }> = {
  preference: { accent: colors.apricot, soft: colors.apricotSoft, symbol: '취향', folioIndex: '01' },
  personality: { accent: colors.indigo, soft: colors.indigoSoft, symbol: '성격', folioIndex: '02' },
  value: { accent: colors.sage, soft: colors.sageSoft, symbol: '가치', folioIndex: '03' },
  strength: { accent: colors.apricot, soft: colors.apricotSoft, symbol: '강점', folioIndex: '04' },
  learning: { accent: colors.indigo, soft: colors.indigoSoft, symbol: '배움', folioIndex: '05' },
  support: { accent: colors.sage, soft: colors.sageSoft, symbol: '도움', folioIndex: '06' },
};
