import { useEffect, useMemo } from 'react'
import {
  getPdaPersonalPositionAddress,
  getPdaLockClPositionIdV2,
  PositionInfoLayout,
  TickUtils,
  ApiV3PoolInfoConcentratedItem,
  PositionUtils,
  LockClPositionLayoutV2
} from '@raydium-io/raydium-sdk-v2'
import shallow from 'zustand/shallow'
import { PublicKey, Connection } from '@solana/web3.js'
import Decimal from 'decimal.js'
import BN from 'bn.js'
import useSWR from 'swr'

import useRefreshEpochInfo from '@/hooks/app/useRefreshEpochInfo'
import { useAppStore, useTokenAccountStore, initTokenAccountSate, useTokenStore } from '@/store'
import { useEvent } from '@/hooks/useEvent'
import ToPublicKey from '@/utils/publicKey'
import logMessage from '@/utils/log'
import { getPdaIdCache } from '@/utils/pool/pdaCache'

export type ClmmPosition = ReturnType<typeof PositionInfoLayout.decode> & { key?: string; slot: number }
export type ClmmDataMap = Map<string, ClmmPosition[]>

let lastRefreshTag = initTokenAccountSate.refreshClmmPositionTag

const fetcher = async ([connection, publicKeyList]: [Connection, string[]]) => {
  logMessage('rpc: get clmm position balance info')
  const commitment = useAppStore.getState().commitment

  const chunkSize = 100
  const keyGroup = []
  for (let i = 0; i < publicKeyList.length; i += chunkSize) {
    keyGroup.push(publicKeyList.slice(i, i + chunkSize))
  }

  const res = await Promise.all(
    keyGroup.map((list) =>
      connection.getMultipleAccountsInfoAndContext(
        list.map((publicKey) => ToPublicKey(publicKey)),
        commitment
      )
    )
  )
  return res.flat()
}

export interface ClmmLockInfo {
  [poolId: string]: { [nftMint: string]: ReturnType<typeof LockClPositionLayoutV2.decode> }
}

const lockFetcher = async ([connection, publicKeyList]: [Connection, string[]]) => {
  logMessage('rpc: get clmm lock position info')
  const commitment = useAppStore.getState().commitment

  const chunkSize = 100
  const keyGroup = []
  for (let i = 0; i < publicKeyList.length; i += chunkSize) {
    keyGroup.push(publicKeyList.slice(i, i + chunkSize))
  }

  const res = await Promise.all(
    keyGroup.map((list) =>
      connection.getMultipleAccountsInfoAndContext(
        list.map((publicKey) => ToPublicKey(publicKey)),
        commitment
      )
    )
  )

  return res.flat()
}

