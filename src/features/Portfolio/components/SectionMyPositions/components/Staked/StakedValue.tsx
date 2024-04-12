import { Flex, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

type StakedValueProps = {
  positionUsd: string
  staked: {
    token: ApiV3Token | undefined
    amount: string
  }
}

export default function StakedValue({ positionUsd, staked }: StakedValueProps) {
  return (
    <Flex flex={2} direction="column" justify={'space-between'} gap={[1, 2]}>
      <Text fontSize="sm" color={colors.textSecondary}>
        My Staked RAY
      </Text>
      <Text fontSize="lg" color={colors.textPrimary} fontWeight="500">
        {formatCurrency(staked.amount)} {staked.token?.symbol}
      </Text>
      <Text fontSize="xs" color={colors.textTertiary}>
        {formatCurrency(positionUsd, { symbol: '$', decimalPlaces: 2 })}
      </Text>
    </Flex>
  )
}
