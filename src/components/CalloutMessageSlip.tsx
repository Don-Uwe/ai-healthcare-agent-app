import { Alert, AlertDescription, AlertProps, AlertTitle, Box, HStack } from '@chakra-ui/react'
import React, { ReactNode, useMemo } from 'react'

import ExclaimationCircle from '@/icons/misc/ExclaimationCircle'
import { colors } from '@/theme/cssVariables'

export interface CalloutMessageSlipProps extends AlertProps {
  status?: 'info' | 'warning'
  title: string
  desc?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  actionNode?: ReactNode
}

export default function CalloutMessageSlip({ title, desc, actionNode, children, status = 'info', icon, ...rest }: CalloutMessageSlipProps) {
  const customColor = useMemo(() => ({ mainColor: status === 'warning' ? colors.semanticError : colors.primary }), [status])
  return (
    <Box display="flex" justifyContent="flex-start">
      <Box w={2} bg={customColor.mainColor} borderTopLeftRadius="12px" borderBottomLeftRadius="12px" />
      <Alert status={status} variant="subtle" {...rest}>
        <Box w="100%" display="flex" justifyContent="flex-start" alignItems="center">
          <Box display="flex">
            <Box display="flex" mr={3} color={customColor.mainColor}>
              {icon ?? <ExclaimationCircle />}
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="start">
              <AlertTitle color={customColor.mainColor}>{title}</AlertTitle>
              <AlertDescription>{desc}</AlertDescription>
              <Box mt={3}>{children}</Box>
            </Box>
          </Box>
          <Box display="flex" flexGrow={1} minW="100px" />
          <HStack spacing={5}>{actionNode}</HStack>
        </Box>
      </Alert>
    </Box>
  )
}
