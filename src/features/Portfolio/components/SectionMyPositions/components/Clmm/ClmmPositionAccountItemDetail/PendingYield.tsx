import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'

type PendingYieldProps = {
  isLoading?: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: () => void
}

export default function PendingYield({ isLoading, hasReward, rewardInfos, onHarvest }: PendingYieldProps) {
  const { t } = useTranslation()

  return (
    <Flex flex={1} bg={colors.backgroundDark} justify="space-around" w="full" fontSize="sm" flexDirection="column" gap={3} p={[4, 0]}>
      <HStack justifyContent="space-between">
        <Text color={colors.textSecondary} whiteSpace="nowrap">
          {t('portfolio.section_positions_clmm_account_pending_yield')}
        </Text>
        <Button isLoading={isLoading} isDisabled={!hasReward} onClick={onHarvest} size="sm" fontSize="md" variant="outline">
          {t('portfolio.section_positions_clmm_account_pending_yield_button')}
        </Button>
      </HStack>

      <Flex justify="space-between" flexDirection="column" gap={2}>
        {rewardInfos
          .filter((r) => {
            return Number(r.amount) != 0
          })
          .map((r) => (
            <Flex key={r.mint.address} alignItems="center" gap="1">
              <TokenAvatar key={`pool-reward-${r.mint.address}`} size={'sm'} token={r.mint} />
              <Text color={colors.textPrimary}>
                {formatCurrency(r.amount, {
                  maximumDecimalTrailingZeroes: 5
                })}
              </Text>
              <Text color={colors.textSecondary}>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
              <Text color={colors.textPrimary}>({formatCurrency(r.amountUSD, { symbol: '$' })})</Text>
            </Flex>
          ))}
      </Flex>
    </Flex>
  )
}
