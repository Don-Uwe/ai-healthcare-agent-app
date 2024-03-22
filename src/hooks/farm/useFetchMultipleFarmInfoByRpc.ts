import { useMemo } from 'react'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import { splAccountLayout } from '@raydium-io/raydium-sdk-v2'
import { Connection } from '@solana/web3.js'
import ToPublicKey from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useAppStore } from '@/store'
import { FARM_TYPE, FarmDecodeData, updatePoolInfo, farmRpcInfoCache } from './farmUtils'

const fetcher = ([connection, publicKeyList, type]: [Connection, string[], 'farm' | 'farm lpVault']) => {
  console.log(`rpc: get multiple ${type} info`)
  return connection.getMultipleAccountsInfo(
    publicKeyList.map((key) => ToPublicKey(key)),
    { commitment: 'confirmed' }
  )
}

export type FarmRpcInfo = FarmDecodeData & {
  id: string
}

export default function useFetchMultipleFarmInfoByRpc(props: {
  shouldFetch?: boolean
  farmInfoList: { programId: string; id: string }[]
  refreshInterval?: number
  readFromCache?: boolean
}) {
  const { shouldFetch = true, farmInfoList, readFromCache, refreshInterval = MINUTE_MILLISECONDS } = props || {}
  const [connection, chainTimeOffset, tokenAccLoaded] = useAppStore((s) => [s.connection, s.chainTimeOffset, s.tokenAccLoaded], shallow)
  const onlineCurrentDate = Date.now() + chainTimeOffset

  const cacheDataList =
    farmInfoList.length && readFromCache
      ? farmInfoList
          .filter((d) => !!farmRpcInfoCache.get(d.id))
          .map((farm) => ({
            id: farm.id,
            programId: farm.programId,
            data: farmRpcInfoCache.get(farm.id)!
          }))
      : []

  const readyFetchList = farmInfoList.filter((farm) => !cacheDataList.find((cache) => cache.id === farm.id))

  const fetch = shouldFetch && readyFetchList.length > 0 && connection && tokenAccLoaded

  const { data, ...rest } = useSWR(fetch ? [connection, readyFetchList.map((farm) => farm.id), 'farm'] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  let decodedDataList = data
    ? readyFetchList.map((farmInfo, idx) => {
        const layout = FARM_TYPE[farmInfo.programId].stateLayout
        const res = layout.decode(data[idx]!.data) as FarmDecodeData
        farmRpcInfoCache.set(farmInfo.id, res)
        return {
          id: farmInfo.id,
          ...res
        }
      })
    : ([] as FarmRpcInfo[])
  decodedDataList = decodedDataList.concat(
    cacheDataList.map((d) => ({
      ...d.data,
      id: d.id
    }))
  )

  const { data: slot } = useSWR(connection && decodedDataList.length ? farmInfoList[0].programId : null, () => connection?.getSlot(), {
    dedupingInterval: MINUTE_MILLISECONDS * 10,
    focusThrottleInterval: MINUTE_MILLISECONDS * 10,
    refreshInterval: MINUTE_MILLISECONDS * 10 // no need to refresh so frequently
  })

  const { data: lpVaultDataList } = useSWR(
    decodedDataList.length ? [connection, decodedDataList.map((data) => data.lpVault.toString()), 'farm lpVault'] : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )
  const decodedLpVaultDataList = useMemo(
    () => (lpVaultDataList?.length ? lpVaultDataList.map((data) => splAccountLayout.decode(data!.data)) : []),
    [lpVaultDataList]
  )

  if (decodedDataList.length && decodedLpVaultDataList.length) {
    decodedDataList = decodedDataList.map((data, idx) => ({
      ...updatePoolInfo(data, decodedLpVaultDataList[idx], slot ?? 0, onlineCurrentDate),
      id: data.id
    }))
  }

  return {
    data: decodedDataList,
    ...rest
  }
}
