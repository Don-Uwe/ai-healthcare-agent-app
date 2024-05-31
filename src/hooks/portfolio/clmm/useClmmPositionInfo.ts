import { useEffect, useMemo } from 'react'
import { PositionInfoLayout } from '@raydium-io/raydium-sdk-v2'
import shallow from 'zustand/shallow'
import { PublicKey, Connection } from '@solana/web3.js'
import useSWR from 'swr'

import { useAppStore, useTokenAccountStore, initTokenAccountSate } from '@/store'
import ToPublicKey from '@/utils/publicKey'
import logMessage from '@/utils/log'

export type ClmmPosition = ReturnType<typeof PositionInfoLayout.decode>
export type ClmmDataMap = Map<string, ClmmPosition[]>

let lastRefreshTag = initTokenAccountSate.refreshClmmPositionTag

const fetcher = ([connection, publicKey]: [Connection, string]) => {
  logMessage('rpc: get clmm position nft info')
  return connection.getAccountInfo(ToPublicKey(publicKey), useAppStore.getState().commitment)
}

export default function useClmmPositionInfo({
  nftMint,
  shouldFetch,
  refreshInterval = 1000 * 60 * 5,
  refreshTag
}: {
  nftMint?: string | PublicKey
  shouldFetch?: boolean
  refreshInterval?: number
  refreshTag?: number
}) {
  const [connection, tokenAccLoaded, owner] = useAppStore((s) => [s.connection, s.tokenAccLoaded, s.publicKey], shallow)
  const [refreshClmmPositionTag] = useTokenAccountStore((s) => [s.refreshClmmPositionTag], shallow)

  const needFetch = shouldFetch && tokenAccLoaded && nftMint && connection
  const { data, isLoading, isValidating, mutate, ...swrProps } = useSWR(
    needFetch ? [connection!, nftMint.toString(), refreshTag] : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval,
      keepPreviousData: !!needFetch && !!owner
    }
  )

  const position = useMemo(() => {
    if (!data) return undefined
    const position = PositionInfoLayout.decode(data.data)
    return position
  }, [data])

  useEffect(() => {
    if (lastRefreshTag === refreshClmmPositionTag) return
    lastRefreshTag = refreshClmmPositionTag
    mutate()
  }, [refreshClmmPositionTag, mutate])

  return {
    data: position,
    reFetchBalance: mutate,
    isLoading,
    isValidating,
    ...swrProps
  }
}
