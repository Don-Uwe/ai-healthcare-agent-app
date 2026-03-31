import { StyleSheet, Platform } from 'react-native';


export const GlassStyles = StyleSheet.create({
  // Glass Container Variants
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
    }),
  },

  glassContainerLightMode: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      },
    }),
  },

  glassContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 7,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.1)',
      },
    }),
  },

  glassContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
      web: {
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.3)',
      },
    }),
  },

  // Glass Card Variants
glassCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.08)', // softer, not milky
  borderRadius: 18,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
  padding: 16,
  overflow: 'hidden',

  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    web: {
      backdropFilter: 'blur(20px)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    },
  }),
},

  glassCardLight: {
   // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    //borderColor: 'rgba(0, 0, 0, 0.06)',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 6px 28px 0 rgba(0, 0, 0, 0.08)',
      },
    }),
  },

  glassCardElevated: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      },
    }),
  },

  glassCardElevatedLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
      },
    }),
  },

  // Glass Button Variants
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px 0 rgba(31, 38, 135, 0.15)',
      },
    }),
  },

  glassButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    }),
  },

  glassButtonPrimary: {
    backgroundColor: 'rgba(0, 191, 255, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.4)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px 0 rgba(0, 191, 255, 0.25)',
      },
    }),
  },

  // Glass Input Variants
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },

  glassInputLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },

  glassInputFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 191, 255, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 16px 0 rgba(0, 191, 255, 0.2)',
      },
    }),
  },

  glassInputFocusedLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 191, 255, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 16px 0 rgba(0, 191, 255, 0.15)',
      },
    }),
  },

  // Glass Header/Navigation
  glassHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        backdropFilter: 'blur(15px)',
        boxShadow: '0 2px 16px 0 rgba(31, 38, 135, 0.1)',
      },
    }),
  },

  // Glass Modal/Sheet
  glassModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
      web: {
        backdropFilter: 'blur(30px)',
        boxShadow: '0 -4px 40px 0 rgba(31, 38, 135, 0.2)',
      },
    }),
  },

  // Glass Badge/Chip
  glassBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      },
    }),
  },

  // Gradient Overlay (for backgrounds)
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },

  // Frosted Glass Effect
  frostedGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      web: {
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.2)',
      },
    }),
  },
});

/**
 * Color system for professional design
 */
export const ProfessionalColors = {
  // Primary palette
  primary: '#00BFFF',
  primaryLight: '#6FD6FF',
  primaryDark: '#0095CC',
  primaryGlass: 'rgba(0, 191, 255, 0.15)',

  // Secondary palette
  secondary: '#0F52BA',
  secondaryLight: '#5B8CE6',
  secondaryDark: '#0A3A8A',
  secondaryGlass: 'rgba(15, 82, 186, 0.15)',

  // Accent colors
  accent: '#F0F8FF',
  accentDark: '#E0F0FF',

  // Neutral palette
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic colors
  success: '#10B981',
  successLight: '#6EE7B7',
  successGlass: 'rgba(16, 185, 129, 0.15)',

  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorGlass: 'rgba(239, 68, 68, 0.15)',

  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningGlass: 'rgba(245, 158, 11, 0.15)',

  info: '#3B82F6',
  infoLight: '#93C5FD',
  infoGlass: 'rgba(59, 130, 246, 0.15)',

  // Glass backgrounds
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  glassWhiteMedium: 'rgba(255, 255, 255, 0.15)',
  glassWhiteStrong: 'rgba(255, 255, 255, 0.25)',

  glassBlack: 'rgba(0, 0, 0, 0.1)',
  glassBlackMedium: 'rgba(0, 0, 0, 0.15)',
  glassBlackStrong: 'rgba(0, 0, 0, 0.25)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Spacing system for consistent layouts
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

/**
 * Border radius system
 */
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

/**
 * Typography system
 */
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export default GlassStyles;
