import { useMemo, useEffect } from 'react'
import { FarmPositionData } from '@raydium-io/raydium-sdk-v2'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore, useTokenAccountStore, useFarmStore } from '@/store'
import { addAccChangeCbk, removeAccChangeCbk } from '@/hooks/app/useTokenAccountInfo'

import Decimal from 'decimal.js'

export type FarmPositionInfo = {
  hasAmount: boolean
  hasV1Data: boolean
  totalLpAmount: string
  totalV1LpAmount: string
  lpMint: string
  data: {
    programId: string
    lpAmount: string
    lpMint: string
    farmId: string
    userVault: string
    version: 'V1' | 'V2'
  }[]
}

const fetcher = ([url]: [url: string]) => axios.get<FarmPositionData>(url, { skipError: true })

export default function useFarmPositions(props: { shouldFetch?: boolean; refreshInterval?: number }) {
  const { shouldFetch = true, refreshInterval = 1000 * 60 } = props || {}
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const refreshTag = useFarmStore((s) => s.refreshTag)

  const [host, OWNER_STAKE_FARMS, connection, publicKey] = useAppStore(
    (s) => [s.urlConfigs.OWNER_BASE_HOST, s.urlConfigs.OWNER_STAKE_FARMS, s.connection, s.publicKey],
    shallow
  )

  const url = !publicKey || !shouldFetch ? null : host + OWNER_STAKE_FARMS.replace('{owner}', publicKey.toString())

  const { data, isLoading, error, ...rest } = useSWR(url ? [url, refreshTag] : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const positionData = data?.data || {}

  /**
   * {
   *    [lpMint]: {
   *        [farmId]: {
   *            [userVault]: data
   *        }
   *    }
   * }
   */
  const [allPositionsByLp, allPositionsByFarm]: [Map<string, FarmPositionInfo>, Map<string, FarmPositionInfo>] = useMemo(() => {
    const all = new Map()
    const allFarms = new Map()
    Object.keys(data?.data || {}).forEach((lpMint) => {
      Object.keys(positionData[lpMint]).forEach((farmId) => {
        Object.keys(positionData[lpMint][farmId]).forEach((userVault) => {
          const data = {
            ...positionData[lpMint][farmId][userVault],
            farmId,
            lpMint,
            userVault
          }
          // set pos data by mint
          const prevData = all.get(lpMint)
          all.set(lpMint, {
            lpMint,
            hasAmount: prevData?.hasAmount || new Decimal(data.lpAmount || 0).gt(0),
            hasV1Data: prevData?.hasV1Data || data.version === 'V1',
            totalLpAmount: new Decimal(prevData?.totalLpAmount ?? 0).add(data.lpAmount || 0).toString(),
            totalV1LpAmount:
              data.version === 'V1'
                ? new Decimal(prevData?.totalV1LpAmount ?? 0).add(data.lpAmount || 0).toString()
                : prevData?.totalV1LpAmount ?? '0',
            data: [...(prevData?.data || []), data]
          })

          // set pos data by farm
          const prevFarmData = allFarms.get(farmId)
          allFarms.set(farmId, {
            lpMint,
            hasAmount: prevFarmData?.hasAmount || new Decimal(data.lpAmount || 0).gt(0),
            hasV1Data: prevFarmData?.hasV1Data || data.version === 'V1',
            totalLpAmount: new Decimal(prevFarmData?.totalLpAmount ?? 0).add(data.lpAmount || 0).toString(),
            totalV1LpAmount:
              data.version === 'V1'
                ? new Decimal(prevFarmData?.totalV1LpAmount ?? 0).add(data.lpAmount || 0).toString()
                : prevFarmData?.totalV1LpAmount ?? '0',
            data: [...(prevData?.data || []), data]
          })
        })
      })
      all.set(lpMint, {
        ...all.get(lpMint)!,
        totalLpAmount: new Decimal(all.get(lpMint)?.totalLpAmount ?? 0).add(getTokenBalanceUiAmount({ mint: lpMint }).rawAmount).toString()
      })
    })
    return [all, allFarms]
  }, [data, getTokenBalanceUiAmount])

  const isEmptyResult = !isLoading && !(data && !error)

  useEffect(() => {
    if (!connection || !publicKey) return
    addAccChangeCbk(rest.mutate)

    return () => removeAccChangeCbk(rest.mutate)
  }, [rest.mutate, connection?.rpcEndpoint, publicKey])

  return {
    data: positionData,
    lpBasedData: allPositionsByLp,
    farmBasedData: allPositionsByFarm,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}

//Bw932pURVJRYjEJwRZGWjfUNpeyz18kjMNdb833eMxoj
