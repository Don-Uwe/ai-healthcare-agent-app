import { useEffect, useMemo } from 'react'
import { Badge, Box, Button, Divider, Grid, GridItem, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import TokenAvatar from '@/components/TokenAvatar'
import useFetchFarmInfoById from '@/hooks/farm/useFetchFarmInfoById'
import FarmRewardIcon from '@/icons/pool/FarmRewardIcon'
import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { routeToPage } from '@/utils/routeTools'
import { toAPRPercent } from '@/features/Pools/util'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { FarmBalanceInfo } from '@/hooks/farm/type'
import Decimal from 'decimal.js'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

/** subItem of standard Pool */
export default function StandardPoolRowStakeFarmItem({
  poolId,
  farmId,
  lpPrice,
  balanceInfo,
  hide,
  onUpdatePendingReward
}: {
  poolId: string
  farmId: string
  lpPrice: number
  balanceInfo?: FarmBalanceInfo
  hide?: boolean
  onUpdatePendingReward: (params: {
    farmId: string
    reward: { mint: ApiV3Token[]; usd: string; amount: string[]; rewardTokenUsd: string[] }
  }) => void
}) {
  const { t } = useTranslation()
  const { data } = useFetchFarmInfoById({ idList: [farmId] })
  const farm = data?.[0]
  const { data: tokenPrices } = useTokenPrice({
    mintList: farm?.rewardInfos.map((r) => r.mint.address) || []
  })
  const { deposited = '0', pendingRewards = [] } = balanceInfo || {}

  const { pendingReward, rewardTokenUsd } = useMemo(() => {
    const rewardTokenUsd: string[] = []
    const all = pendingRewards
      .reduce((acc, cur, idx) => {
        if (!farm?.rewardInfos[idx]) return acc
        const usd = new Decimal(cur).mul(tokenPrices[farm?.rewardInfos[idx].mint.address || '']?.value ?? 0) // reward in usd
        rewardTokenUsd.push(usd.toFixed(4))
        return acc.add(usd)
      }, new Decimal(0))
      .toDecimalPlaces(6)
      .toString()

    return { pendingReward: all, rewardTokenUsd }
  }, [pendingRewards])

  useEffect(() => {
    if (!farm?.id) return
    onUpdatePendingReward({
      farmId: farm.id,
      reward: {
        mint: farm.rewardInfos.map((r) => r.mint),
        usd: pendingReward,
        amount: pendingRewards,
        rewardTokenUsd
      }
    })
  }, [farm?.id, pendingReward, onUpdatePendingReward])
  if (!farm || hide) return null

  return (
    <Grid
      gridAutoFlow={'column'}
      gridTemplate={[
        `
      "face  face action" auto
      "infos infos infos " auto / auto auto 1fr
      `,
        `
      "face  infos action" auto / 1fr 3fr 1fr
    `
      ]}
      py={[3, 2]}
      px={[4, 8]}
      bg={colors.backgroundDark}
      columnGap={4}
      rowGap={3}
      borderRadius="xl"
      w="full"
      alignItems={'center'}
      justifyItems={'left'}
      flexWrap="wrap"
    >
      <GridItem area="face">
        <HStack spacing={3}>
          <HStack py={1} px={2} bg={colors.backgroundTransparent12} gap={1} borderRadius="md">
            <Box color={colors.textSecondary}>
              <FarmRewardIcon />
            </Box>
            {farm.rewardInfos.map((r, idx) => (
              <TokenAvatar key={`${farmId}-${r.mint.address}`} token={r.mint} ml={-1 * idx * 2} size="smi" />
            ))}
          </HStack>
          <Badge variant="crooked">{t('badge.ecosystem')}</Badge>
        </HStack>
      </GridItem>

      <GridItem area="infos" justifySelf={'stretch'} fontSize={['sm', 'md']}>
        <SimpleGrid columnGap={[2, 8]} templateColumns={'1fr auto auto auto 1fr'}>
          <HStack justifyContent={'right'}>
            <Text color={colors.textSecondary}>{t('amm.staked')}</Text>
            <Text>{toUsdVolume(new Decimal(deposited).mul(lpPrice).toString())}</Text>
          </HStack>

          <Divider orientation="vertical" alignSelf="stretch" />

          <HStack width={['84px', '100px']} justifyContent={'center'}>
            <Text color={colors.textSecondary}>{t('liquidity.APR')}</Text>
            <Text>{toAPRPercent(farm.apr)}</Text>
          </HStack>

          <Divider orientation="vertical" alignSelf="stretch" />

          <HStack justifyContent={'left'}>
            <Text color={colors.textSecondary}>{t('amm.pending_reward')}</Text>
            <Text>{toUsdVolume(pendingReward)}</Text>
          </HStack>
        </SimpleGrid>
      </GridItem>

      <GridItem area={'action'} justifySelf={'end'}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => routeToPage('decrease-liquidity', { queryProps: { mode: 'unstake', pool_id: poolId, farm_id: farm.id } })}
        >
          {t('button.unstake')}
        </Button>
      </GridItem>
    </Grid>
  )
}
