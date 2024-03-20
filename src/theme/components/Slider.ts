import { sliderAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(sliderAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    pb: 4
  },
  filledTrack: {
    bg: colors.secondary
  },
  track: {
    bg: colors.backgroundDark
  },
  thumb: {
    bg: colors.secondary,
    boxSize: '24px',
    _active: {
      transform: 'translateY(-50%)'
    }
  },
  mark: {
    color: colors.textSecondary,
    mt: '16px',
    fontSize: '12px',
    fontWeight: '500',
    transform: 'translateX(var(--tx, 0))',
    bg: colors.backgroundTransparent12,
    borderRadius: '4px',
    py: '2px',
    px: '4px'
  }
})

export const Slider = defineMultiStyleConfig({ baseStyle })
