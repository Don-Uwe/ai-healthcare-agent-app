import { Grid, GridItem, useDisclosure } from '@chakra-ui/react'
import { ApiV3Token, ApiStakePool } from '@raydium-io/raydium-sdk-v2'

import { colors } from '@/theme/cssVariables'
import { useFarmStore } from '@/store/useFarmStore'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import Apr from './Apr'
import ActionButtons from './Manipulate'
import PendingRewards from './PendingRewards'
import TokenBriefFace from './TokenBriefFace'
import StakedValue from './StakedValue'
import { panelCard } from '@/theme/cssBlocks'
import Decimal from 'decimal.js'

export const PositionStatus = {
  unstaked: 'UnStaked Tokens',
  ended: 'Ended farm',
  normal: ''
}

type PoolProps = {
  pool: ApiStakePool
  staked: {
    token: ApiV3Token | undefined
    amount: string
    pendingReward: string
    v1Vault?: string
  }
  apr: string
  onConfirmed?: () => void
}

export default function StakingPositionRawItem({ pool, staked, apr, onConfirmed }: PoolProps) {
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const { data: tokenPrices } = useTokenPrice({
    mintList: [staked.token?.address]
  })
  const withdrawFarmAct = useFarmStore((s) => s.withdrawFarmAct)
  const handleHarvest = useEvent(() => {
    onLoading()
    withdrawFarmAct({
      farmInfo: pool,
      amount: '0',
      userAuxiliaryLedgers: staked.v1Vault ? [staked.v1Vault] : undefined,
      onConfirmed,
      onFinally: offLoading
    })
  })

  const positionUsd = new Decimal(staked.amount).mul(pool.lpPrice || 0).toString()
  const pendingAmount = staked.pendingReward || 0
  const pendingAmountInUSD = new Decimal(pendingAmount).mul(tokenPrices[staked.token?.address || '']?.value || 0).toString()

  return (
    <Grid
      {...panelCard}
      gridTemplate={[
        `
        "face   face" auto
        "staked apr " auto
        "pend   pend" auto
        "btns   btns" auto / 1fr 1fr
      `,
        `
        "face staked apr pend btns" auto / 1fr 1fr 1fr 2fr 2fr
      `
      ]}
      gap={4}
      py={[4, 5]}
      px={[3, 8]}
      bg={colors.backgroundLight}
      borderRadius={['lg', 'xl']}
    >
      <GridItem area="face">
        <TokenBriefFace token={staked.token} />
      </GridItem>
      <GridItem area="staked">
        <StakedValue positionUsd={positionUsd} staked={staked} />
      </GridItem>
      <GridItem area="apr">
        <Apr apr={apr} />
      </GridItem>
      <GridItem area="pend">
        <PendingRewards
          pendingReward={pendingAmountInUSD}
          isLoading={isLoading}
          harvestable={!new Decimal(pendingAmount).isZero()}
          onHarvest={handleHarvest}
        />
      </GridItem>
      <GridItem area="btns" justifySelf={['center', 'end']}>
        <ActionButtons id={pool.id} stakedToken={staked.token} />
      </GridItem>
    </Grid>
  )
}
