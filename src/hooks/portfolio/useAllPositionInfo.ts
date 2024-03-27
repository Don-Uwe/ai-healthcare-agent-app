import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { MultiTxBuildData, MultiTxV0BuildData, FormatFarmInfoOutV6, ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'

import useFetchPoolById from '../pool/useFetchPoolById'

import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchMultipleFarmInfo from '@/hooks/farm/useFetchMultipleFarmInfo'
import useFetchMultipleFarmBalance from '@/hooks/farm/useFetchMultipleFarmBalance'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject } from '@/hooks/toast/useTxStatus'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { getTickArrayAddress } from '@/hooks/pool/formatter'
import useClmmPortfolioData, { ClmmPosition } from './clmm/useClmmPortfolioData'
import useFetchMultipleAccountInfo from '@/hooks/info/useFetchMultipleAccountInfo'
import { useFarmStore, useClmmStore, useTokenAccountStore, useAppStore } from '@/store'
import { getTxMeta as getFarmTxMeta } from '@/store/configs/farm'
import { getTxMeta as getClmmTxMeta } from '@/store/configs/clmm'
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

export default function useAllPositionInfo({ shouldFetch = true }: { shouldFetch?: boolean }) {
  const harvestAllFarmAct = useFarmStore((s) => s.harvestAllAct)
  const harvestAllClmmAct = useClmmStore((s) => s.harvestAllAct)
  const owner = useAppStore((s) => s.publicKey)

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
    isLoading: isPoolLoading
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

  const { dataWithId: clmmTickAddressData } = useFetchMultipleAccountInfo({
    name: 'get clmm position tick',
    publicKeyList: readyList.flat().flat() as PublicKey[],
    refreshInterval: 60 * 1000 * 10
  })

  // fetch farm position info
  const { farmBasedData, lpBasedData } = useFarmPositions({
    shouldFetch
  })
  const {
    data: stakedFarmList,
    formattedDataMap: stakedFarmMap,
    isLoading: isFarmLoading
  } = useFetchMultipleFarmInfo<FormatFarmInfoOutV6>({
    shouldFetch: farmBasedData.size > 0,
    idList: Array.from(farmBasedData.entries())
      .filter((data) => data[1].hasAmount)
      .map((r) => r[0])
  })

  const {
    allFarmBalances,
    isLoading: isFarmBalanceLoading,
    rpcInfoDataList: rpcFarmDataList
  } = useFetchMultipleFarmBalance({
    refreshInterval: 60 * 1000,
    farmInfoList: stakedFarmList.length
      ? Array.from(farmBasedData.values())
          .filter((f) => f.hasAmount && f.data.length > 0 && !!stakedFarmList.find((s) => s.id === f.data[0].farmId))
          .map((f) => ({
            id: f.data[0].farmId,
            programId: f.data[0].programId,
            lpMint: stakedFarmList.find((s) => s.id === f.data[0].farmId)!.lpMint
          }))
      : []
  })
  const { data: tokenPrices } = useTokenPrice({
    mintList: allFarmBalances.map((b) => stakedFarmMap.get(b?.id || '')?.rewardInfos.map((r) => r.mint.address)).flat()
  })

  let allFarmPendingReward = new Decimal(0)
  allFarmBalances.forEach((b) => {
    const farm = stakedFarmMap.get(b?.id || '')
    const pendingReward = b?.pendingRewards.reduce((acc, cur, idx) => {
      return farm?.rewardInfos[idx]
        ? acc.add(
            new Decimal(cur).mul(tokenPrices[farm.rewardInfos[idx].mint.address]?.value || 0) // reward in usd
          )
        : acc
    }, new Decimal(0))
    allFarmPendingReward = allFarmPendingReward.add(pendingReward)
  })

  const isReady =
    allFarmPendingReward.gt(0) || allClmmPending.gt(0) || Array.from(clmmPendingYield.current.values()).some((d) => !d.isEmpty)
  const isLoading = isFarmLoading || isClmmBalanceLoading || isPoolLoading

  const finallyFn = (txId?: string, meta?: Record<string, unknown>) => {
    if (txId) txStatusSubject.next({ txId, ...(meta || {}) })
    setIsSending(false)
    useTokenAccountStore.setState({
      refreshClmmPositionTag: Date.now()
    })
  }

  const handleHarvest = useEvent(async (zeroClmmPos?: Set<string>) => {
    if (!isReady) return

    setIsSending(true)

    let buildData: MultiTxBuildData | MultiTxV0BuildData | undefined

    if (allFarmPendingReward.gt(0) && stakedFarmList.length) {
      const farmBuildData = await harvestAllFarmAct({
        farmInfoList: stakedFarmList.filter(
          (farm) => !!allFarmBalances.find((f) => f.id === farm.id)?.pendingRewards.some((r) => !new Decimal(r || 0).isZero())
        ),
        execute: false
      })

      if (!clmmBalanceInfo.size && farmBuildData.buildData) {
        try {
          const txIds = await farmBuildData.buildData.execute()
          finallyFn(txIds[0], getFarmTxMeta({ action: 'harvest', values: {} }))
        } catch (e: any) {
          toastSubject.next({ txError: e })
        }
        setIsSending(false)
        return
      }
      buildData = farmBuildData.buildData
    }

    if (clmmBalanceInfo.size) {
      const noneZeroPos = { ...clmmRecord }
      Object.keys(noneZeroPos).forEach((key) => {
        const readyList = noneZeroPos[key].filter((p) => (zeroClmmPos ? !zeroClmmPos.has(p.nftMint.toBase58()) : true))
        if (!readyList.length) {
          delete noneZeroPos[key]
          return
        }
        noneZeroPos[key] = readyList
      })
      const clmmBuildData = await harvestAllClmmAct({
        allPoolInfo: clmmData.reduce(
          (acc, cur) => ({
            ...acc,
            [cur.id]: cur
          }),
          {}
        ),
        allPositions: noneZeroPos,
        execute: !buildData
      })
      if (clmmBuildData.buildData) {
        if (buildData) {
          buildData.builder.addInstruction(clmmBuildData.buildData.builder.AllTxData)
          const { execute } = await buildData.builder.sizeCheckBuild()
          try {
            const txIds = await execute({ sequentially: true })
            finallyFn(
              txIds[txIds.length - 1],
              getClmmTxMeta({
                action: 'harvest',
                values: { symbol: 'Clmm farms' }
              })
            )
          } catch (e: any) {
            toastSubject.next({ txError: e })
          }
          setIsSending(false)
          return
        }
        setIsSending(false)
      }
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
    isReady,

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

    handleHarvest
  }
}
