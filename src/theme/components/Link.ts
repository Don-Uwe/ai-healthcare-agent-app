import { colors } from '../cssVariables'

export const Link = {
  variants: {
    outline: {
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'none'
      }
    },
    highlight: {
      color: colors.textSeptenary,
      textDecoration: 'underline'
    }
  },
  baseStyle: { fontWeight: 500, color: colors.textLink, display: 'inline' }
}
