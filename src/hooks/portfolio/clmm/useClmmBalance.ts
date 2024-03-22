import { useEffect, useMemo, useState } from 'react'
import {
  getPdaPersonalPositionAddress,
  PositionInfoLayout,
  TickUtils,
  ApiV3PoolInfoConcentratedItem,
  PositionUtils
} from '@raydium-io/raydium-sdk-v2'
import shallow from 'zustand/shallow'
import { PublicKey, Connection } from '@solana/web3.js'
import Decimal from 'decimal.js'
import BN from 'bn.js'
import useSWR from 'swr'

import useRefreshEpochInfo from '@/hooks/app/useRefreshEpochInfo'
import { useAppStore, useTokenAccountStore, initTokenAccountSate } from '@/store'
import { useEvent } from '@/hooks/useEvent'
import ToPublicKey from '@/utils/publicKey'

export type ClmmPosition = ReturnType<typeof PositionInfoLayout.decode>
export type ClmmDataMap = Map<string, ClmmPosition[]>

let lastRefreshTag = initTokenAccountSate.refreshClmmPositionTag

const fetcher = ([connection, publicKeyList]: [Connection, string[]]) => {
  console.log('rpc: get clmm position balance info')
  return connection.getMultipleAccountsInfo(
    publicKeyList.map((publicKey) => ToPublicKey(publicKey)),
    'confirmed'
  )
}

export default function useClmmBalance({
  programId,
  refreshInterval = 1000 * 60 * 5
}: {
  programId?: string | PublicKey
  refreshInterval?: number
}) {
  const [connection, CLMM_PROGRAM_ID, tokenAccLoaded, owner] = useAppStore(
    (s) => [s.connection, s.programIdConfig.CLMM_PROGRAM_ID, s.tokenAccLoaded, s.publicKey],
    shallow
  )
  const clmmProgramId = programId || CLMM_PROGRAM_ID
  const [tokenAccountRawInfos, refreshClmmPositionTag] = useTokenAccountStore(
    (s) => [s.tokenAccountRawInfos, s.refreshClmmPositionTag],
    shallow
  )
  useRefreshEpochInfo()

  const [balanceData, setBalanceData] = useState<ClmmDataMap>(new Map())

  const balanceMints = useMemo(() => tokenAccountRawInfos.filter((acc) => acc.accountInfo.amount.eq(new BN(1))), [tokenAccountRawInfos])
  const getPriceAndAmount = useEvent(({ poolInfo, position }: { poolInfo: ApiV3PoolInfoConcentratedItem; position: ClmmPosition }) => {
    const priceLower = TickUtils.getTickPrice({
      poolInfo,
      tick: position.tickLower,
      baseIn: true
    })
    const priceUpper = TickUtils.getTickPrice({
      poolInfo,
      tick: position.tickUpper,
      baseIn: true
    })

    const { amountA, amountB, amountSlippageA, amountSlippageB } = PositionUtils.getAmountsFromLiquidity({
      poolInfo,
      ownerPosition: position,
      liquidity: position.liquidity,
      slippage: 0,
      add: false,
      epochInfo: useAppStore.getState().epochInfo || {
        epoch: 0,
        slotIndex: 0,
        slotsInEpoch: 0,
        absoluteSlot: 0
      }
    })
    const [_amountA, _amountB] = [
      new Decimal(amountA.amount.toString()).div(10 ** poolInfo.mintA.decimals),
      new Decimal(amountB.amount.toString()).div(10 ** poolInfo.mintB.decimals)
    ]
    const [_amountSlippageA, _amountSlippageB] = [
      new Decimal(amountSlippageA.amount.toString()).div(10 ** poolInfo.mintA.decimals),
      new Decimal(amountSlippageB.amount.toString()).div(10 ** poolInfo.mintB.decimals)
    ]

    return {
      priceLower,
      priceUpper,
      amountA: _amountA,
      amountB: _amountB,
      amountSlippageA: _amountSlippageA,
      amountSlippageB: _amountSlippageB
    }
  })

  const allPositionKey = balanceMints.map((acc) =>
    getPdaPersonalPositionAddress(new PublicKey(clmmProgramId), acc.accountInfo.mint).publicKey.toBase58()
  )

  const needFetch = tokenAccLoaded && clmmProgramId && connection && tokenAccountRawInfos.length > 0 && allPositionKey.length > 0
  const { data, isLoading, isValidating, mutate, ...swrProps } = useSWR(needFetch ? [connection!, allPositionKey] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval,
    keepPreviousData: !!needFetch && !!owner
  })

  useEffect(() => {
    const positionMap: ClmmDataMap = new Map()
    if (isLoading || isValidating) return
    ;(data || []).forEach((positionRes) => {
      if (!positionRes) return
      const position = PositionInfoLayout.decode(positionRes.data)
      const poolId = position.poolId.toBase58()
      if (!positionMap.get(poolId)) positionMap.set(poolId, [position])
      else positionMap.set(poolId, [...Array.from(positionMap.get(poolId)!), position])
    })
    setBalanceData(positionMap)
  }, [data, isLoading, isValidating])

  useEffect(() => {
    if (lastRefreshTag === refreshClmmPositionTag) return
    lastRefreshTag = refreshClmmPositionTag
    mutate()
  }, [refreshClmmPositionTag, mutate])

  useEffect(
    () => () => {
      setBalanceData(new Map())
    },
    [owner?.toBase58()]
  )

  return {
    clmmBalanceInfo: balanceData,
    reFetchBalance: mutate,
    getPriceAndAmount,
    isLoading,
    isValidating,
    ...swrProps
  }
}
