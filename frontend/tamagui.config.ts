import { createTamagui, createTokens } from 'tamagui';
import { createAnimations } from '@tamagui/animations-css';
import { themes } from '@tamagui/themes';

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
  },
  fast: 'quick',
  slow: 'lazy',
});

const tokens = createTokens({
  color: {
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F5F5F5',
    gray200: '#E0E0E0',
    gray500: '#9E9E9E',
    gray800: '#424242',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    error: '#EF4444',
    success: '#10B981',
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
    true: 16,
  },
  size: {
    ...[0, 4, 8, 12, 16, 20, 24, 32, 40, 48].reduce((acc, val, i) => {
      acc[i] = val;
      return acc;
    }, {} as Record<string, number>),
    true: 16,
    full: '100%',
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    round: 9999,
  },
  zIndex: {
    0: 0,
    1: 1,
    10: 10,
    20: 20,
    100: 100,
  },
});

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
};

const config = createTamagui({
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
      family: 'System',
      size: {
        1: 16,
        2: 20,
        3: 24,
        4: 28,
        5: 32,
      },
      lineHeight: {
        1: 20,
        2: 24,
        3: 28,
        4: 32,
        5: 36,
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
        1: 14,
        2: 16,
        3: 18,
      },
      lineHeight: {
        1: 20,
        2: 24,
        3: 28,
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
});

export type AppConfig = typeof config
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
