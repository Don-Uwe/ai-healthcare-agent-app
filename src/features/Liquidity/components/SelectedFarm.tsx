import { Flex, HStack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { FarmType, FormattedFarmInfo } from '@/hooks/farm/type'
import { formatCurrency } from '@/utils/numberish/formatter'
type SelectedFarmProps = {
  farm?: FormattedFarmInfo
  farmCategory?: FarmType
}

export default function SelectedFarm({ farm }: SelectedFarmProps) {
  const [farmTokens, setFarmTokens] = useState<{ base: ApiV3Token | undefined; quote: ApiV3Token | undefined } | undefined>(undefined)
  const raydium = useAppStore((s) => s.raydium)

  useEffect(() => {
    if (farm !== undefined) {
      setFarmTokens({ base: farm.symbolMints[0], quote: farm.symbolMints[1] })
    }
  }, [raydium, farm])

  if (!farm) return null

  return (
    <Flex w="full" align="center">
      <Flex flex={1}>
        {farmTokens?.quote ? (
          <HStack align="center">
            <TokenAvatarPair size="xs" token1={farmTokens?.base} token2={farmTokens?.quote} />
            <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary} textAlign="center">
              {farmTokens.base?.symbol}/{farmTokens.quote.symbol}
            </Text>
          </HStack>
        ) : (
          <HStack>
            <TokenAvatar size="xs" token={farmTokens?.base} />
            <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary}>
              {farmTokens?.base?.symbol}
            </Text>
          </HStack>
        )}
      </Flex>
      <Flex flex={1}>
        <Text fontSize="sm" color={colors.textTertiary}>
          TVL: {formatCurrency(farm.tvl, { symbol: '$', decimalPlaces: 2 })}
        </Text>
      </Flex>
    </Flex>
  )
}
