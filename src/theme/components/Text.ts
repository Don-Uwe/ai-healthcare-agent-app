import { colors } from '../cssVariables'

export const Text = {
  variants: {
    dialogTitle: {
      fontSize: '20px',
      fontWeight: 500,
      color: colors.textPrimary
    },
    title: {
      fontSize: 'md',
      fontWeight: 500,
      color: colors.textSecondary
    },
    subTitle: {
      fontSize: 'sm',
      fontWeight: 400,
      color: colors.textSecondary
    },
    label: {
      fontSize: 'xs',
      color: colors.textTertiary
    },
    error: {
      fontSize: 'sm',
      fontWeight: 400,
      color: colors.textPink
    }
  }
}
