import { useEffect, useMemo } from 'react'
import { IdoKeysData } from '@raydium-io/raydium-sdk-v2'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'

const fetcher = (url: string) => axios.get<IdoKeysData[]>(url, { skipError: true })
const idoCache = new Map<string, IdoKeysData>([])

export default function useFetchIdoKeys(props: { idList?: (string | undefined)[]; shouldFetch?: boolean; refreshInterval?: number }) {
  const { idList = [], shouldFetch = true, refreshInterval = MINUTE_MILLISECONDS * 30 } = props || {}
  const readyIdList = useMemo(() => idList.filter((i) => i && isValidPublicKey(i)) as string[], [JSON.stringify(idList)])
  const fetchIdList = useMemo(() => readyIdList.filter((i) => !idoCache.get(i)), [readyIdList])

  const fetch = shouldFetch && fetchIdList.length > 0
  const [host, idoKeyUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.IDO_KEYS], shallow)
  const url = !fetch ? null : host + idoKeyUrl + `?ids=${fetchIdList.join(',')}`

  const { data, isLoading, error, ...rest } = useSWR(url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const isEmptyResult = !isLoading && !(data && !error)

  useEffect(() => {
    if (!data?.data) return
    data.data.forEach((d) => {
      idoCache.set(d.id, d)
    })
  }, [data?.data])

  const resData = useMemo(() => {
    const idoData = (data?.data || []).concat(Array.from(idoCache.values())).filter((data) => readyIdList.some((i) => data.id === i))
    return {
      data: idoData,
      dataMap: idoData.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}) as Record<string, IdoKeysData>
    }
  }, [data?.data, readyIdList])

  return {
    data: resData.data,
    dataMap: resData.dataMap,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
