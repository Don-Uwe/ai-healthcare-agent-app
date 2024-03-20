import { useMemo, useCallback } from 'react'
import { PoolsApiReturn, FetchPoolParams, solToWSol, ApiV3PoolInfoItem, PoolFetchType } from '@raydium-io/raydium-sdk-v2'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useAppStore } from '@/store'
import { formatPoolData } from './formatter'
import { ReturnPoolType, ReturnFormattedPoolType } from './type'

import useSWRInfinite from 'swr/infinite'
import { KeyedMutator } from 'swr'
import { AxiosResponse } from 'axios'

export default function useFetchPoolByMint<T extends PoolFetchType>(
  props: {
    shouldFetch?: boolean
    showFarms?: boolean
    mint1?: string
    mint2?: string
    poolId?: string
    refreshInterval?: number
    type?: T
  } & Omit<FetchPoolParams, 'type'>
): {
  selectedPool?: ReturnPoolType<T>
  data: ReturnPoolType<T>[]
  formattedData: ReturnFormattedPoolType<T>[]
  formattedSelectedPool?: ReturnPoolType<T>
  isLoadEnded: boolean
  loadMore: () => void
  size: number
  mutate: KeyedMutator<AxiosResponse<PoolsApiReturn, any>[]>
  isValidating: boolean
  isLoading: boolean
} {
  const {
    shouldFetch = true,
    showFarms,
    mint1: propMint1 = '',
    mint2: propMint2 = '',
    type = PoolFetchType.All,
    sort = 'default',
    order = 'desc',
    pageSize = 100,
    refreshInterval = MINUTE_MILLISECONDS,
    poolId
  } = props || {}

  const fetcher = useCallback(
    (url: string) =>
      axios.get<PoolsApiReturn>(url, {
        skipError: true
      }),
    []
  )

  const [mint1, mint2] = [propMint1 ? solToWSol(propMint1).toBase58() : propMint1, propMint2 ? solToWSol(propMint2).toBase58() : propMint2]
  const [host, mintUrl, mintsUrl] = useAppStore(
    (s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_SEARCH_MINT, s.urlConfigs.POOL_SEARCH_MINT_2],
    shallow
  )
  const [baseMint, quoteMint] = mint2 && mint1 > mint2 ? [mint2, mint1] : [mint1, mint2]
  const url = (!mint1 && !mint2) || !shouldFetch ? null : host + (quoteMint ? mintsUrl : mintUrl)

  const { data, setSize, error, ...swrProps } = useSWRInfinite(
    (index) =>
      url
        ? url
            .replace('{mint1}', baseMint)
            .replace('{mint2}', quoteMint)
            .replace('{type}', showFarms ? `${type}_farm` : type)
            .replace('{sort}', sort)
            .replace('{order}', order)
            .replace('{page_size}', String(pageSize))
            .replace('{page}', String(index + 1))
        : url,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const loadMore = useCallback(() => setSize((s) => s + 1), [type, sort, order])

  const resData = useMemo(
    () => (data || []).reduce((acc, cur) => acc.concat(cur?.data?.data || []), [] as ApiV3PoolInfoItem[]),
    [data]
  ) as ReturnPoolType<T>[]
  const formattedData = useMemo(() => resData.map((i) => formatPoolData(i)), [resData]) as ReturnFormattedPoolType<T>[]
  const selectedPool = resData && poolId ? (resData.find((d) => d.id === poolId) as ReturnPoolType<T>) : undefined
  const isLoadEnded = !swrProps.isLoading && (!resData.length || !!error)

  return {
    selectedPool,
    data: resData,
    formattedData,
    formattedSelectedPool: selectedPool ? (formatPoolData(selectedPool as ApiV3PoolInfoItem) as ReturnFormattedPoolType<T>) : undefined,
    isLoadEnded,
    loadMore,
    ...swrProps
  }
}
