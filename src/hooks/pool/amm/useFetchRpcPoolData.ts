import { Connection } from '@solana/web3.js'
import { fetchMultipleInfo, AmmV4Keys, AmmV5Keys } from '@raydium-io/raydium-sdk-v2'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import BN from 'bn.js'
import axios from '@/api/axios'

interface Props {
  poolId?: string
  refreshInterval?: number
  shouldFetch?: boolean
  refreshTag?: number
}

export type RpcAmmPool =
  | {
      status: BN
      baseDecimals: number
      quoteDecimals: number
      lpDecimals: number
      baseReserve: BN
      quoteReserve: BN
      lpSupply: BN
      startTime: BN
    }
  | undefined

const fetcher = async (url: string) => {
  try {
    const data = await axios.get<AmmV4Keys | AmmV5Keys>(url)
    return data
  } catch (e) {
    return undefined
  }
}

const poolDataFetcher = async ([connection, poolKeys]: [connection: Connection, poolKeys: AmmV4Keys | AmmV5Keys]) => {
  try {
    const data = await fetchMultipleInfo({
      connection,
      poolKeysList: [poolKeys].filter((d) => !!d),
      config: undefined
    })
    return data[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export default function useFetchRpcPoolData({ poolId, refreshInterval = MINUTE_MILLISECONDS, shouldFetch = true, refreshTag }: Props) {
  const [connection, host, poolKeyUrl] = useAppStore((s) => [s.connection, s.urlConfigs.BASE_HOST, s.urlConfigs.POOL_KEY_BY_ID], shallow)
  const readyFetch = !!(connection && poolId && shouldFetch)

  const { data: poolKeysData } = useSWR(readyFetch ? `${host}${poolKeyUrl}`.replace('{id}', poolId) : null, fetcher, {
    dedupingInterval: 60 * MINUTE_MILLISECONDS,
    focusThrottleInterval: 60 * MINUTE_MILLISECONDS,
    refreshInterval: 60 * MINUTE_MILLISECONDS
  })

  const { data, isLoading, mutate } = useSWR(
    readyFetch && poolKeysData ? [connection, poolKeysData.data, refreshTag] : null,
    poolDataFetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  return {
    data,
    isLoading,
    mutate
  }
}
