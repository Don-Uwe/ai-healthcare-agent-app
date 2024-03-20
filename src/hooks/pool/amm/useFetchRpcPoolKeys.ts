import { Connection } from '@solana/web3.js'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import useSWR from 'swr'
import shallow from 'zustand/shallow'

import { formatAmmKeys, ApiPoolInfoV4 } from '@/utils/pool/formatAmmKeys'

interface Props {
  baseMint?: string
  quoteMint?: string
  refreshInterval?: number
}

let cachePoolKeys: ApiPoolInfoV4[] = []

const fetcher = async ([connection, programId]: [Connection, string]) => {
  if (cachePoolKeys.length) return cachePoolKeys
  try {
    const data = await formatAmmKeys({
      connection,
      programId
    })
    cachePoolKeys = [...data]
    return data
  } catch (e) {
    return []
  }
}

export default function useFetchRpcPoolKeys({ baseMint = '', quoteMint = '', refreshInterval = 60 * MINUTE_MILLISECONDS * 24 }: Props) {
  const [connection, programIdConfig] = useAppStore((s) => [s.connection, s.programIdConfig], shallow)
  const readyFetch = !!(connection && programIdConfig.AMM_V4)

  const { data, isLoading } = useSWR(readyFetch ? [connection, programIdConfig.AMM_V4.toBase58()] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  return null
}
