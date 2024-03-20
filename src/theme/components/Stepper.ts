import { colors } from '../cssVariables'

export const Stepper = {
  baseStyle: {
    indicator: {
      '&[data-status=active]': {
        borderWidth: '0px',
        color: colors.backgroundDark
      },
      borderWidth: 'transparent',
      bg: colors.primary
    },
    separator: {
      background: colors.primary
    }
  },
  sizes: {
    lg: {
      number: {
        fontSize: 'md'
      },
      title: {
        fontSize: 'sm'
      },
      description: {
        fontSize: 'md'
      },
      separator: {
        marginLeft: '5px',
        marginTop: '7.5px'
      }
    }
  }
}
