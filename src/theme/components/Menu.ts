import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import {} from '@chakra-ui/theme-tools'
import { colors, shadows } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys)
const lg = definePartsStyle({
  button: { fontSize: '20px' },
  list: { borderRadius: '12px' },
  divider: { mx: '20px', my: '12px' },
  item: { fontSize: '16px', fontWeight: '400' }
})

// for setting menu
const _3xl = definePartsStyle({
  button: { fontSize: '20px' },
  list: {
    borderRadius: '20px',
    width: 'min(100vw - 2 * 20px, 480px)',
    px: ['20px', '32px'],
    py: '24px',
    mx: '20px',
    boxShadow: [shadows.appMask, shadows.bigCard].join(',')
  },
  divider: { mx: '20px', my: '12px' },
  item: { fontSize: '16px', fontWeight: '400' }
})

const baseStyle = definePartsStyle({
  button: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: '14px',
    py: '11px',
    px: '14px',
    borderRadius: '8px',
    color: colors.textTertiary,
    _hover: {
      bg: colors.backgroundLight,
      color: colors.textSecondary
    },
    _expanded: {
      bg: colors.backgroundLight,
      color: colors.textSecondary
    }
  },

  list: {
    py: '4px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: colors.backgroundDark,
    overflow: 'hidden',
    bg: colors.backgroundLight,
    /** @see https://semi.design/en-US/basic/tokens#z-index */
    zIndex: 1050
  },

  divider: {
    borderColor: colors.textSecondary,
    opacity: 0.1,
    mx: '12px',
    my: '8px'
  },

  item: {
    fontWeight: '500',
    fontSize: '14px',
    color: colors.textSecondary,
    py: '10px',
    px: '20px',
    transition: '200ms',
    bg: 'transparent',
    _hover: {
      color: colors.textSecondary,
      bg: colors.backgroundMedium
    },
    _focus: {
      color: colors.textSecondary,
      bg: colors.backgroundMedium
    }
  }
  // groupTitle: {
  //   // this will style the text defined by the title prop
  //   // in the MenuGroup and MenuOptionGroup components
  //   textTransform: 'uppercase',
  //   color: 'white',
  //   textAlign: 'center',
  //   letterSpacing: 'wider',
  //   opacity: '0.7'
  // },
  // command: {
  //   // this will style the text defined by the command
  //   // prop in the MenuItem and MenuItemOption components
  //   opacity: '0.8',
  //   fontFamily: 'mono',
  //   fontSize: 'sm',
  //   letterSpacing: 'tighter',
  //   pl: '4'
  // },
  // divider: {
  //   // this will style the MenuDivider component
  //   my: '4',
  //   borderColor: 'white',
  //   borderBottom: '2px dotted'
  // }
})

export const Menu = defineMultiStyleConfig({ baseStyle, sizes: { lg, '3xl': _3xl } })
