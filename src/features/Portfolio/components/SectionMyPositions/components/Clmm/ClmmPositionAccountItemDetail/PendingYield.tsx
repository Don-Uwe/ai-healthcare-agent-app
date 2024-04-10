import { Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import Button from '@/components/Button'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'

type PendingYieldProps = {
  pendingYield?: string
  rewardTokens: ApiV3Token[]
  isLoading?: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: () => void
}

export default function PendingYield({ isLoading, hasReward, rewardInfos, onHarvest, pendingYield, rewardTokens }: PendingYieldProps) {
  const { t } = useTranslation()

  return (
    <SimpleGrid
      flex={1}
      bg={colors.backgroundDark}
      w="full"
      borderRadius="12px"
      p={4}
      gap={2}
      fontSize="sm"
      gridTemplate={`
        "title  title" auto
        "volumn btn  " auto / 1fr .7fr
      `}
      alignItems="center"
    >
      <Text gridArea={'title'} color={colors.textSecondary}>
        {t('portfolio.section_positions_clmm_account_pending_yield')}
      </Text>
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
      <HStack gridArea={'volumn'}>
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
                  <Text color={colors.textPrimary}>({toUsdVolume(r.amountUSD, { decimals: 4, decimalMode: 'trim' })})</Text>
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
    </SimpleGrid>
  )
}
