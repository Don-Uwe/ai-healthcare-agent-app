import { useCallback, useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import { KeyedMutator } from 'swr'
import { AxiosResponse } from 'axios'
import axios from '@/api/axios'
import shallow from 'zustand/shallow'
import { PoolsApiReturn, SearchPoolsApiReturn, ApiV3PoolInfoItem, PoolFetchType } from '@raydium-io/raydium-sdk-v2'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { formatPoolData } from './formatter'
import { ReturnPoolType, ReturnFormattedPoolType } from './type'

let refreshTag = Date.now()
export const refreshPoolCache = () => (refreshTag = Date.now())

const fetcher = (url: string) => axios.get<PoolsApiReturn | SearchPoolsApiReturn>(url)

const PAGE_SIZE = 100

export default function useFetchPoolList<T extends PoolFetchType>(props?: {
  type?: T
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
  refreshInterval?: number
  shouldFetch?: boolean
  showFarms?: boolean
}): {
  data: ReturnPoolType<T>[]
  formattedData: ReturnFormattedPoolType<T>[]
  isLoadEnded: boolean
  setSize: (size: number | ((_size: number) => number)) => Promise<AxiosResponse<PoolsApiReturn | SearchPoolsApiReturn, any>[] | undefined>
  size: number
  loadMore: () => void
  mutate: KeyedMutator<AxiosResponse<PoolsApiReturn | SearchPoolsApiReturn, any>[]>
  isValidating: boolean
  isLoading: boolean
  isEmpty: boolean
  error?: any
} {
  const {
    type = PoolFetchType.All,
    pageSize = PAGE_SIZE,
    sort = 'default',
    order = 'desc',
    refreshInterval = MINUTE_MILLISECONDS,
    shouldFetch = true,
    showFarms
  } = props || {}
  const [host, listUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_LIST], shallow)

  const url =
    (host + listUrl)
      .replace('{type}', showFarms ? `${type}_farm` : type)
      .replace('{sort}', sort)
      .replace('{order}', order)
      .replace('{page_size}', String(pageSize)) + `?time=${refreshTag}`

  const { data, setSize, error, ...swrProps } = useSWRInfinite(
    (index) => (shouldFetch ? url.replace('{page}', String(index + 1)) : null),
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const issues = useMemo(
    () => (data || []).reduce((acc, cur) => acc.concat(cur.data.data), [] as ApiV3PoolInfoItem[]),
    [data]
  ) as ReturnPoolType<T>[]
  const formattedData = useMemo(() => issues.map((i) => formatPoolData(i)), [issues]) as ReturnFormattedPoolType<T>[]
  const lastData = data?.[data.length - 1]
  const isLoadEnded = !lastData || !lastData.data.hasNextPage || lastData.data.data.length < pageSize || !!error
  const loadMore = useCallback(() => setSize((s) => s + 1), [type, sort, order])
  const isEmpty = isLoadEnded && (!data || !data.length)

  return {
    ...swrProps,
    setSize,
    loadMore,
    error,
    data: issues,
    formattedData,
    isLoadEnded,
    isEmpty
  }
}
