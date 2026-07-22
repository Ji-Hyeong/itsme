export const colors = {
  paper: '#F7F7F8',
  paperDeep: '#EFF0F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F6',
  ink: '#17191C',
  mutedInk: '#676B75',
  faintInk: '#707580',
  line: '#E7E8EC',
  brand: '#4457A6',
  brandDeep: '#354486',
  brandSoft: '#EFF0FF',
  sage: '#718477',
  sageSoft: '#F0F4EF',
  apricot: '#C87D5B',
  apricotSoft: '#FFF0E9',
  sky: '#668AA5',
  skySoft: '#EEF3F6',
  // 이전 화면이 사용하는 이름을 유지해 보조 화면도 같은 새 팔레트로 자연스럽게 이전한다.
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
  error: '#B43B38',
  errorSoft: '#FBE8E7',
  focus: '#275BC7',
} as const;

export const fonts = {
  display: 'NotoSansKR_700Bold',
  serif: 'NotoSansKR_400Regular',
  serifBold: 'NotoSansKR_700Bold',
  sans: 'NotoSansKR_400Regular',
  sansMedium: 'NotoSansKR_600SemiBold',
  sansBold: 'NotoSansKR_700Bold',
  sansBlack: 'NotoSansKR_700Bold',
  logoBold: 'NotoSansKR_900Black',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const layout = {
  mobileGutter: 20,
  desktopGutter: 20,
  maxContent: 480,
  railWidth: 0,
  minTouch: 44,
} as const;
