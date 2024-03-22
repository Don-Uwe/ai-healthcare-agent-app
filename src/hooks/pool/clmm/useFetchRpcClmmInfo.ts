import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Connection, PublicKey } from '@solana/web3.js'
import shallow from 'zustand/shallow'
import { PoolInfoLayout, SqrtPriceMath } from '@raydium-io/raydium-sdk-v2'
import ToPublicKey from '@/utils/publicKey'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import Decimal from 'decimal.js'

const fetcher = ([connection, publicKey]: [Connection, string]) => {
  console.log('rpc: get clmm account info')
  return connection.getAccountInfo(ToPublicKey(publicKey), { commitment: useAppStore.getState().commitment })
}

export default function useFetchRpcClmmInfo(props: { shouldFetch?: boolean; id?: string; refreshInterval?: number }) {
  const { shouldFetch = true, id = '', refreshInterval = MINUTE_MILLISECONDS } = props || {}
  const isValidId = isValidPublicKey(id)
  const [connection] = useAppStore((s) => [s.connection], shallow)
  const [poolInfo, setPoolInfo] = useState<(ReturnType<typeof PoolInfoLayout.decode> & { currentPrice: Decimal }) | undefined>()

  const { data, isLoading, error, ...rest } = useSWR(shouldFetch && connection && isValidId ? [connection, id] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const isEmptyResult = shouldFetch && !!id && !isLoading && !(data && !error)

  useEffect(() => {
    if (data) {
      const layoutAccountInfo = PoolInfoLayout.decode(data.data)
      const currentPrice = SqrtPriceMath.sqrtPriceX64ToPrice(
        layoutAccountInfo.sqrtPriceX64,
        layoutAccountInfo.mintDecimalsA,
        layoutAccountInfo.mintDecimalsB
      )

      setPoolInfo({
        ...layoutAccountInfo,
        currentPrice
      })
    } else {
      setPoolInfo(undefined)
    }
  }, [data])

  return {
    id: id ? new PublicKey(id) : undefined,
    programId: data?.owner,
    data: poolInfo,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
