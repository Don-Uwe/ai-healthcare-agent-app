import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import Button from '@/components/Button'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'

type PendingYieldProps = {
  pendingYield?: string
  rewardTokens: ApiV3Token[]
  isLoading?: boolean
  hasReward?: boolean
  isMobile?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: () => void
}

export default function PendingYield({
  isLoading,
  isMobile,
  hasReward,
  rewardInfos,
  onHarvest,
  pendingYield,
  rewardTokens
}: PendingYieldProps) {
  const { t } = useTranslation()

  return (
    <Flex
      flex={1}
      bg={colors.backgroundDark}
      justify="space-around"
      w="full"
      borderRadius="12px"
      p={4}
      gap={2}
      fontSize="sm"
      flexDirection="column"
    >
      <Text color={colors.textSecondary}>{t('portfolio.section_positions_clmm_account_pending_yield')}</Text>
      <Flex justify="space-between" flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 2 : 6}>
        <HStack>
          <Text fontSize="xl" fontWeight="medium" color={colors.textPrimary}>
            {pendingYield ?? '$0'}
          </Text>
          <QuestionToolTip
            label={
              <>
                {rewardInfos.map((r) => (
                  <Flex key={r.mint.address} alignItems="center" gap="1" my="2">
                    <TokenAvatar key={`pool-reward-${r.mint.address}`} size={'sm'} token={r.mint} />
                    <Text color={colors.textPrimary}>
                      {formatCurrency(r.amount, {
                        maximumDecimalTrailingZeroes: 5
                      })}
                    </Text>
                    <Text>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
                    <Text color={colors.textPrimary}>({formatCurrency(r.amountUSD, { symbol: '$', decimalPlaces: 4 })})</Text>
                  </Flex>
                ))}
              </>
            }
            iconType="info"
            iconProps={{ width: 18, height: 18, fill: colors.textSecondary }}
          />
          <Flex>
            {rewardTokens.map((token) => (token ? <TokenAvatar key={`reward-token-${token.address}`} token={token} mr={'-4px'} /> : null))}
          </Flex>
        </HStack>
        <Button
          isLoading={isLoading}
          isDisabled={!hasReward}
          onClick={onHarvest}
          gridArea={'btn'}
          justifySelf={'end'}
          size="sm"
          variant="outline"
        >
          {t('portfolio.section_positions_clmm_account_pending_yield_button')}
        </Button>
      </Flex>
    </Flex>
  )
}
