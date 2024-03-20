/**
 * for faster development, just pass css blocks to chakra-ui component
 */

import { SystemProps } from '@chakra-ui/react'
import { colors, sizes } from './cssVariables'

export const heroGridientColorCSSBlock: SystemProps = {
  background: colors.brandGradient,
  backgroundClip: 'text',
  color: 'transparent',
  fontSize: sizes.textHeroTitle,
  fontWeight: '700'
}

export const panelCard: SystemProps = {
  bg: colors.backgroundLight,
  border: colors.panelCardBorder,
  boxShadow: colors.panelCardShadow,
  borderRadius: ['12px', '20px'],
  overflow: 'hidden'
}
