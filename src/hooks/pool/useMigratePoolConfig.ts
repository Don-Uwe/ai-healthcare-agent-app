import axios from '@/api/axios'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import useSWR from 'swr'
import { useAppStore } from '@/store'

export interface MigrateClmmConfig {
  ammId: string
  clmmId: string
  defaultPriceMax: number
  defaultPriceMin: number
  farmIds: string[]
  lpMint: string
  name: string
}

const fetcher = (url: string) => {
  return axios.get<MigrateClmmConfig[]>(url, {
    skipError: true
  })
}

export default function useMigratePoolConfig(props: { shouldFetch?: boolean; refreshInterval?: number }) {
  const { shouldFetch = true, refreshInterval = 60 * MINUTE_MILLISECONDS } = props || {}
  const BASE_HOST = useAppStore((s) => s.urlConfigs.NEW_BASE_HOST)
  const MIGRATE_CONFIG = useAppStore((s) => s.urlConfigs.MIGRATE_CONFIG)
  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? `${BASE_HOST}${MIGRATE_CONFIG}` : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data: data?.data || [],
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
