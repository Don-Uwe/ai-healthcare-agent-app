import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'

interface PointData {
  time: string
  liquidity: string
}

const fetcher = (url: string) =>
  axios.get<{
    count: number
    line: PointData[]
  }>(url, { skipError: true })

export default function useFetchPoolChartLiquidity(props: {
  disable?: boolean
  shouldFetch?: boolean
  id?: string
  refreshInterval?: number
}) {
  const { shouldFetch = true, id = '', disable = false, refreshInterval = 1000 * 60 * 5 } = props || {}
  const isValidId = isValidPublicKey(id)
  const [host, lineUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_LIQUIDITY_LINE], shallow)
  const url = id && shouldFetch && isValidId && !disable ? host + lineUrl : null

  const { data, isLoading, error, ...rest } = useSWR(url ? url.replace('{id}', String(id)) : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const isEmptyResult = !!id && !isLoading && !(data && !error)

  return {
    data: data?.data.line || [],
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
