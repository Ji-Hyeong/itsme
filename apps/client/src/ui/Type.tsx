import type { ComponentProps, ReactNode } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/ui/tokens';

type TextProps = ComponentProps<typeof Text> & { children: ReactNode };

const koreanBreakStyle = Platform.select({
  web: { wordBreak: 'keep-all', overflowWrap: 'anywhere' } as object,
  default: {},
});

export function Eyebrow({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.eyebrow, koreanBreakStyle, style]} />;
}

export function Display({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.display, koreanBreakStyle, style]} />;
}

export function Heading({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.heading, koreanBreakStyle, style]} />;
}

export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.body, koreanBreakStyle, style]} />;
}

export function Meta({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.meta, koreanBreakStyle, style]} />;
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.mutedInk,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  display: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -1.5,
    lineHeight: 45,
  },
  heading: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 23,
    letterSpacing: -0.8,
    lineHeight: 33,
  },
  body: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 16,
    letterSpacing: -0.2,
    lineHeight: 27,
  },
  meta: {
    color: colors.mutedInk,
    fontFamily: fonts.sans,
    fontSize: 13,
    letterSpacing: -0.1,
    lineHeight: 21,
  },
});
