import { checkboxAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import {} from '@chakra-ui/theme-tools'
import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(checkboxAnatomy.keys)

const baseStyle = definePartsStyle({
  icon: {
    color: colors.backgroundDark
  },
  control: {
    backgroundColor: colors.backgroundDark,
    borderRadius: '4px',
    _checked: {
      backgroundColor: colors.secondary,
      borderColor: 'transparent',
      '&:hover': {
        backgroundColor: colors.secondary,
        borderColor: 'transparent'
      }
    }
  }
})
const smSizeStyle = definePartsStyle({})

export const Checkbox = defineMultiStyleConfig({ baseStyle })
