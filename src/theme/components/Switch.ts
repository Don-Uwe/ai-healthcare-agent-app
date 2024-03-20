import { switchAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(switchAnatomy.keys)

const baseStyle = definePartsStyle({
  thumb: {
    bg: colors.switchOff,
    opacity: 0.5,
    _checked: {
      bg: colors.switchOn,
      opacity: 1
    }
  },
  track: {
    bg: colors.backgroundTransparent12
  }
})
const sm = definePartsStyle({
  container: { '--switch-track-width': '1.5em' },
  track: { width: '1.5em' }
})
const md = definePartsStyle({
  container: { '--switch-track-width': '2.25em' },
  track: { width: '2.25em' }
})
const lg = definePartsStyle({
  container: { '--switch-track-width': '3.5em' },
  track: { width: '3.5em' }
})

export const Switch = defineMultiStyleConfig({ baseStyle, sizes: { sm, md, lg } })
