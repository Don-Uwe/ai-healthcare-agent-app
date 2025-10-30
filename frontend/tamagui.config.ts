import { createTamagui, createTokens, TamaguiConfig } from 'tamagui';
import { themes } from '@tamagui/themes';
import { createAnimations } from '@tamagui/animations-react-native'


const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
  },
  fast: {
    type: 'timing',
    duration: 150,
  },
  slow: {
    type: 'timing',
    duration: 600,
  },
});


const tokens = createTokens({
  color: {
    white: '#FFFFFF',
    black: '#000000',
    color2: '#F0F0F0',
    color6: '#D1D5DB',
    color10: '#4B5563',
    color12: '#111827',
    gray100: '#F5F5F5',
    gray200: '#E0E0E0',
    gray300: '#D6D6D6',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    error: '#EF4444',
    success: '#10B981',
    red1: '#FEE2E2',
    red8: '#DC2626',
    red10: '#991B1B',
    blue10: '#007AFF',
    gray3: '#F5F5F5',
    borderColor: '#99CCFF',
    background: '#FFFFFF',
 
  },

  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 56,
    11: 64,
    12: 72,
    13: 80,
    true: 16, // Optional but unconventional
  },

  size: {
    0: 0,
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 40,
    6: 48,
    7: 56,
    8: 64,
    9: 72,
    10: 80,
    11: 88,
    12: 96,
    true: 16, // Same here
    full: '100%',
  },

  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    round: 9999,
  },

  zIndex: {
    0: 0,
    1: 1,
    10: 10,
    20: 20,
    100: 100,
  },
})

const shorthands = {
  p: 'padding',
  px: 'paddingHorizontal',
  py: 'paddingVertical',
  m: 'margin',
  mx: 'marginHorizontal',
  my: 'marginVertical',
  bg: 'backgroundColor',
  fs: 'fontSize',
  jc: 'justifyContent',
  ai: 'alignItems',
  fd: 'flexDirection',
  w: 'width',
  h: 'height',
  br: 'borderRadius',
}

const config:TamaguiConfig = createTamagui({
  defaultTheme: 'light',
  animations,
  shorthands,
  tokens,
  themes: {
    ...themes,
    light: {
      background: tokens.color.white,
      color: tokens.color.gray800,
      primary: tokens.color.primary,
    },
    dark: {
      background: tokens.color.gray800,
      color: tokens.color.white,
      primary: tokens.color.primary,
    },
  },
  fonts: {
    heading: {
      family: 'Inter',
      size: {
        1: 24,
        2: 28,
        3: 32,
        4: 40,
        5: 48,
      },
      lineHeight: {
        1: 28,
        2: 32,
        3: 36,
        4: 44,
        5: 52,
      },
      weight: {
        4: '400',
        6: '600',
        7: '700',
      },
      letterSpacing: {
        1: 0,
      },
    },
    body: {
      family: 'System',
      size: {
        1: 16,
        2: 18,
        3: 20,
      },
      lineHeight: {
        1: 22,
        2: 26,
        3: 30,
      },
      weight: {
        4: '400',
        6: '600',
      },
      letterSpacing: {
        1: 0,
      },
    },
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
  },
})


export default config;
