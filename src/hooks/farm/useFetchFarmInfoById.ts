import { useEffect, useMemo } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { AxiosResponse } from 'axios'
import { FormatFarmInfoOut } from '@raydium-io/raydium-sdk-v2'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'
import { formatFarmData, farmInfoCache } from './farmUtils'
import { ConditionalFarmType } from './type'

const fetcher = (url: string) => axios.get<FormatFarmInfoOut[]>(url, { skipError: true })

export default function useFetchFarmInfoById<T = FormatFarmInfoOut>(props: {
  shouldFetch?: boolean
  idList?: (string | undefined)[]
  refreshInterval?: number
  readFromCache?: boolean
}): {
  data?: T[]
  dataMap: { [key: string]: T }
  formattedData?: ConditionalFarmType<T>[]
  formattedDataMap: { [key: string]: ConditionalFarmType<T> }
  isLoading: boolean
  error?: any
  isEmptyResult: boolean
  mutate: KeyedMutator<AxiosResponse<T[], any>>
  isValidating: boolean
} {
  const { shouldFetch = true, idList = [], refreshInterval = 1000 * 60, readFromCache } = props || {}

  const [host, farmInfoUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.FARM_INFO], shallow)
  const readyIdList = idList.filter((i) => i && isValidPublicKey(i)) as string[]

  const cacheDataList = useMemo(
    () => (readFromCache ? readyIdList.map((id) => farmInfoCache.get(id)).filter((d) => d !== undefined) : []),
    [JSON.stringify(readyIdList)]
  )
  const url = !readyIdList.length || cacheDataList.length === readyIdList.length || !shouldFetch ? null : host + farmInfoUrl

  const { data, isLoading, error, mutate, ...rest } = useSWR(url ? url + `?ids=${readyIdList.join(',')}` : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const resData = useMemo(() => [...cacheDataList, ...(data?.data.filter((d) => !!d) || [])] as FormatFarmInfoOut[], [data, cacheDataList])
  const dataMap = useMemo(() => resData.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}), []) as {
    [key: string]: T
  }
  const formattedData = useMemo(
    () => (resData ? resData.filter((d) => !!d).map(formatFarmData) : undefined),
    [resData]
  ) as ConditionalFarmType<T>[]
  const formattedDataMap = useMemo(() => formattedData.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}), [formattedData]) as {
    [key: string]: ConditionalFarmType<T>
  }
  const isEmptyResult = !!readyIdList.length && !isLoading && (!data || !resData.length || !!error)

  useEffect(() => {
    if (resData) {
      resData.forEach((d) => farmInfoCache.set(d.id, d))
    }
  }, [resData])

  return {
    data: resData as T[],
    dataMap,
    formattedData,
    formattedDataMap,
    isLoading,
    error,
    isEmptyResult,
    mutate: mutate as KeyedMutator<AxiosResponse<any, any>>,
    ...rest
  }
}
