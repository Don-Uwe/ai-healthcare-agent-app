import { useEffect, useMemo } from 'react'
import { getCpLockPda, CpmmLockInfo } from '@raydium-io/raydium-sdk-v2'
import shallow from 'zustand/shallow'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import useSWR from 'swr'

import useRefreshEpochInfo from '@/hooks/app/useRefreshEpochInfo'
import { useAppStore, useTokenAccountStore, initTokenAccountSate, useTokenStore } from '@/store'
import { useEvent } from '@/hooks/useEvent'
import axios from 'axios'

export type CpmmLockData = CpmmLockInfo & { nftMint: string }
// key: lp mint
export type CpmmLockDataMap = Map<string, CpmmLockData[]>

export const LOCK_LIQUIDITY_SEED = Buffer.from('locked_liquidity', 'utf8')

let lastRefreshTag = initTokenAccountSate.refreshCpmmPositionTag

const fetcher = async ([host, publicKeyList]: [string, string[]]) => {
  const res = await Promise.all(
    publicKeyList.map(async (key) => {
      try {
        const r = await axios.get(host + `?id=${key}`)
        return r.data as CpmmLockInfo
      } catch {
        return undefined
      }
    })
  )
  return res
}

export default function useLockCpmmBalance({ refreshInterval = 1000 * 60 * 5 }: { refreshInterval?: number }) {
  const [connection, LOCK_CPMM_PROGRAM, tokenAccLoaded, owner, cpmmLockUrl] = useAppStore(
    (s) => [s.connection, s.programIdConfig.LOCK_CPMM_PROGRAM, s.tokenAccLoaded, s.publicKey, s.urlConfigs.CPMM_LOCK],
    shallow
  )
  const [tokenAccountRawInfos, refreshCpmmPositionTag] = useTokenAccountStore(
    (s) => [s.tokenAccountRawInfos, s.refreshCpmmPositionTag],
    shallow
  )
  useRefreshEpochInfo()

  const balanceMints = useMemo(
    () =>
      tokenAccountRawInfos.filter(
        (acc) => acc.accountInfo.amount.eq(new BN(1)) && !useTokenStore.getState().tokenMap.has(acc.accountInfo.mint.toBase58())
      ),
    [tokenAccountRawInfos]
  )

  const allPossibleLockMints = useMemo(
    () => balanceMints.map((acc) => getCpLockPda(new PublicKey(LOCK_CPMM_PROGRAM), acc.accountInfo.mint).publicKey.toBase58()),
    [balanceMints]
  )

  const needFetch = tokenAccLoaded && LOCK_CPMM_PROGRAM && connection && tokenAccountRawInfos.length > 0 && allPossibleLockMints.length > 0
  const { data, isLoading, isValidating, mutate, ...swrProps } = useSWR(needFetch ? [cpmmLockUrl, allPossibleLockMints] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval,
    keepPreviousData: !!needFetch && !!owner
  })

  const balanceData = useMemo(() => {
    const positionMap: CpmmLockDataMap = new Map()
    // const filteredData = (data?.filter(Boolean) || []) as CpmmLockInfo[]
    // if (!filteredData.length) return positionMap

    ;(data?.filter(Boolean) || []).forEach((positionRes, idx) => {
      if (!positionRes) return
      if (!positionMap.get(positionRes.poolInfo.lpMint.address))
        positionMap.set(positionRes.poolInfo.lpMint.address, [{ ...positionRes, nftMint: balanceMints[idx].accountInfo.mint.toBase58() }])
      else
        positionMap.set(positionRes.poolInfo.lpMint.address, [
          ...Array.from(positionMap.get(positionRes.poolInfo.lpMint.address)!),
          { ...positionRes, nftMint: balanceMints[idx].accountInfo.mint.toBase58() }
        ])
    })
    return positionMap
  }, [data, allPossibleLockMints, balanceMints])

  useEffect(() => {
    if (lastRefreshTag === refreshCpmmPositionTag) return
    lastRefreshTag = refreshCpmmPositionTag
    mutate()
  }, [refreshCpmmPositionTag, mutate])

  const reFetchBalance = useEvent(() => {
    mutate()
  })

  return {
    cpmmLockBalanceInfo: balanceData,
    reFetchBalance,
    isLoading,
    isValidating,
    ...swrProps
  }
}
