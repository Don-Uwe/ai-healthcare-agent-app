import { checkboxAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(checkboxAnatomy.keys)

const baseStyle = definePartsStyle({
  icon: {
    color: colors.backgroundDark
  },
  control: {
    backgroundColor: colors.buttonBg01,
    borderWidth: '0',
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
export const Checkbox = defineMultiStyleConfig({ baseStyle })
