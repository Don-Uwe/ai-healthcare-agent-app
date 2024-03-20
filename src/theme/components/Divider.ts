import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const solid = defineStyle({
  borderWidth: '1.5px', // change the width of the border
  borderStyle: 'solid', // change the style of the border
  borderRadius: 10, // set border radius to 10
  borderColor: colors.dividerBg
})

const dash = defineStyle({
  borderWidth: '2px',
  borderStyle: 'dashed',
  borderColor: colors.dividerBg
})

export const dividerTheme = defineStyleConfig({
  variants: { solid, dash }
})
