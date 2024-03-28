import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys)

const filledStyle = definePartsStyle({
  field: {
    width: '210px',
    fontSize: '14px',
    bg: colors.backgroundTransparent12,
    borderRadius: '12px',
    border: '1px solid transparent',
    _hover: {
      bg: colors.backgroundTransparent07
    },
    _focus: {
      bg: colors.backgroundTransparent12,
      borderColor: colors.selectActive
    },
    _focusVisible: {
      bg: colors.backgroundTransparent12,
      borderColor: colors.selectActive
    },
    _placeholder: {
      color: colors.textTertiary,
      fontWeight: 500
    },
    _invalid: {
      border: '1px solid red'
    }
  }
})
const capsuleRadioStyle = definePartsStyle({
  field: {
    fontSize: '14px',
    bg: colors.backgroundDark,
    borderRadius: '999px',
    borderWidth: '0',
    _focus: {},
    _placeholder: {
      color: colors.textTertiary,
      fontWeight: 500
    },
    _invalid: {
      border: '1px solid red'
    }
  }
})

const cleanStyle = definePartsStyle({
  field: {
    fontSize: 'xl',
    fontWeight: 'medium',
    color: colors.textPrimary,
    bg: 'transparent',
    padding: 0,
    height: 'auto',
    lineHeight: 'normal',
    boxShadow: 'none',
    borderRadius: 0
  }
})

const numberStyle = definePartsStyle({
  field: {
    width: '210px',
    fontSize: '14px',
    bg: colors.backgroundLight,
    borderRadius: '12px',
    _hover: {
      bg: colors.backgroundLight
    },
    _focus: {
      bg: colors.backgroundLight
    },
    _focusVisible: {
      bg: colors.backgroundLight,
      borderColor: 'transparent',
      boxShadow: 'none'
    },
    _invalid: {
      border: '1px solid red'
    }
  }
})

export const Input = defineMultiStyleConfig({
  variants: { filled: filledStyle, filledDark: capsuleRadioStyle, clean: cleanStyle, number: numberStyle },
  defaultProps: { variant: 'filled' }
})
