import { tableAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys)

const baseStyle = definePartsStyle({
  // define the parts you're going to style
  thead: {
    th: {
      py: '10px',
      '&:last-child td': {
        borderBottom: 'none'
      }
    }
  },
  tbody: {}
})

export const Table = defineMultiStyleConfig({ baseStyle, defaultProps: { size: 'sm' } })
