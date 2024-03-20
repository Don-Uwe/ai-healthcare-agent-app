import { Box, Flex, Spacer } from '@chakra-ui/react'

import CircleCheck from '@/icons/misc/CircleCheck'
import ExternalLink from '@/icons/misc/ExternalLink'
import { colors } from '@/theme/cssVariables'

interface ToastTransactionProps {
  serialNum: number
}

export default function ToastTransaction({ serialNum }: ToastTransactionProps) {
  return (
    <Box bg={colors.backgroundDark} borderRadius="8px" p={3}>
      <Flex alignItems="center">
        <CircleCheck color={colors.secondary} width={20} height={20} />
        <Box fontWeight={500} fontSize={14} lineHeight="22px" ml="6px">
          Transaction {serialNum}
        </Box>
        <Spacer />
        <Flex fontSize={12} align="center" lineHeight="15px" color={colors.textSecondary}>
          <Box opacity={0.5}>View on</Box>&nbsp;
          <Box opacity={0.5} color={colors.secondary} mr={'6.5px'}>
            solscan
          </Box>
          <ExternalLink width={9} height={9} color={colors.primary} />
        </Flex>
      </Flex>
    </Box>
  )
}
