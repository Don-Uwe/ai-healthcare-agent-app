import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import shallow from 'zustand/shallow'
import { PoolInfoLayout, SqrtPriceMath, ApiV3Token, ApiClmmConfigV3 } from '@raydium-io/raydium-sdk-v2'

import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { isDocumentVisible } from '@/utils/common'
import useFetchRpcClmmInfo from './useFetchRpcClmmInfo'
import Decimal from 'decimal.js'
import { Subject, throttleTime, filter, asyncScheduler } from 'rxjs'

export interface RpcPoolData {
  poolId: string
  currentPrice: number
  poolInfo: ReturnType<typeof PoolInfoLayout.decode> & { currentPrice: Decimal }
}

interface Props {
  poolInfo?: {
    id: string
    programId: string
    mintA: ApiV3Token
    mintB: ApiV3Token
    config: ApiClmmConfigV3
  }
  throttle?: number
  initialFetch?: boolean
  keepFetch?: boolean
  subscribe?: boolean
  refreshTag?: number
}

const updateSubject = new Subject<RpcPoolData>()

export default function useSubscribeClmmInfo({
  poolInfo,
  throttle = MINUTE_MILLISECONDS,
  initialFetch = false,
  keepFetch = false,
  subscribe = true,
  refreshTag
}: Props) {
  const [connection, CLMM_PROGRAM_ID] = useAppStore((s) => [s.connection, s.programIdConfig.CLMM_PROGRAM_ID], shallow)
  const [data, setData] = useState<RpcPoolData | undefined>()
  const { data: rpcClmmData, mutate } = useFetchRpcClmmInfo({
    shouldFetch: keepFetch || (initialFetch && !data),
    id: poolInfo?.id,
    refreshTag,
    refreshInterval: 15 * 1000
  })

  const needReFetch = !!rpcClmmData && !!poolInfo

  useEffect(() => {
    if (needReFetch) mutate()
  }, [needReFetch, mutate])

  useEffect(() => {
    if (!rpcClmmData) return

    setData(() => ({
      poolId: poolInfo!.id,
      currentPrice: rpcClmmData.currentPrice.toNumber(),
      poolInfo: rpcClmmData
    }))
  }, [rpcClmmData])

  useEffect(() => {
    if (!poolInfo?.id || !subscribe) return
    const sub = updateSubject
      .asObservable()
      .pipe(filter(isDocumentVisible), throttleTime(throttle, asyncScheduler, { leading: true, trailing: true }))
      .subscribe((data) => {
        setData(data.poolId === poolInfo.id ? data : undefined)
      })

    return () => sub.unsubscribe()
  }, [poolInfo?.id, subscribe])

  useEffect(() => {
    if (!connection || !poolInfo || poolInfo.programId !== CLMM_PROGRAM_ID.toString() || !subscribe) return

    const id = connection.onProgramAccountChange(
      new PublicKey(poolInfo.programId),
      (data) => {
        const info = PoolInfoLayout.decode(data.accountInfo.data)
        if (data.accountId.toString() !== poolInfo.id) return
        const currentPrice = SqrtPriceMath.sqrtPriceX64ToPrice(info.sqrtPriceX64, poolInfo.mintA.decimals, poolInfo.mintB.decimals)
        updateSubject.next({
          currentPrice: currentPrice.toDecimalPlaces(20).toNumber(),
          poolId: data.accountId.toString(),
          poolInfo: { ...info, currentPrice }
        })
      },
      'confirmed',
      [
        { dataSize: PoolInfoLayout.span },
        {
          memcmp: {
            offset: PoolInfoLayout.offsetOf('ammConfig'),
            bytes: poolInfo.config.id
          }
        },
        {
          memcmp: {
            offset: PoolInfoLayout.offsetOf('mintA'),
            bytes: poolInfo.mintA.address
          }
        },
        {
          memcmp: {
            offset: PoolInfoLayout.offsetOf('mintB'),
            bytes: poolInfo.mintB.address
          }
        }
      ]
    )

    return () => {
      connection.removeProgramAccountChangeListener(id)
    }
  }, [connection, poolInfo?.id, subscribe])

  return {
    ...data,
    poolId: data ? new PublicKey(data?.poolId) : undefined,
    programId: poolInfo ? new PublicKey(poolInfo.programId) : undefined,
    mutateRpcData: mutate
  }
}
