import { alertAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(alertAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    pr: 8,
    pl: 6,
    py: 5,
    bg: colors.backgroundMedium,
    borderTopRightRadius: '12px',
    borderBottomRightRadius: '12px'
  },
  title: {
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '20px',
    color: colors.primary
  },
  description: {
    fontWeight: 300,
    fontSize: '14px',
    lineHeight: '16px',
    mt: 3,
    color: 'rgba(196, 214, 255, 0.5)'
  }
})

export const Alert = defineMultiStyleConfig({ baseStyle })
