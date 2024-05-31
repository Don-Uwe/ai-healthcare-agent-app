import { useState, useEffect, useMemo } from 'react'
import {
  TickUtils,
  PositionInfoLayout,
  PositionUtils,
  TickArrayLayout,
  ApiV3PoolInfoConcentratedItem,
  U64_IGNORE_RANGE,
  ApiV3Token
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
import { addAccChangeCbk, removeAccChangeCbk } from '@/hooks/app/useTokenAccountInfo'

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

  const [tickLowerData, tickUpperData] = [tickLowerPrefetchData || data?.data?.value[0], tickUpperPrefetchData || data?.data?.value[1]]

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
      .map((r, idx) => {
        const rewardMint = poolInfo.rewardDefaultInfos.find(
          (r) => r.mint.address === rpcPoolData.rewardInfos[idx].tokenMint.toBase58()
        )?.mint
        if (!rewardMint) return '0'
        return new Decimal(r.toString())
          .div(10 ** (rewardMint.decimals || 0))
          .mul(tokenPrices[rewardMint.address]?.value || 0)
          .toString()
      })
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

  useEffect(() => {
    addAccChangeCbk(data.mutate)
    return () => removeAccChangeCbk(data.mutate)
  }, [data.mutate])

  const allRewardInfos = useMemo(() => {
    if (!poolInfo || !rpcPoolData) return []
    const rewardToken = rewards
      .map((r, idx) => {
        const rewardMint = poolInfo.rewardDefaultInfos.find(
          (r) => r.mint.address === rpcPoolData.rewardInfos[idx].tokenMint.toBase58()
        )?.mint
        // const rewardMint = poolInfo.rewardDefaultInfos[idx]?.mint
        const amount = new Decimal(r?.toString() || 0).div(10 ** (rewardMint?.decimals ?? 0))
        return {
          mint: rewardMint,
          amount: rewardMint ? amount.toFixed(rewardMint?.decimals ?? 6) : '0',
          amountUSD: rewardMint ? amount.mul(tokenPrices[rewardMint?.address || '']?.value ?? 0).toFixed(4) : '0'
        }
      })
      .filter((r) => !!r.mint) as {
      mint: ApiV3Token
      amount: string
      amountUSD: string
    }[]

    const [feeAmountA, feeAmountB] = [
      new Decimal(tokenFees.tokenFeeAmountA?.toString() || 0).div(10 ** poolInfo.mintA.decimals),
      new Decimal(tokenFees.tokenFeeAmountB?.toString() || 0).div(10 ** poolInfo.mintB.decimals)
    ]

    const feeIndexA = rewardToken.findIndex((r) => r.mint.address === poolInfo.mintA.address)
    const usdValueA = feeAmountA.mul(tokenPrices[poolInfo.mintA.address]?.value ?? 0).toFixed(4)
    if (feeIndexA > -1) {
      rewardToken[feeIndexA].amount = new Decimal(rewardToken[feeIndexA].amount)
        .add(feeAmountA.toFixed(poolInfo.mintA.decimals))
        .toFixed(poolInfo.mintA.decimals)
      rewardToken[feeIndexA].amountUSD = new Decimal(rewardToken[feeIndexA].amountUSD).add(usdValueA).toFixed(4)
    } else {
      rewardToken.push({
        mint: poolInfo.mintA,
        amount: feeAmountA.toFixed(poolInfo.mintA.decimals),
        amountUSD: usdValueA
      })
    }

    const feeIndexB = rewardToken.findIndex((r) => r.mint.address === poolInfo.mintB.address)
    const usdValueB = feeAmountB.mul(tokenPrices[poolInfo.mintB.address]?.value ?? 0).toFixed(4)
    if (feeIndexB > -1) {
      rewardToken[feeIndexB].amount = new Decimal(rewardToken[feeIndexB].amount)
        .add(feeAmountB.toFixed(poolInfo.mintB.decimals))
        .toFixed(poolInfo.mintB.decimals)
      rewardToken[feeIndexB].amountUSD = new Decimal(rewardToken[feeIndexB].amountUSD).add(usdValueB).toFixed(4)
    } else {
      rewardToken.push({
        mint: poolInfo.mintB,
        amount: feeAmountB.toFixed(poolInfo.mintB.decimals),
        amountUSD: usdValueB
      })
    }
    return rewardToken
  }, [tokenFees, rewards, tokenPrices, poolInfo?.id])

  return {
    isEmptyReward,
    ...tokenFees,
    rewards,
    totalPendingYield,
    allRewardInfos
  }
}
