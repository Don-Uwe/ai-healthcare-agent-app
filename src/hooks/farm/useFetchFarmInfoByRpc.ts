import { useMemo } from 'react'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import { splAccountLayout } from '@raydium-io/raydium-sdk-v2'
import { Connection, PublicKey } from '@solana/web3.js'

import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useAppStore } from '@/store'
import ToPublicKey from '@/utils/publicKey'
import { FARM_TYPE, updatePoolInfo, farmRpcInfoCache } from './farmUtils'
import { useEvent } from '../useEvent'
import logMessage from '@/utils/log'
const fetcher = ([connection, publicKey]: [Connection, string | PublicKey]) => {
  logMessage('rpc: get farm info')
  return connection.getAccountInfo(ToPublicKey(publicKey), { commitment: useAppStore.getState().commitment })
}

export default function useFetchFarmInfoByRpc(props: {
  shouldFetch?: boolean
  farmInfo?: { programId: string; id: string }
  refreshInterval?: number
  readFromCache?: boolean
}) {
  const { shouldFetch = true, farmInfo, readFromCache, refreshInterval = MINUTE_MILLISECONDS } = props || {}

  const [connection, chainTimeOffset] = useAppStore((s) => [s.connection, s.chainTimeOffset], shallow)
  const onlineCurrentDate = Date.now() + chainTimeOffset
  const cacheData = farmInfo && readFromCache ? farmRpcInfoCache.get(farmInfo.id) : undefined

  const fetch = shouldFetch && farmInfo && connection && !cacheData

  const {
    data,
    mutate: farmMutate,
    ...rest
  } = useSWR(fetch ? [connection, farmInfo.id] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const layout = farmInfo && FARM_TYPE[farmInfo.programId] ? FARM_TYPE[farmInfo.programId].stateLayout : undefined
  let decodedData = useMemo(() => cacheData || (layout && data ? layout.decode(data.data) : undefined), [data, cacheData])
  if (decodedData) farmRpcInfoCache.set(farmInfo!.id, decodedData)

  const { data: slot } = useSWR(connection && decodedData ? decodedData.lpVault.toString() : null, () => connection?.getSlot(), {
    dedupingInterval: MINUTE_MILLISECONDS * 10,
    focusThrottleInterval: MINUTE_MILLISECONDS * 10,
    refreshInterval: MINUTE_MILLISECONDS * 10 // no need to refresh so frequently
  })
  const { data: lpVaultData, mutate: lpVaultMutate } = useSWR(decodedData ? [connection, decodedData.lpVault.toString()] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const decodedLpVaultData = useMemo(() => (lpVaultData ? splAccountLayout.decode(lpVaultData.data) : undefined), [lpVaultData])

  if (decodedData && decodedLpVaultData) {
    decodedData = updatePoolInfo(decodedData, decodedLpVaultData, slot ?? 0, Math.floor(onlineCurrentDate / 1000))
  }

  const refresh = useEvent(() => {
    farmMutate()
    lpVaultMutate()
  })

  return {
    data: cacheData || decodedData,
    refresh,
    ...rest
  }
}
