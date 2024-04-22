import useSWR from 'swr'
import { useAppStore } from '@/store'
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import ToPublicKey from '@/utils/publicKey'
import logMessage from '@/utils/log'
interface Props {
  name?: string
  publicKey?: string | PublicKey
  readFromCache?: boolean
  refreshInterval?: number
}

const accountCache: Map<string, AccountInfo<Buffer>> = new Map()

const fetcher = ([connection, publicKey, name]: [Connection, string, string]) => {
  logMessage('rpc: get account info', name)
  return connection.getAccountInfo(ToPublicKey(publicKey), { commitment: useAppStore.getState().commitment })
}

export default function useFetchAccountInfo(props: Props) {
  const connection = useAppStore((s) => s.connection)
  const tokenAccLoaded = useAppStore((s) => s.tokenAccLoaded)

  const { publicKey = '', name = '', refreshInterval = MINUTE_MILLISECONDS * 1, readFromCache = false } = props || {}
  const cacheData = readFromCache ? accountCache.get(publicKey.toString()) : undefined
  const shouldFetch = !cacheData && connection && publicKey && tokenAccLoaded

  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? [connection, publicKey.toString(), name] : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  if (data) accountCache.set(publicKey.toString(), data)
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data: cacheData || data,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
