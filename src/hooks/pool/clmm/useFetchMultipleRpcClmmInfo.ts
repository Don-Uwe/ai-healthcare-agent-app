import { useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { Connection } from '@solana/web3.js'
import shallow from 'zustand/shallow'
import { PoolInfoLayout, SqrtPriceMath } from '@raydium-io/raydium-sdk-v2'
import ToPublicKey from '@/utils/publicKey'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import Decimal from 'decimal.js'

type PoolData = ReturnType<typeof PoolInfoLayout.decode> & {
  id: string
  currentPrice: Decimal
}

const fetcher = ([connection, publicKeyList]: [Connection, string[]]) => {
  console.log('rpc: get multiple clmm info')
  return connection.getMultipleAccountsInfo(publicKeyList.map((publicKey) => ToPublicKey(publicKey)))
}

export default function useFetchMultipleRpcClmmInfo(props: {
  shouldFetch?: boolean
  idList?: (string | undefined)[]
  refreshInterval?: number
}) {
  const { shouldFetch = true, idList = [], refreshInterval = MINUTE_MILLISECONDS * 3 } = props || {}
  const readyIdList = useMemo(() => idList.filter((i) => i && isValidPublicKey(i)) as string[], [JSON.stringify(idList)])
  const [connection] = useAppStore((s) => [s.connection], shallow)
  const [poolData, setPoolData] = useState<PoolData[]>([])
  const [poolDataMap, setPoolDataMap] = useState<{ [key: string]: PoolData }>({})

  const { data, isLoading, error, ...rest } = useSWR(
    shouldFetch && connection && readyIdList.length ? [connection, readyIdList] : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )
  const isEmptyResult = shouldFetch && readyIdList.length > 0 && !isLoading && !(data && !error)

  useEffect(() => {
    if (data) {
      const resData: PoolData[] = []
      const resDataMap: { [key: string]: PoolData } = {}

      data.forEach((d, idx) => {
        if (!d) return
        const layoutAccountInfo = PoolInfoLayout.decode(d.data)
        const currentPrice = SqrtPriceMath.sqrtPriceX64ToPrice(
          layoutAccountInfo.sqrtPriceX64,
          layoutAccountInfo.mintDecimalsA,
          layoutAccountInfo.mintDecimalsB
        )
        const pool = {
          id: readyIdList[idx],
          currentPrice,
          ...layoutAccountInfo
        }
        resData.push(pool)
        resDataMap[readyIdList[idx]] = pool
      })
      setPoolData(resData)
      setPoolDataMap(resDataMap)
    }
  }, [data, readyIdList])

  return {
    data: poolData,
    dataMap: poolDataMap,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
