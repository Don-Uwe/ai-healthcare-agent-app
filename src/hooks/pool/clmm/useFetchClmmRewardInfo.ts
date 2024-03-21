import { useState, useEffect } from 'react'
import {
  TickUtils,
  PositionInfoLayout,
  PositionUtils,
  TickArrayLayout,
  ApiV3PoolInfoConcentratedItem,
  U64_IGNORE_RANGE
} from '@raydium-io/raydium-sdk-v2'
import { AccountInfo } from '@solana/web3.js'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import useSubscribeClmmInfo, { RpcPoolData } from './useSubscribeClmmInfo'
import useFetchMultipleAccountInfo from '@/hooks/info/useFetchMultipleAccountInfo'
import { getTickArrayAddress } from '@/hooks/pool/formatter'
import { getPoolName } from '@/features/Pools/util'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { MINUTE_MILLISECONDS } from '@/utils/date'

interface Props {
  shouldFetch?: boolean
  poolInfo?: ApiV3PoolInfoConcentratedItem
  position: ReturnType<typeof PositionInfoLayout.decode>
  initRpcPoolData?: RpcPoolData
  subscribe?: boolean
  tickLowerPrefetchData?: AccountInfo<Buffer> | null
  tickUpperPrefetchData?: AccountInfo<Buffer> | null
}

export default function useFetchClmmRewardInfo({
  poolInfo,
  position,
  initRpcPoolData,
  tickLowerPrefetchData,
  tickUpperPrefetchData,
  subscribe = true,
  shouldFetch = true
}: Props) {
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo?.mintA.address, poolInfo?.mintB.address, ...(poolInfo?.rewardDefaultInfos.map((r) => r.mint.address) || [])]
  })

  const [tokenFees, setTokenFees] = useState<{ tokenFeeAmountA?: BN; tokenFeeAmountB?: BN }>({})
  const [rewards, setRewards] = useState<BN[]>([])
  const [isEmptyReward, setIsEmptyReward] = useState(false)
  const [totalPendingYield, setTotalPendingYield] = useState<Decimal>(new Decimal(0))

  // use subscribe to reduce rpc call
  const subscribeRpcData = useSubscribeClmmInfo({ subscribe, poolInfo, throttle: MINUTE_MILLISECONDS })
  const rpcPoolData = subscribeRpcData?.poolInfo || initRpcPoolData?.poolInfo
  const data = useFetchMultipleAccountInfo({
    name: poolInfo ? `${getPoolName(poolInfo)} position tick` : 'clmm position tick',
    publicKeyList:
      shouldFetch && poolInfo
        ? [
            getTickArrayAddress({ pool: poolInfo, tickNumber: position.tickLower }),
            getTickArrayAddress({ pool: poolInfo, tickNumber: position.tickUpper })
          ]
        : [],
    refreshInterval: 60 * 1000 * 10
  })

  const [tickLowerData, tickUpperData] = [tickLowerPrefetchData || data.data?.[0], tickUpperPrefetchData || data.data?.[1]]

  useEffect(() => {
    if (!tickLowerData || !tickUpperData || !rpcPoolData || !poolInfo) return
    const tickArrayLower = TickArrayLayout.decode(tickLowerData.data)
    const tickArrayUpper = TickArrayLayout.decode(tickUpperData.data)
    const tickLowerState = tickArrayLower.ticks[TickUtils.getTickOffsetInArray(position.tickLower, rpcPoolData.tickSpacing)]
    const tickUpperState = tickArrayUpper.ticks[TickUtils.getTickOffsetInArray(position.tickUpper, rpcPoolData.tickSpacing)]
    const tokenFees = PositionUtils.GetPositionFeesV2(rpcPoolData, position, tickLowerState, tickUpperState)
    const rewards = PositionUtils.GetPositionRewardsV2(rpcPoolData, position, tickLowerState, tickUpperState)

    const BN_ZERO = new BN(0)
    const [tokenFeeAmountA, tokenFeeAmountB] = [
      tokenFees.tokenFeeAmountA.gte(BN_ZERO) && tokenFees.tokenFeeAmountA.lt(U64_IGNORE_RANGE) ? tokenFees.tokenFeeAmountA : BN_ZERO,
      tokenFees.tokenFeeAmountB.gte(BN_ZERO) && tokenFees.tokenFeeAmountB.lt(U64_IGNORE_RANGE) ? tokenFees.tokenFeeAmountB : BN_ZERO
    ]

    const rewardInfos = rewards.map((r) => (r.gte(BN_ZERO) && r.lt(U64_IGNORE_RANGE) ? r : BN_ZERO))

    setTokenFees({ tokenFeeAmountA, tokenFeeAmountB })
    setRewards(rewardInfos)

    const totalRewards = rewardInfos
      .filter((r) => r.gt(BN_ZERO))
      .map((r, idx) =>
        new Decimal(r.toString())
          .div(10 ** (poolInfo.rewardDefaultInfos[idx]?.mint.decimals || 0))
          .mul(tokenPrices[poolInfo.rewardDefaultInfos[idx]?.mint.address]?.value || 0)
          .toString()
      )
      .reduce((acc, cur) => acc.add(cur), new Decimal(0))

    setTotalPendingYield(
      new Decimal(tokenFeeAmountA.toString())
        .div(10 ** poolInfo.mintA.decimals)
        .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
        .add(
          new Decimal(tokenFeeAmountB.toString()).div(10 ** poolInfo.mintB.decimals).mul(tokenPrices[poolInfo.mintB.address]?.value || 0)
        )
        .add(totalRewards)
    )

    setIsEmptyReward(rewardInfos.filter((r) => r.gt(BN_ZERO)).length <= 0 && !tokenFeeAmountA.gt(BN_ZERO) && !tokenFeeAmountB.gt(BN_ZERO))
  }, [tickLowerData, tickUpperData, rpcPoolData, tokenPrices])

  return {
    isEmptyReward,
    ...tokenFees,
    rewards,
    totalPendingYield
  }
}
