import { AlertProps, Box, Text } from '@chakra-ui/react'

import ExclaimationTriangle from '@/icons/misc/ExclaimationTriangle'
import { colors } from '@/theme/cssVariables'

export interface MessageBoxProps extends AlertProps {
  title?: string
  status?: 'warning' | 'error' | 'info'
  icon?: React.ReactNode
  children?: React.ReactNode
}

export default function MessageBox({ title, status = 'info', icon, children, ...rest }: MessageBoxProps) {
  const customColor =
    status === 'error'
      ? {
          mainColor: colors.semanticError,
          bg: 'rgba(255, 78, 163, 0.1)'
        }
      : status === 'warning'
      ? {
          mainColor: colors.semanticWarning,
          bg: 'rgba(254, 211, 58, 0.1)'
        }
      : {
          mainColor: colors.semanticNeutral,
          bg: 'rgba(171, 196, 255, 0.07)'
        }

  return (
    <Box display="flex" bg={customColor.bg} px="18px" py={3} borderRadius="8px" color={customColor.mainColor} {...rest}>
      <Box mr={3}>{icon ?? <ExclaimationTriangle />}</Box>
      <Box display="flex" flexDirection="column" justifyContent="start">
        {title && <Text>{title}</Text>}
        {children && <Box mt={title ? 3 : 0}>{children}</Box>}
      </Box>
    </Box>
  )
}
