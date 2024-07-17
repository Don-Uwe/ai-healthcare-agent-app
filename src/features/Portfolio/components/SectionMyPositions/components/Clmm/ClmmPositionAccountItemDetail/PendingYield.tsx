import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import useResponsive from '@/hooks/useResponsive'

type PendingYieldProps = {
  pendingYield?: string
  isLoading?: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: () => void
}

export default function PendingYield({ isLoading, hasReward, pendingYield, rewardInfos, onHarvest }: PendingYieldProps) {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useResponsive()
  return (
    <Flex flex={1} justify="space-around" w="full" fontSize="sm" flexDirection="column" gap={3} p={[4, 0]}>
      <HStack justifyContent="space-between">
        <HStack>
          <Text color={colors.textSecondary} whiteSpace="nowrap">
            {t('portfolio.section_positions_clmm_account_pending_yield')}
          </Text>
          <Text color={colors.textPrimary} whiteSpace="nowrap">
            ({pendingYield ?? '$0'})
          </Text>
        </HStack>
        <Button isLoading={isLoading} isDisabled={!hasReward} onClick={onHarvest} size="sm" fontSize="md" variant="outline">
          {t('portfolio.section_positions_clmm_account_pending_yield_button')}
        </Button>
      </HStack>

      <Flex display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
        {rewardInfos
          .filter((r) => {
            return Number(r.amount) != 0
          })
          .map((r, index) => (
            <Flex key={r.mint.address} alignItems="center" gap="1" justifyContent={index % 2 === 0 ? 'start' : 'end'}>
              <TokenAvatar key={`pool-reward-${r.mint.address}`} size={'sm'} token={r.mint} />
              <Text color={colors.textPrimary}>
                {formatCurrency(r.amount, {
                  abbreviated: true,
                  decimalPlaces: isTablet ? 2 : 4,
                  maximumDecimalTrailingZeroes: 2
                })}
              </Text>
              <Text color={colors.textSecondary} display={['block', 'none', 'block']}>
                {getMintSymbol({ mint: r.mint, transformSol: true })}
              </Text>
              <Text color={colors.textPrimary}>
                (
                {formatCurrency(r.amountUSD, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: isMobile ? 4 : 2,
                  maximumDecimalTrailingZeroes: 2
                })}
                )
              </Text>
            </Flex>
          ))}
      </Flex>
    </Flex>
  )
}
