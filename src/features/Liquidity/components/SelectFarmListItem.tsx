import { Badge, Box, Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import CircleCheckFill from '@/icons/misc/CircleCheckFill'
import { colors } from '@/theme/cssVariables'
import { FarmType, FormattedFarmInfo } from '@/hooks/farm/type'
import { formatCurrency } from '@/utils/numberish/formatter'
import { useTranslation } from 'react-i18next'

type SelectFarmListItemProps = {
  farm: FormattedFarmInfo
  currentSelectedId?: string
}

export default function SelectFarmListItem({ farm, currentSelectedId }: SelectFarmListItemProps) {
  const { t } = useTranslation()
  const [farmTokens, setFarmTokens] = useState<{ base: ApiV3Token | undefined; quote: ApiV3Token | undefined } | undefined>(undefined)

  useEffect(() => {
    setFarmTokens({ base: farm.symbolMints[0], quote: farm.symbolMints[1] })
  }, [farm])

  if (!farm) return null

  return (
    <SimpleGrid columns={4} w="full" spacing={4}>
      <Box>
        <Box>
          <HStack align="center">
            <TokenAvatarPair size="xs" token1={farm.symbolMints[0]} token2={farm.symbolMints[1]} />
            <Text fontSize="xs" fontWeight="medium" color={colors.textPrimary} textAlign="center">
              {farmTokens?.base?.symbol}/{farmTokens?.quote?.symbol}
            </Text>
          </HStack>
        </Box>
        <Box>
          <Badge variant="crooked">
            {farm.type === FarmType.Ecosystem
              ? t('badge.ecosystem')
              : farm.type === FarmType.Fusion
              ? t('badge.fusion')
              : t('badge.raydium')}
          </Badge>
        </Box>
      </Box>
      <Box>
        <Text fontSize="sm" color={colors.textSecondary} opacity={0.6}>
          TVL
        </Text>
        <Text fontSize="sm" color={colors.textSecondary}>
          {formatCurrency(farm.tvl, { symbol: '$', decimalPlaces: 2 })}
        </Text>
      </Box>
      <Box>
        <Text fontSize="sm" color={colors.textSecondary} opacity={0.6}>
          Rewards
        </Text>
        <HStack spacing={-1}>
          {farm.rewardInfos?.map((reward, idx) => (
            <TokenAvatar size="xs" key={`reward-token-${idx}`} token={reward.mint} />
          ))}
        </HStack>
      </Box>
      <Flex justify="space-between">
        <Box>
          <Text fontSize="sm" color={colors.textSecondary} opacity={0.6}>
            APR
          </Text>
          <Text fontSize="sm" color={colors.textSecondary}>
            {formatCurrency(farm.apr * 100, { decimalPlaces: 2 })}%
          </Text>
        </Box>
        <Box my="auto">{farm.id === currentSelectedId ? <CircleCheckFill /> : null}</Box>
      </Flex>
    </SimpleGrid>
  )
}
