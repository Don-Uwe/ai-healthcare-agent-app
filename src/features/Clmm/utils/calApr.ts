import { ApiV3PoolInfoConcentratedItem, PoolUtils, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { AprKey } from '@/hooks/pool/type'
import BN from 'bn.js'

export interface AprData {
  fee: {
    apr: number
    percentInTotal: number
  }
  rewards: {
    apr: number
    percentInTotal: number
    mint: ApiV3Token
  }[]
  apr: number
}

export type GetAprPositionParameters = {
  poolInfo: ApiV3PoolInfoConcentratedItem
  poolLiquidity: BN
  positionAccount: ClmmPosition
  tokenPrices: Record<string, TokenPrice>
  timeBasis: AprKey
  planType: 'D' | 'C'
  chainTimeOffsetMs?: number
}

export function getPositionAprCore({
  poolInfo,
  positionAccount,
  tokenPrices,
  poolLiquidity,
  timeBasis,
  planType,
  chainTimeOffsetMs = 0
}: GetAprPositionParameters) {
  if (positionAccount.liquidity.isZero()) {
    return {
      fee: {
        apr: 0,
        percentInTotal: 0
      },
      rewards: poolInfo.rewardDefaultInfos.map((i, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos[idx].mint
      })),
      apr: 0
    }
  }
  if (planType === 'D') {
    const planBApr = PoolUtils.estimateAprsForPriceRangeDelta({
      poolInfo,
      aprType: timeBasis,
      poolLiquidity,
      mintPrice: tokenPrices,
      positionTickLowerIndex: Math.min(positionAccount.tickLower, positionAccount.tickUpper),
      positionTickUpperIndex: Math.max(positionAccount.tickLower, positionAccount.tickUpper),
      chainTime: (Date.now() + chainTimeOffsetMs) / 1000,
      liquidity: positionAccount.liquidity
    })
    const slicedRewardApr = planBApr.rewardsApr.slice(0, poolInfo.rewardDefaultInfos.length)
    const total = [planBApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
    return {
      fee: {
        apr: planBApr.feeApr,
        percentInTotal: (planBApr.feeApr / total) * 100
      },
      rewards: slicedRewardApr.map((i, idx) => ({
        apr: i,
        percentInTotal: (i / total) * 100,
        mint: poolInfo.rewardDefaultInfos[idx].mint
      })),
      apr: isNaN(planBApr.apr) ? 0 : planBApr.apr
    }
  } else {
    const planCApr = PoolUtils.estimateAprsForPriceRangeMultiplier({
      poolInfo,
      aprType: timeBasis,
      positionTickLowerIndex: Math.min(positionAccount.tickLower, positionAccount.tickUpper),
      positionTickUpperIndex: Math.max(positionAccount.tickLower, positionAccount.tickUpper)
    })
    const slicedRewardApr = planCApr.rewardsApr.slice(0, poolInfo.rewardDefaultInfos.length)
    const total = [planCApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
    return {
      fee: {
        apr: planCApr.feeApr,
        percentInTotal: (planCApr.feeApr / total) * 100
      },
      rewards: slicedRewardApr.map((i, idx) => ({
        apr: i,
        percentInTotal: (i / total) * 100,
        mint: poolInfo.rewardDefaultInfos[idx].mint
      })),
      apr: isNaN(planCApr.apr) ? 0 : planCApr.apr
    }
  }
}

interface Props {
  poolInfo: ApiV3PoolInfoConcentratedItem
  poolLiquidity: BN
  tickLower: number
  tickUpper: number
  planType: 'D' | 'M'
  tokenPrices: Record<string, any>
  timeBasis: AprKey
  chainTimeOffsetMs: number
  liquidity: BN
}

export function getPoolTickAprCore({
  poolInfo,
  tickLower,
  tickUpper,
  tokenPrices,
  timeBasis,
  planType,
  chainTimeOffsetMs = 0,
  poolLiquidity,
  liquidity
}: Props) {
  if (liquidity.isZero()) {
    return {
      fee: {
        apr: 0,
        percentInTotal: 0
      },
      rewards: poolInfo.rewardDefaultInfos.map((i, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos[idx].mint
      })),
      apr: 0
    }
  }
  if (planType === 'D') {
    const planBApr = PoolUtils.estimateAprsForPriceRangeDelta({
      poolInfo,
      poolLiquidity,
      aprType: timeBasis,
      mintPrice: tokenPrices,
      positionTickLowerIndex: Math.min(tickLower, tickUpper),
      positionTickUpperIndex: Math.max(tickLower, tickUpper),
      chainTime: (Date.now() + chainTimeOffsetMs) / 1000,
      liquidity
    })
    const slicedRewardApr = planBApr.rewardsApr.slice(0, poolInfo.rewardDefaultInfos.length)
    const total = [planBApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
    return {
      fee: {
        apr: planBApr.feeApr,
        percentInTotal: (planBApr.feeApr / total) * 100
      },
      rewards: slicedRewardApr.map((i, idx) => ({
        apr: i,
        percentInTotal: (i / total) * 100,
        mint: poolInfo.rewardDefaultInfos[idx].mint
      })),
      apr: planBApr.apr
    }
  }
  const planCApr = PoolUtils.estimateAprsForPriceRangeMultiplier({
    poolInfo,
    aprType: timeBasis,
    positionTickLowerIndex: Math.min(tickLower, tickUpper),
    positionTickUpperIndex: Math.max(tickLower, tickUpper)
  })
  const slicedRewardApr = planCApr.rewardsApr.slice(0, poolInfo.rewardDefaultInfos.length)
  const total = [planCApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
  return {
    fee: {
      apr: planCApr.feeApr,
      percentInTotal: (planCApr.feeApr / total) * 100
    },
    rewards: slicedRewardApr.map((i, idx) => ({
      apr: i,
      percentInTotal: (i / total) * 100,
      mint: poolInfo.rewardDefaultInfos[idx].mint
    })),
    apr: planCApr.apr
  }
}
