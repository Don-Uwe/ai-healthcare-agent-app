import { useEffect, useMemo, useState } from 'react'
import { PublicKey, GetProgramAccountsFilter } from '@solana/web3.js'
import { ApiV3Token, liquidityStateV4Layout, liquidityStateV5Layout } from '@raydium-io/raydium-sdk-v2'

import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { isDocumentVisible } from '@/utils/common'
import { Subject, throttleTime, filter, asyncScheduler } from 'rxjs'

type PoolDecodeType = ReturnType<typeof liquidityStateV4Layout.decode | typeof liquidityStateV5Layout.decode>
export interface RpcPoolData {
  poolId: string
  poolInfo: PoolDecodeType
}

interface Props {
  poolInfo?: {
    id: string
    programId: string
    mintA: ApiV3Token
    mintB: ApiV3Token
    marketId: string
  }
  throttle?: number
  onUpdate?: (data: RpcPoolData) => void
}

const updateSubject = new Subject<RpcPoolData>()

export default function useSubscribePoolInfo({ poolInfo, throttle = MINUTE_MILLISECONDS }: Props) {
  const [connection, { AMM_V4, AMM_STABLE }] = useAppStore((s) => [s.connection, s.programIdConfig])
  const [data, setData] = useState<RpcPoolData | undefined>()

  const layout = {
    [AMM_V4.toString()]: liquidityStateV4Layout,
    [AMM_STABLE.toString()]: liquidityStateV5Layout
  }[poolInfo?.programId || '']

  const filters: GetProgramAccountsFilter[] = useMemo(() => {
    if (poolInfo && layout) {
      return [
        { dataSize: layout.span },
        {
          memcmp: {
            offset: layout.offsetOf('baseMint'),
            bytes: poolInfo.mintA.address
          }
        },
        {
          memcmp: {
            offset: layout.offsetOf('quoteMint'),
            bytes: poolInfo.mintB.address
          }
        },
        {
          memcmp: {
            offset: layout.offsetOf('marketId'),
            bytes: poolInfo.marketId
          }
        }
      ]
    }
    return []
  }, [poolInfo, layout])

  useEffect(() => {
    if (!poolInfo?.id) return

    const sub = updateSubject
      .asObservable()
      .pipe(filter(isDocumentVisible), throttleTime(throttle, asyncScheduler, { leading: true, trailing: true }))
      .subscribe((data) => {
        setData(data.poolId === poolInfo.id ? data : undefined)
      })

    return () => sub.unsubscribe()
  }, [poolInfo?.id])

  useEffect(() => {
    if (!connection || !poolInfo || !layout) return

    const id = connection.onProgramAccountChange(
      new PublicKey(poolInfo.programId),
      (data) => {
        const info = layout.decode(data.accountInfo.data)
        updateSubject.next({
          poolId: data.accountId.toString(),
          poolInfo: info
        })
      },
      'confirmed',
      filters
    )

    return () => {
      connection.removeProgramAccountChangeListener(id)
    }
  }, [connection, poolInfo, layout, filters])

  return data
}
