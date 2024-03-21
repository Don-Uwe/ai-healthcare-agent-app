import { useTranslation } from 'react-i18next'
import TokenAvatar from '@/components/TokenAvatar'
import { colors, sizes } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { Badge, Box, Flex, Grid, HStack, VStack } from '@chakra-ui/react'
import { WeeklyRewardData } from '@/hooks/pool/type'
import { AprData } from '@/features/Clmm/utils/calApr'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { aprColors } from './PoolListItemAprLine'
import { PoolListItemAprPie } from './PoolListItemAprPie'
import { wSolToSolString } from '@/utils/token'
import { toAPRPercent } from '../util'
import { formatCurrency } from '@/utils/numberish/formatter'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'

export default function PoolListItemAprDetailPopoverContent({
  aprData,
  rewardType,
  weeklyRewards
}: {
  aprData: AprData
  rewardType: string
  weeklyRewards: WeeklyRewardData
}) {
  const { t } = useTranslation()
  const { data: tokenPrices } = useTokenPrice({
    mintList: weeklyRewards.map((r) => r.token.address)
  })

  return (
    <Flex flexDir="column" p={2} gap={4}>
      <Box>
        <Flex mb={2} alignItems="center" justifyContent="space-between">
          <Box fontSize={sizes.textSM} color={colors.textSecondary}>
            {t('field.total_apr')}
          </Box>
          <Box fontSize={sizes.textLG} fontWeight="medium" color={colors.textPrimary}>
            {parseFloat(aprData.apr.toFixed(2))}%
          </Box>
        </Flex>
        {/* total apr */}
        <Grid templateColumns="auto 1fr" gap={8}>
          <PoolListItemAprPie aprs={aprData} />
          <Flex flexGrow={2} justify="space-between" align="center">
            <VStack flex={3}>
              <Flex w="full" gap={4} justify="space-between" align="center">
                <Flex fontSize={sizes.textXS} fontWeight="normal" color={colors.textSecondary} justify="flex-start" align="center">
                  <Box rounded="full" bg={aprColors[0]} w="7px" h="7px" mr="8px"></Box>
                  {t('field.trade_fees')}
                </Flex>
                <Box fontSize={sizes.textXS} color={colors.textPrimary}>
                  {toAPRPercent(aprData.fee.apr)}
                </Box>
              </Flex>
              {aprData.rewards.map(({ apr, mint }, idx) => {
                if (weeklyRewards[idx].amount === '0') return null
                return (
                  <Flex w="full" gap={4} key={`reward-${mint?.symbol}-${idx}`} justify="space-between" align="center">
                    <Flex fontSize={sizes.textXS} fontWeight="normal" color={colors.textSecondary} justify="flex-start" align="center">
                      <Box rounded="full" bg={aprColors[idx + 1]} w="7px" h="7px" mr="8px"></Box>
                      {wSolToSolString(mint?.symbol)}
                    </Flex>
                    <Box fontSize={sizes.textXS} color={colors.textPrimary}>
                      {toAPRPercent(apr)}
                    </Box>
                  </Flex>
                )
              })}
            </VStack>
          </Flex>
        </Grid>
      </Box>

      {weeklyRewards.length > 0 && (
        <Box>
          <Flex mb={2} alignItems="center" justifyContent="space-between">
            <Box fontSize={sizes.textSM} color={colors.textSecondary}>
              {t('field.weekly_rewards')}
            </Box>
            <Box fontSize="14px" fontWeight="normal" color={colors.textPrimary}>
              {rewardType && <Badge variant="crooked">{rewardType}</Badge>}
            </Box>
          </Flex>
          {/* total apr */}
          {weeklyRewards.map((reward) => {
            if (reward.amount === '0') return null
            return (
              <Flex gap={4} w="full" key={String(reward.token?.address)} justify="space-between" align="center" fontSize="12px" mt="8px">
                <HStack fontWeight="normal" color={colors.textSecondary} spacing="5px">
                  <TokenAvatar size="xs" token={reward.token} />
                  <Box color={colors.textPrimary}>({formatCurrency(reward.amount, { decimalPlaces: 1, abbreviated: true })})</Box>
                  <Box>{reward.token?.symbol}</Box>
                  <Box color={colors.textPrimary}>
                    (
                    {toUsdVolume(new Decimal(tokenPrices[reward.token.address]?.value || 0).mul(reward.amount).toString(), {
                      useShorterExpression: true
                    })}
                    )
                  </Box>
                </HStack>
                {reward.endTime ? (
                  <Box fontSize="10px" fontWeight="normal" color={colors.textSecondary}>
                    {t('liquidity.rewards_ends')} {dayjs(reward.endTime * 1000).format('MM/DD/YY')}
                  </Box>
                ) : null}
              </Flex>
            )
          })}
        </Box>
      )}
    </Flex>
  )
}
