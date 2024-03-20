import { defineStyle } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const crooked = defineStyle({
  bg: `linear-gradient(86.97deg, rgba(140, 110, 239, 0.65) 6.03%, rgba(140, 110, 239, 0.5) 94.29%);`,
  transform: 'matrix(1, 0, -0.22, 0.98, 0, 0)',
  fontSize: '10px',
  py: '2px',
  px: '8px',
  borderRadius: '4px',
  color: '#ECF5FF'
})

const rounded = defineStyle({
  width: 'fit-content',
  textTransform: 'none',
  bg: colors.backgroundTransparent12,
  py: '1px',
  px: '8px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '8px',
  fontWeight: 'normal',
  height: 'fit-content',
  color: colors.textSecondary
})

const ok = defineStyle({
  width: 'fit-content',
  textTransform: 'none',
  bg: colors.backgroundTransparent12,
  py: '1px',
  px: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '.35em',
  borderRadius: '8px',
  fontWeight: 'normal',
  height: 'fit-content',
  color: colors.textSecondary,
  '&::before': {
    content: '""',
    width: '.5em',
    height: '.5em',
    rounded: 'full',
    bg: colors.priceFloatingUp,
    transform: 'translateY(5%)'
  }
})

const error = defineStyle({
  width: 'fit-content',
  textTransform: 'none',
  bg: colors.backgroundTransparent12,
  py: '1px',
  px: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '.35em',
  borderRadius: '8px',
  fontWeight: 'normal',
  height: 'fit-content',
  color: colors.textSecondary,
  '&::before': {
    content: '""',
    width: '.5em',
    height: '.5em',
    rounded: 'full',
    bg: colors.priceFloatingDown,
    transform: 'translateY(5%)'
  }
})

export const Badge = {
  variants: {
    crooked,
    ok,
    error,
    rounded
  }
}
