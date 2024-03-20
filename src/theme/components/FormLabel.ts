import { defineStyle, defineStyleConfig } from '@chakra-ui/react'
import { colors } from '../cssVariables'

export const FormLabel = defineStyleConfig({
  baseStyle: defineStyle({
    marginBottom: '0',
    fontSize: '14px',
    color: colors.textTertiary
  })
})
