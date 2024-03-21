import axios from '@/api/axios'
import { birdeyeAuthorizeKey, birdeyePriceUrl } from '@/utils/config/birdeyeAPI'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { useTokenStore, TokenPrice } from '@/store'
import { solToWSol, WSOLMint, RAYMint, USDCMint, USDTMint, mSOLMint } from '@raydium-io/raydium-sdk-v2'
import { NATIVE_MINT } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

export type { TokenPrice }

const fetcher = (url: string) => {
  return axios.get<{
    [key: string]: TokenPrice
  }>(url, {
    skipError: true,
    headers: {
      'x-chain': 'solana',
      'X-API-KEY': birdeyeAuthorizeKey
    }
  })
}

const prepareFetchList = new Set<string>([
  WSOLMint.toBase58(),
  mSOLMint.toBase58(),
  RAYMint.toBase58(),
  USDCMint.toBase58(),
  USDTMint.toBase58()
])

export default function useTokenPrice(props: { mintList: (string | PublicKey | undefined)[]; refreshInterval?: number; timeout?: number }) {
  const { mintList, refreshInterval = 3 * MINUTE_MILLISECONDS, timeout = 800 } = props || {}
  const tokenPriceRecord = useTokenStore((s) => s.tokenPriceRecord)
  const [startFetch, setStartFetch] = useState(timeout === 0)
  const [refreshTag, setRefreshTag] = useState(Date.now())

  const readyList = useMemo(
    () => Array.from(new Set(mintList.filter((m) => !!m && isValidPublicKey(m)).map((m) => solToWSol(m!).toString()))),
    [JSON.stringify(mintList)]
  )

  const shouldFetch = startFetch && prepareFetchList.size > 0

  const { data, isLoading, error, ...rest } = useSWR(
    shouldFetch ? birdeyePriceUrl + `?list_address=${Array.from(prepareFetchList).slice(0, 49).join(',')}` : null,
    fetcher,
    {
      refreshInterval,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval
    }
  )
  const isEmptyResult = !isLoading && !(data && !error)

  const resData = useMemo(() => {
    const prices = data?.data || {}
    // set sol price to wsol price
    if (prices[NATIVE_MINT.toBase58()]) prices[PublicKey.default.toBase58()] = prices[NATIVE_MINT.toBase58()]
    Array.from(tokenPriceRecord.entries()).forEach((data) => {
      if (data[1].data) prices[data[0]] = data[1].data
    })
    return prices
  }, [data, tokenPriceRecord])

  useEffect(() => {
    const hasData = data && Object.keys(data?.data || {}).length > 0
    if (hasData) {
      const fetchRecord = new Map(Array.from(useTokenStore.getState().tokenPriceRecord))
      Object.keys(data?.data || {}).forEach((key) => {
        prepareFetchList.delete(key)
        if (data)
          fetchRecord.set(key, {
            fetchTime: Date.now(),
            data: data.data[key]
          })
      })
      useTokenStore.setState({ tokenPriceRecord: fetchRecord })
    }
    if (prepareFetchList.size > 0) setRefreshTag(Date.now())
    else setStartFetch(false)
  }, [data])

  useEffect(() => {
    if (!readyList.length) return
    const tokenPriceRecord = useTokenStore.getState().tokenPriceRecord
    readyList.forEach((pub) => {
      // if no record or last fetch expired
      if (!tokenPriceRecord.has(pub) || Date.now() - tokenPriceRecord.get(pub)!.fetchTime > refreshInterval) {
        // gather ready to fetch pubkey
        prepareFetchList.add(pub)
      }
    })
    if (timeout === 0) {
      setStartFetch(true)
      return
    }
    // might have lots of duplicate mint address in similar time, gather them for 0.8 secs to reduce request
    const id = setTimeout(() => {
      setStartFetch(true)
    }, timeout)
    return () => clearTimeout(id)
  }, [readyList, refreshInterval, refreshTag, timeout])

  useEffect(() => {
    // manual trigger refresh
    const i = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      setRefreshTag(Date.now())
    }, refreshInterval)
    return () => clearInterval(i)
  }, [refreshInterval])

  return {
    data: resData,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
