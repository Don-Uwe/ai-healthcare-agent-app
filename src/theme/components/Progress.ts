import { progressAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(progressAnatomy.keys)

const baseStyle = definePartsStyle({
  track: {
    bg: colors.backgroundDark,
    borderRadius: '100vw'
  },
  filledTrack: {
    bg: colors.filledProgressBg
  }
})

export const Progress = defineMultiStyleConfig({ baseStyle })
