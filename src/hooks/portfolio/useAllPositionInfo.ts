import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { FormatFarmInfoOutV6, ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'

import useFetchPoolById from '../pool/useFetchPoolById'

import { useTokenAccountStore } from '@/store'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchMultipleFarmInfo from '@/hooks/farm/useFetchMultipleFarmInfo'
import useFetchMultipleFarmBalance from '@/hooks/farm/useFetchMultipleFarmBalance'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { getTickArrayAddress } from '@/hooks/pool/formatter'
import useClmmPortfolioData, { ClmmPosition } from './clmm/useClmmPortfolioData'
import useFetchMultipleAccountInfo from '@/hooks/info/useFetchMultipleAccountInfo'
import { useFarmStore, useClmmStore, useAppStore } from '@/store'
import { useEvent } from '../useEvent'
import { debounce } from '@/utils/functionMethods'
import Decimal from 'decimal.js'
export interface UpdateClmmPendingYield {
  nftMint: string
  pendingYield: Decimal
  isEmpty: boolean
}

export type PositionWithUpdateFn = ClmmPosition & {
  updateClmmPendingYield: (data: UpdateClmmPendingYield) => void
  tickLowerRpcData?: AccountInfo<Buffer> | null
  tickUpperRpcData?: AccountInfo<Buffer> | null
}
export type ClmmDataWithUpdateFn = Map<string, PositionWithUpdateFn[]>

export type PositionTabValues = 'concentrated' | 'standard' | 'staked RAY'

export default function useAllPositionInfo({ shouldFetch = true }: { shouldFetch?: boolean }) {
  const harvestAllFarmAct = useFarmStore((s) => s.harvestAllAct)
  const harvestAllClmmAct = useClmmStore((s) => s.harvestAllAct)
  const owner = useAppStore((s) => s.publicKey)
  const fetchTokenAccountAct = useTokenAccountStore((s) => s.fetchTokenAccountAct)

  const [isSending, setIsSending] = useState(false)
  const [allClmmPending, setAllClmmPending] = useState(new Decimal(0))
  const clmmPendingYield = useRef<
    Map<
      string,
      {
        usd: Decimal
        isEmpty: boolean
      }
    >
  >(new Map())

  const { data: clmmPoolAssets, clmmBalanceInfo, isLoading: isClmmBalanceLoading } = useClmmPortfolioData({ type: '' })
  const {
    data: clmmData = [],
    dataMap: clmmDataMap,
    isLoading: isPoolLoading,
    mutate: mutatePoolInfo
  } = useFetchPoolById<ApiV3PoolInfoConcentratedItem>({
    idList: Array.from(clmmBalanceInfo.entries()).map((r) => r[0])
  })

  const clmmRecord: { [key: string]: ClmmPosition[] } = Array.from(clmmBalanceInfo.entries()).reduce(
    (acc, cur) => ({
      ...acc,
      [cur[0]]: cur[1]
    }),
    {}
  )

  const readyList = clmmData.length
    ? Array.from(clmmBalanceInfo.entries()).map(([poolId, positions]) => {
        return positions.map((position) => {
          const pool = clmmDataMap[poolId]
          if (!pool) return null
          return [
            getTickArrayAddress({ pool, tickNumber: position.tickLower }),
            getTickArrayAddress({ pool, tickNumber: position.tickUpper })
          ]
        })
      })
    : []

  const { dataWithId: clmmTickAddressData, mutate: mutateClmmTicks } = useFetchMultipleAccountInfo({
    name: 'get clmm position tick',
    publicKeyList: readyList.flat().flat() as PublicKey[],
    refreshInterval: 60 * 1000 * 10
  })

  // fetch farm position info
  const {
    farmBasedData,
    lpBasedData,
    mutate: mutateFarmPos
  } = useFarmPositions({
    shouldFetch
  })
  const {
    data: stakedFarmList,
    formattedDataMap: stakedFarmMap,
    isLoading: isFarmLoading,
    mutate: mutateFarmsInfo
  } = useFetchMultipleFarmInfo<FormatFarmInfoOutV6>({
    shouldFetch: farmBasedData.size > 0,
    idList: Array.from(farmBasedData.entries())
      .filter((data) => data[1].hasAmount)
      .map((r) => r[0])
  })

  const {
    allFarmBalances,
    isLoading: isFarmBalanceLoading,
    rpcInfoDataList: rpcFarmDataList,
    mutate: mutateFarmBalance
  } = useFetchMultipleFarmBalance({
    refreshInterval: 60 * 1000,
    farmInfoList: stakedFarmList.length
      ? Array.from(farmBasedData.values())
          .filter((f) => f.hasAmount && f.data.length > 0 && !!stakedFarmList.find((s) => f.data.find((d) => d.farmId === s.id)))
          .map((f) => {
            const data = stakedFarmList.find((s) => f.data.find((d) => d.farmId === s.id))!
            return {
              id: data.id,
              programId: data.programId,
              lpMint: data.lpMint
            }
          })
      : []
  })
  const { data: tokenPrices } = useTokenPrice({
    mintList: allFarmBalances.map((b) => stakedFarmMap.get(b?.id || '')?.rewardInfos.map((r) => r.mint.address)).flat()
  })

  let [allFarmPendingReward, hasFarmReward, allStakingPendingReward, hasStakingReward] = [new Decimal(0), false, new Decimal(0), false]
  allFarmBalances.forEach((b) => {
    const farm = stakedFarmMap.get(b?.id || '')
    const isStaking = farm?.tags.includes('Stake')
    const hasReward = b?.pendingRewards.some((a) => !new Decimal(a || 0).isZero())
    if (isStaking) hasStakingReward = hasReward
    else hasFarmReward = hasFarmReward || hasReward

    const pendingReward = b?.pendingRewards.reduce((acc, cur, idx) => {
      return farm?.rewardInfos[idx]
        ? acc.add(
            new Decimal(cur).mul(tokenPrices[farm.rewardInfos[idx].mint.address]?.value || 0) // reward in usd
          )
        : acc
    }, new Decimal(0))

    if (isStaking) allStakingPendingReward = allFarmPendingReward.add(pendingReward)
    else allFarmPendingReward = allFarmPendingReward.add(pendingReward)
  })

  const standardFarmList = stakedFarmList.filter((f) => !f.tags.includes('Stake'))
  const stakingFarmList = stakedFarmList.filter((f) => f.tags.includes('Stake'))

  const rewardState: Record<
    PositionTabValues,
    {
      isReady: boolean
      pendingReward: string
    }
  > = {
    concentrated: {
      isReady: allClmmPending.gt(0) || Array.from(clmmPendingYield.current.values()).some((d) => !d.isEmpty),
      pendingReward: allClmmPending.toFixed(10)
    },
    'staked RAY': {
      isReady: hasStakingReward,
      pendingReward: allStakingPendingReward.toFixed(10)
    },
    standard: {
      isReady: hasFarmReward,
      pendingReward: allFarmPendingReward.toFixed(10)
    }
  }

  const isLoading = isFarmLoading || isClmmBalanceLoading || isPoolLoading

  const handleRefresh = useEvent(() => {
    fetchTokenAccountAct({})
    mutatePoolInfo()
    mutateClmmTicks()
    mutateFarmPos()
    mutateFarmsInfo()
    mutateFarmBalance()
    useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() })
  })

  const handleHarvest = useEvent(async ({ tab, zeroClmmPos }: { tab: PositionTabValues; zeroClmmPos?: Set<string> }) => {
    setIsSending(true)

    const handleRefreshFarm = () => {
      mutateFarmPos()
      mutateFarmsInfo()
      mutateFarmBalance()
    }

    const handleRefreshClmm = () => {
      mutatePoolInfo()
      mutateClmmTicks()
      useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() })
    }

    if (tab === 'standard' && rewardState.standard.isReady && standardFarmList.length) {
      await harvestAllFarmAct({
        farmInfoList: standardFarmList.filter(
          (farm) => !!allFarmBalances.find((f) => f.id === farm.id)?.pendingRewards.some((r) => !new Decimal(r || 0).isZero())
        ),
        onConfirmed: handleRefreshFarm
      })
    }

    if (tab === 'staked RAY' && rewardState['staked RAY'].isReady && stakingFarmList.length) {
      await harvestAllFarmAct({
        farmInfoList: stakingFarmList.filter(
          (farm) => !!allFarmBalances.find((f) => f.id === farm.id)?.pendingRewards.some((r) => !new Decimal(r || 0).isZero())
        ),
        onConfirmed: handleRefreshFarm
      })
    }

    if (tab === 'concentrated' && rewardState.concentrated.isReady) {
      const noneZeroPos = { ...clmmRecord }
      Object.keys(noneZeroPos).forEach((key) => {
        const readyList = noneZeroPos[key].filter((p) => (zeroClmmPos ? !zeroClmmPos.has(p.nftMint.toBase58()) : true))
        if (!readyList.length) {
          delete noneZeroPos[key]
          return
        }
        noneZeroPos[key] = readyList
      })
      await harvestAllClmmAct({
        allPoolInfo: clmmData.reduce(
          (acc, cur) => ({
            ...acc,
            [cur.id]: cur
          }),
          {}
        ),
        allPositions: noneZeroPos,
        execute: true,
        onConfirmed: handleRefreshClmm
      })
    }
    setIsSending(false)
  })

  const setTotalClmmPending = useCallback(
    debounce(
      () => setAllClmmPending(Array.from(clmmPendingYield.current.values()).reduce((acc, cur) => acc.add(cur.usd), new Decimal(0))),
      400
    ),
    []
  )

  const updateClmmPendingYield = useCallback(
    ({ nftMint, pendingYield, isEmpty }: UpdateClmmPendingYield) => {
      clmmPendingYield.current.set(nftMint, { usd: pendingYield, isEmpty })
      setTotalClmmPending()
    },
    [setTotalClmmPending]
  )

  const balanceInfoWithUpdate = useMemo(
    () =>
      new Map(
        Array.from(clmmBalanceInfo.entries()).map(([key, balanceInfo]) => {
          const pool = clmmDataMap[key]
          return [
            key,
            balanceInfo.map((b) => ({
              ...b,
              tickLowerRpcData: pool ? clmmTickAddressData[getTickArrayAddress({ pool, tickNumber: b.tickLower }).toBase58()] : undefined,
              tickUpperRpcData: pool ? clmmTickAddressData[getTickArrayAddress({ pool, tickNumber: b.tickUpper }).toBase58()] : undefined,
              updateClmmPendingYield
            }))
          ]
        })
      ),
    [clmmBalanceInfo, clmmTickAddressData]
  )

  useEffect(
    () => () => {
      setAllClmmPending(new Decimal(0))
      clmmPendingYield.current.clear()
    },
    [owner?.toBase58()]
  )

  return {
    isLoading,
    isSending,
    rewardState,

    isFarmLoading: isFarmLoading || isFarmBalanceLoading,
    stakedFarmList,
    stakedFarmMap,
    allFarmBalances,
    rpcFarmDataList,
    farmLpBasedData: lpBasedData,

    isClmmLoading: isClmmBalanceLoading || isPoolLoading,
    clmmRecord,
    clmmPoolAssets,
    clmmBalanceInfo: balanceInfoWithUpdate,
    clmmPoolInfo: clmmData.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.id]: cur
      }),
      {}
    ),
    clmmTickAddressData,
    updateClmmPendingYield,

    totalPendingYield: allClmmPending.add(allFarmPendingReward),
    allClmmPending,
    allFarmPendingReward,

    handleHarvest,
    handleRefresh
  }
}
