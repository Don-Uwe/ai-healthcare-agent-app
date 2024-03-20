import { ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'
import { AprKey } from '@/hooks/pool/type'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import BN from 'bn.js'
import { useAppStore } from '@/store'
import { getPoolTickAprCore } from './utils/calApr'
import { useMemo } from 'react'

export default function useClmmApr({
  poolInfo,
  poolLiquidity,
  positionInfo,
  timeBasis
}: {
  poolInfo?: ApiV3PoolInfoConcentratedItem
  poolLiquidity: BN
  positionInfo: { tickLower?: number; tickUpper?: number; liquidity?: BN }
  timeBasis: AprKey
}) {
  const planType = useAppStore((s) => s.aprMode)
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const tickLower = positionInfo?.tickLower || 0
  const tickUpper = positionInfo?.tickUpper || 0
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo?.mintA.address, poolInfo?.mintB.address]
  })

  const apr = useMemo(
    () =>
      tickLower != null && tickUpper != null && poolInfo && positionInfo.liquidity
        ? getPoolTickAprCore({
            poolInfo,
            timeBasis,
            tickLower,
            tickUpper,
            poolLiquidity,
            chainTimeOffsetMs: chainTimeOffset,
            planType,
            tokenPrices,
            liquidity: positionInfo.liquidity
          })
        : undefined,
    [chainTimeOffset, timeBasis, tickLower, tickUpper, poolInfo, positionInfo.liquidity, poolLiquidity, planType]
  )
  return apr
}
