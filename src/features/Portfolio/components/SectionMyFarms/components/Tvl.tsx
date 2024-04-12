import { Flex, FlexProps, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

type TvlProps = FlexProps & {
  tvl: string | number
  decimals: number
}

export default function Tvl({ tvl, decimals, ...rest }: TvlProps) {
  return (
    <Flex color={colors.textPrimary} direction="column" justify="flex-start" align="flex-start" gap={1} {...rest}>
      <Text fontSize="sm" color={colors.textTertiary}>
        TVL
      </Text>
      <Text fontSize="sm" color={colors.textPrimary}>
        {formatCurrency(tvl, { symbol: '$', decimalPlaces: decimals })}
      </Text>
    </Flex>
  )
}
