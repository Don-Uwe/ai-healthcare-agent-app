import axios from '@/api/axios'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { solToWSol } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import useSWR from 'swr'
import { birdeyeAuthorizeKey, birdeyePriceUrl } from '@/utils/config/birdeyeAPI'

export interface BirdEyeTokenPrice {
  value: number
  updateUnixTime: number
  updateHumanTime: string
  priceChange24h: number
}

const fetcher = (url: string) => {
  return axios.get<{
    [key: string]: BirdEyeTokenPrice
  }>(url, {
    skipError: true,
    headers: {
      'x-chain': 'solana',
      'X-API-KEY': birdeyeAuthorizeKey
    }
  })
}

export default function useBirdeyeTokenPrice(props: {
  mintList: (string | PublicKey | undefined)[]
  refreshInterval?: number
  timeout?: number
}) {
  const { mintList, refreshInterval = 2 * MINUTE_MILLISECONDS } = props || {}

  const readyList = useMemo(
    () => Array.from(new Set(mintList.filter((m) => !!m && isValidPublicKey(m)).map((m) => solToWSol(m!).toString()))),
    [JSON.stringify(mintList)]
  )

  const shouldFetch = readyList.length > 0

  const { data, isLoading, error, ...rest } = useSWR(
    shouldFetch ? `${birdeyePriceUrl}?list_address=` + `${readyList.join(',')}` : null,
    fetcher,
    {
      refreshInterval,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval
    }
  )
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data: data?.data,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
