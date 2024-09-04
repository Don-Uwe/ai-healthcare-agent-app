import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'

let refreshTag = Date.now()
export const refreshClmmLock = () => (refreshTag = Date.now())

export interface ClmmLockInfo {
  [poolId: string]: { [nftMint: string]: { lockId: string; nftAccount: string; positionId: string } }
}

const fetcher = ([url]: [string]) =>
  axios.get<ClmmLockInfo>(url, {
    skipError: true
  })

export default function useClmmLockPosition(props: { shouldFetch?: boolean; refreshInterval?: number }) {
  const { shouldFetch = true, refreshInterval = 1000 * 60 * 3 } = props || {}
  const owner = useAppStore((s) => s.publicKey)
  const isOwnerValid = owner ? isValidPublicKey(owner) : false

  const [host, OWNER_LOCK_POSITION] = useAppStore((s) => [s.urlConfigs.OWNER_BASE_HOST, s.urlConfigs.OWNER_LOCK_POSITION], shallow)
  const url = !isOwnerValid || !shouldFetch ? null : host + OWNER_LOCK_POSITION.replace('{owner}', owner!.toString())

  const { data, isLoading, error, ...rest } = useSWR(url ? [url, refreshTag] : url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data: data?.data || {},
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
