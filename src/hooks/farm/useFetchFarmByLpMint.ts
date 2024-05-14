import { useEffect, useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { FormatFarmInfoOut, FetchPoolParams } from '@raydium-io/raydium-sdk-v2'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'

import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { formatFarmData, farmInfoCache } from './farmUtils'

const fetcher = (url: string) => axios.get(url, { skipError: true })

export default function useFetchFarmByLpMint(
  props: {
    shouldFetch?: boolean
    poolLp?: string | PublicKey
    perPage?: number
    page?: number
    refreshInterval?: number
  } & FetchPoolParams
) {
  const { shouldFetch = true, poolLp = '', perPage = 100, page = 1, refreshInterval = MINUTE_MILLISECONDS } = props || {}

  const [host, farmLpInfoUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.FARM_LP_INFO], shallow)
  const url = !poolLp || !shouldFetch ? null : host + farmLpInfoUrl

  const { data, isLoading, error, ...rest } = useSWR(url ? url + `?lp=${poolLp}&page=${page}&pageSize=${perPage}` : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const orgData =
    (
      data as
        | {
            id: string
            success: boolean
            data: {
              count: number
              hasNextPage: boolean
              data: FormatFarmInfoOut[]
            }
          }
        | undefined
    )?.data.data || []

  const formattedData = useMemo(() => orgData.map(formatFarmData), [orgData])
  const isEmptyResult = !!poolLp && !isLoading && !(data && !error)

  useEffect(() => {
    orgData.forEach((data) => farmInfoCache.set(data.id, data))
  }, [orgData])

  return {
    data: data?.data.data,
    formattedData,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
