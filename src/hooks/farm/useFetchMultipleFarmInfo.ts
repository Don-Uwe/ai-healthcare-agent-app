import { useEffect, useMemo } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import shallow from 'zustand/shallow'
import { FormatFarmInfoOut } from '@raydium-io/raydium-sdk-v2'
import { AxiosResponse } from 'axios'

import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { formatFarmData, farmInfoCache } from './farmUtils'
import { ConditionalFarmType } from './type'

const fetcher = (url: string) => axios.get<FormatFarmInfoOut[]>(url, { skipError: true })

export default function useFetchMultipleFarmInfo<T = FormatFarmInfoOut>(props: {
  shouldFetch?: boolean
  idList?: string[]
  refreshInterval?: number
  readFromCache?: boolean
}): {
  data: T[]
  formattedData: ConditionalFarmType<T>[]
  formattedDataMap: Map<string, ConditionalFarmType<T>>
  isLoading: boolean
  error?: any
  isEmptyResult: boolean
  mutate: KeyedMutator<AxiosResponse<T[], any>>
  isValidating: boolean
} {
  const { shouldFetch = true, idList = [], refreshInterval = MINUTE_MILLISECONDS, readFromCache } = props || {}
  const [host, farmInfoUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.FARM_INFO, s.connection, s.publicKey], shallow)

  let readyIdList = idList.filter((i) => isValidPublicKey(i))
  const cacheDataList = (
    readFromCache ? idList.map((id) => farmInfoCache.get(id)).filter((d) => d !== undefined) : []
  ) as FormatFarmInfoOut[]
  readyIdList = readyIdList.filter((id) => !cacheDataList.find((data) => data.id === id))

  const url = readyIdList.length <= 0 || !idList.length || !shouldFetch ? null : host + farmInfoUrl

  const { data, isLoading, error, mutate, ...rest } = useSWR(url ? url + `?ids=${readyIdList.join(',')}` : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const resData = useMemo(
    () => (data ? [...cacheDataList, ...data.data].filter((d) => !!d) : cacheDataList) as FormatFarmInfoOut[],
    [data, cacheDataList]
  )

  const formattedData = useMemo(() => resData.filter((d) => !!d).map((d) => formatFarmData<T>(d)), [resData])
  const formattedDataMap = useMemo(() => formattedData.reduce((acc, cur) => acc.set(cur.id, cur), new Map()), [formattedData]) as Map<
    string,
    ConditionalFarmType<T>
  >

  const isEmptyResult = idList.length > 0 && !isLoading && !(resData.length > 0 && !error)

  useEffect(() => {
    if (data) data.data.forEach((d) => !!d && farmInfoCache.set(d.id, d))
  }, [data])

  return {
    data: resData as T[],
    formattedData,
    formattedDataMap,
    isLoading,
    error,
    isEmptyResult,
    mutate: mutate as KeyedMutator<AxiosResponse<any, any>>,
    ...rest
  }
}
