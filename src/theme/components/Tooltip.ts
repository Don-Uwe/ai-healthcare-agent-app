import { defineStyle, defineStyleConfig, Tooltip as _Tooltip } from '@chakra-ui/react'
import { colors } from '../cssVariables'

const baseStyle = defineStyle({
  // '--popper-arrow-bg': commonTheme.colors.lightenMain,
  '--tooltip-bg': `revert !important`,
  '--tooltip-fg': `${colors.textSecondary} !important`,
  fontSize: '14px',
  borderRadius: '8px',
  py: 3,
  px: 4
})
const card = defineStyle({
  py: 'revert',
  px: 'revert',
  borderRadius: '12px'
})

_Tooltip.defaultProps = {
  hasArrow: true,
  placement: 'top'
}

export const Tooltip = defineStyleConfig({
  baseStyle,
  variants: { card }
})
