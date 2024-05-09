import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'

const fetcher = (url: string) => axios.get<{ tvl: number; volume24: number }>(url, { skipError: true })

export default function useFetchMainInfo(props: { refreshInterval?: number }) {
  const { refreshInterval = 1000 * 60 * 15 } = props || {}

  const [host, infoUrl] = useAppStore((s) => [s.urlConfigs.NEW_BASE_HOST, s.urlConfigs.INFO], shallow)

  const { data, isLoading, error, ...rest } = useSWR(host + infoUrl, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data: data?.data,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
