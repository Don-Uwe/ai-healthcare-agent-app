import { cardAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(cardAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    '--card-bg': colors.backgroundLight,
    px: 8,
    py: 12
  }
})

export const Card = defineMultiStyleConfig({ variants: { unstyled: baseStyle }, defaultProps: { variant: 'unstyled' } })
