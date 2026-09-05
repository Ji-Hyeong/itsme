import type { ComponentProps, ReactNode } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { colors, typeScale } from '@/ui/tokens';

type TextProps = ComponentProps<typeof Text> & { children: ReactNode };

const koreanBreakStyle = Platform.select({
  web: { wordBreak: 'keep-all', overflowWrap: 'anywhere' } as object,
  default: {},
});

function TypedText({ style, ...props }: TextProps & { variant: keyof typeof styles }) {
  const { variant, ...textProps } = props;
  return <Text {...textProps} style={[styles[variant], koreanBreakStyle, style]} />;
}

export function ProfileName(props: TextProps) {
  return <TypedText {...props} variant="profileName" />;
}

export function Question(props: TextProps) {
  return <TypedText {...props} variant="question" />;
}

export function ScreenTitle(props: TextProps) {
  return <TypedText {...props} variant="screenTitle" />;
}

export function SceneAnswer(props: TextProps) {
  return <TypedText {...props} variant="sceneAnswer" />;
}

export function SectionTitle(props: TextProps) {
  return <TypedText {...props} variant="sectionTitle" />;
}

export function Control(props: TextProps) {
  return <TypedText {...props} variant="control" />;
}

export function Body(props: TextProps) {
  return <TypedText {...props} variant="body" />;
}

export function Meta(props: TextProps) {
  return <TypedText {...props} variant="meta" />;
}

// 점진적 화면 이전을 위해 기존 이름은 새 의미 토큰의 별칭으로만 유지한다.
export const Eyebrow = Meta;
export const Display = ScreenTitle;
export const Heading = SectionTitle;

const styles = StyleSheet.create({
  profileName: { color: colors.ink, ...typeScale.profileName },
  question: { color: colors.ink, ...typeScale.question },
  screenTitle: { color: colors.ink, ...typeScale.screenTitle },
  sceneAnswer: { color: colors.ink, ...typeScale.sceneAnswer },
  sectionTitle: { color: colors.ink, ...typeScale.sectionTitle },
  body: { color: colors.ink, ...typeScale.body },
  control: { color: colors.ink, ...typeScale.control },
  meta: { color: colors.muted, ...typeScale.meta },
});