export default function useClmmBalance({
  programId,
  clmmLockProgramId,
  refreshInterval = 1000 * 60 * 5
}: {
  programId?: string | PublicKey
  clmmLockProgramId?: string | PublicKey
  refreshInterval?: number
}) {
  const [connection, CLMM_PROGRAM_ID, CLMM_LOCK_PROGRAM_ID, tokenAccLoaded, owner] = useAppStore(
    (s) => [s.connection, s.programIdConfig.CLMM_PROGRAM_ID, s.programIdConfig.CLMM_LOCK_PROGRAM_ID, s.tokenAccLoaded, s.publicKey],
    shallow
  )
  const clmmProgramId = programId || CLMM_PROGRAM_ID
  const lockProgramId = clmmLockProgramId || CLMM_LOCK_PROGRAM_ID
  const [tokenAccountRawInfos, refreshClmmPositionTag] = useTokenAccountStore(
    (s) => [s.tokenAccountRawInfos, s.refreshClmmPositionTag],
    shallow
  )
  useRefreshEpochInfo()

  const balanceMints = useMemo(() => {
    const tokenMap = useTokenStore.getState().tokenMap
    return tokenAccountRawInfos.filter((acc) => acc.accountInfo.amount.eq(new BN(1)) && !tokenMap.has(acc.accountInfo.mint.toBase58()))
  }, [tokenAccountRawInfos])

  const allLockMints = useMemo(
    () =>
      balanceMints.map((acc) =>
        getPdaIdCache({
          program: lockProgramId,
          mint: acc.accountInfo.mint,
          identifier: '-clLock',
          pdaFunc: getPdaLockClPositionIdV2
        })
      ),
    [balanceMints]
  )
  const { data: lockData, mutate: mutateLockInfo } = useSWR(tokenAccLoaded && connection ? [connection, allLockMints] : null, lockFetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const lockPositionInfo = useMemo(() => {
    if (!lockData) return {}
    const allData = lockData.map((d) => d.value).flat()
    const lockPosition: { [nftAccount: string]: ReturnType<typeof LockClPositionLayoutV2.decode> } = {}
    allData.forEach((lockRes) => {
      if (!lockRes) return
      const lockInfo = LockClPositionLayoutV2.decode(lockRes.data)
      lockPosition[lockInfo.positionId.toBase58()] = lockInfo
    })
    return lockPosition
  }, [lockData, allLockMints])

  const allPositionKey = useMemo(
    () =>
      balanceMints
        .map((acc) =>
          getPdaIdCache({
            program: clmmProgramId,
            mint: acc.accountInfo.mint,
            identifier: '-clPos',
            pdaFunc: getPdaPersonalPositionAddress
          })
        )
        .concat(Object.keys(lockPositionInfo)),
    [balanceMints, lockPositionInfo]
  )

  const needFetch = tokenAccLoaded && clmmProgramId && connection && tokenAccountRawInfos.length > 0 && allPositionKey.length > 0
  const {
    data: chunkData,
    isLoading,
    isValidating,
    mutate,
    ...swrProps
  } = useSWR(needFetch ? [connection!, allPositionKey] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval,
    keepPreviousData: !!needFetch && !!owner
  })

  const data = useMemo(() => chunkData?.filter(Boolean) || [], [chunkData])

  const [balanceData, lockInfo] = useMemo(() => {
    const allData = data.map((d) => d.value).flat()
    const positionMap: ClmmDataMap = new Map()
    const lockInfo: ClmmLockInfo = {}
    allData.forEach((positionRes, idx) => {
      if (!positionRes) return
      const position = PositionInfoLayout.decode(positionRes.data)
      const poolId = position.poolId.toBase58()
      const lockData = lockPositionInfo[allPositionKey[idx]]
      if (lockData) {
        lockInfo[poolId] = {
          ...(lockInfo[poolId] || {}),
          [position.nftMint.toBase58()]: lockPositionInfo[allPositionKey[idx]]
        }
      }
      if (!positionMap.get(poolId))
        positionMap.set(poolId, [
          {
            ...position,
            key: allPositionKey[idx],
            slot: data[0]?.context.slot ?? 0
          }
        ])
      else
        positionMap.set(poolId, [
          ...Array.from(positionMap.get(poolId)!),
          {
            ...position,
            key: allPositionKey[idx],
            slot: data[0]?.context.slot ?? 0
          }
        ])
    })
    return [positionMap, lockInfo]
  }, [data, allPositionKey, lockPositionInfo])

  useEffect(() => {
    if (lastRefreshTag === refreshClmmPositionTag) return
    lastRefreshTag = refreshClmmPositionTag
    mutate()
    mutateLockInfo()
  }, [refreshClmmPositionTag, mutate, mutateLockInfo])

  useEffect(() => {
    localStorage.removeItem('_r_nft_b_')
  }, [])

  const reFetchBalance = useEvent(() => {
    mutate()
    mutateLockInfo()
  })

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
      new Decimal(amountSlippageA.amount.toString()).sub(amountSlippageA.fee?.toString() ?? 0).div(10 ** poolInfo.mintA.decimals),
      new Decimal(amountSlippageB.amount.toString()).sub(amountSlippageB.fee?.toString() ?? 0).div(10 ** poolInfo.mintB.decimals)
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

  return {
    clmmLockInfo: lockInfo || {},
    clmmBalanceInfo: balanceData,
    reFetchBalance,
    getPriceAndAmount,
    mutateLockInfo,
    isLoading,
    isValidating,
    slot: data?.[0]?.context.slot ?? 0,
    ...swrProps
  }
}
