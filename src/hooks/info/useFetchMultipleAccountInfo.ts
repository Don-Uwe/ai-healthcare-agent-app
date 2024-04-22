import useSWR from 'swr'
import { useAppStore } from '@/store'
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useMemo } from 'react'
import ToPublicKey from '@/utils/publicKey'
import logMessage from '@/utils/log'
interface Props {
  name?: string
  publicKeyList?: (string | PublicKey)[]
  readFromCache?: boolean
  refreshInterval?: number
}

const accountCache: Map<string, AccountInfo<Buffer>> = new Map()

const fetcher = ([connection, publicKeyList, name]: [Connection, string[], string]) => {
  logMessage('rpc: get multiple account info', name)
  return connection.getMultipleAccountsInfo(publicKeyList.map((publicKey) => ToPublicKey(publicKey)))
}

export default function useFetchMultipleAccountInfo(props: Props) {
  const connection = useAppStore((s) => s.connection)

  const { publicKeyList = [], name = '', refreshInterval = MINUTE_MILLISECONDS * 2 } = props || {}
  const shouldFetch = connection && publicKeyList.length

  const { data, isLoading, error, ...rest } = useSWR(
    shouldFetch ? [connection, publicKeyList.map((p) => p?.toString()), name] : null,
    fetcher,
    {
      refreshInterval,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval
    }
  )
  data?.forEach((d, idx) => {
    if (d) accountCache.set(publicKeyList[idx].toString(), d)
  })

  const dataWithId: { [key: string]: AccountInfo<Buffer> | null } = useMemo(
    () =>
      data?.reduce(
        (acc, cur, idx) => ({
          ...acc,
          [publicKeyList[idx]?.toString()]: cur
        }),
        {}
      ) || {},
    [data]
  )
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data,
    dataWithId,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
