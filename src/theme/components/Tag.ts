import { tagAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys)

const roundedStyle = definePartsStyle({
  // define the part you're going to style
  container: {
    bg: colors.backgroundTransparent12,
    color: colors.textSecondary,
    borderRadius: '21px'
  }
})

const parallelogram = definePartsStyle({
  container: {
    width: 'fit-content',
    textTransform: 'none',
    bg: colors.badgePurple,
    py: '1px',
    px: '8px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    fontWeight: 'normal',
    height: 'fit-content',
    color: colors.textPrimary,
    transform: 'skew(-10deg)'
  }
})

const md = defineStyle({
  px: '10px',
  py: '1px',
  fontSize: '14px'
})

const sm = defineStyle({
  px: '8px',
  py: '1px',
  fontSize: '12px'
})

const sizes = {
  sm: definePartsStyle({ container: sm }),
  md: definePartsStyle({ container: md })
}

export const Tag = defineMultiStyleConfig({ variants: { rounded: roundedStyle, parallelogram }, sizes })
