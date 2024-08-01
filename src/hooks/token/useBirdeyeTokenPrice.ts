import axios from '@/api/axios'
import { birdeyePriceUrl } from '@/utils/config/birdeyeAPI'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { isValidPublicKey } from '@/utils/publicKey'
import { solToWSol, WSOLMint } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import useSWR from 'swr'

export interface BirdEyeTokenPrice {
  value: number
  updateUnixTime: number
  updateHumanTime: string
  priceChange24h: number
}

const fetcher = ([url, mintList]: [string, string]) => {
  return axios.post<{
    [key: string]: BirdEyeTokenPrice
  }>(
    url,
    {
      list_address: mintList
    },
    {
      skipError: true,
    }
  )
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

  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? [birdeyePriceUrl, readyList.join(',')] : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  const isEmptyResult = !isLoading && !(data && !error)

  if (data?.data) {
    data.data[PublicKey.default.toBase58()] = data.data[WSOLMint.toBase58()]
  }

  return {
    data: data?.data,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
