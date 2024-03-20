import { colors } from '../cssVariables'

export const Popover = {
  baseStyle: {
    popper: {
      border: 'none',
      '--popper-arrow-size': '12px'
    },
    header: {
      border: 'none',
      paddingBottom: '0',
      fontSize: '14px',
      fontWeight: '500',
      color: colors.textPrimary
    },
    body: {
      paddingTop: '0',
      fontSize: '12px',
      color: colors.textSecondary
    },
    content: {
      bg: colors.popoverBg,
      border: 'none',
      width: 'fit-content',
      maxWidth: '300px'
    },
    arrow: {
      boxShadow: 'none !important',
      borderColor: colors.popoverBg,
      bg: `${colors.popoverBg} !important`
    }
  }
}
