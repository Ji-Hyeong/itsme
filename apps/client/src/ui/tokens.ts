export const colors = {
  canvas: '#F6F3EC',
  surface: '#FFFDF8',
  surfaceRaised: '#FFFFFF',
  surfaceMuted: '#ECE8DF',
  ink: '#25231F',
  muted: '#68645C',
  lineSubtle: '#E6E0D5',
  lineStrong: '#918B81',
  indigo: '#4457A6',
  indigoDeep: '#33427F',
  indigoSoft: '#ECEEF8',
  sage: '#718477',
  sageSoft: '#EDF2EE',
  apricot: '#C87D5B',
  apricotSoft: '#FAEFEA',
  error: '#A6322A',
  errorSoft: '#F8E9E5',
  scrim: 'rgba(37,35,31,0.58)',
  focus: '#1F4AB8',

  // 기존 화면을 primitive 단위로 옮기는 동안 색이 서로 갈라지지 않도록 의미가 같은 별칭만 유지한다.
  paper: '#F6F3EC',
  paperDeep: '#ECE8DF',
  mutedInk: '#68645C',
  faintInk: '#68645C',
  line: '#918B81',
  brand: '#4457A6',
  brandDeep: '#344383',
  brandSoft: '#EEF0FA',
  sky: '#668AA5',
  skySoft: '#EEF3F6',
  acid: '#ECEEFC',
  cobalt: '#4457A6',
  vermilion: '#C87D5B',
  coral: '#C87D5B',
  coralSoft: '#FAE9E1',
  leaf: '#667A62',
  leafSoft: '#E9F0E7',
  blue: '#668AA5',
  blueSoft: '#E7F0F5',
  ochre: '#8B6A42',
  ochreSoft: '#F5EDDF',
  white: '#FFFFFF',
} as const;

export const fonts = {
  display: 'Pretendard_700Bold',
  serif: 'MaruBuri_400Regular',
  serifBold: 'MaruBuri_600SemiBold',
  sans: 'Pretendard_400Regular',
  sansMedium: 'Pretendard_600SemiBold',
  sansBold: 'Pretendard_700Bold',
  sansBlack: 'Pretendard_700Bold',
  logoBold: 'Pretendard_700Bold',
} as const;

export const typeScale = {
  navTitle: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 26, letterSpacing: -0.27 },
  folioName: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 44, letterSpacing: -0.51 },
  folioLead: { fontFamily: fonts.serifBold, fontSize: 30, lineHeight: 43, letterSpacing: -0.45 },
  folioAnswer: { fontFamily: fonts.serifBold, fontSize: 24, lineHeight: 36, letterSpacing: 0 },
  section: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 27, letterSpacing: -0.27 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 26, letterSpacing: 0 },
  control: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20, letterSpacing: 0 },
  micro: { fontFamily: fonts.sansMedium, fontSize: 11, lineHeight: 16, letterSpacing: 0 },
  // 이전 화면이 공용 primitive로 이동하는 동안 의미가 같은 이름만 남긴다.
  profileName: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 44, letterSpacing: -0.51 },
  question: { fontFamily: fonts.serifBold, fontSize: 30, lineHeight: 43, letterSpacing: -0.45 },
  screenTitle: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 26, letterSpacing: -0.27 },
  sceneAnswer: { fontFamily: fonts.serifBold, fontSize: 24, lineHeight: 36, letterSpacing: 0 },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 27, letterSpacing: -0.27 },
  meta: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20, letterSpacing: 0 },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  smMd: 12,
  md: 16,
  mdLg: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const radii = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const layout = {
  mobileGutter: 20,
  largeMobileGutter: 24,
  desktopGutter: 24,
  maxContent: 560,
  railWidth: 0,
  minTouch: 44,
  controlHeight: 54,
  visibilityHeight: 52,
  optionMinHeight: 64,
  profileCoverMinHeight: 152,
  profileCoverWithLeadMinHeight: 176,
  bottomTabHeight: 64,
  largeTextScale: 1.5,
  dialogMaxWidth: 382,
} as const;

export function screenGutter(width: number) {
  return width >= 420 ? layout.largeMobileGutter : layout.mobileGutter;
}
