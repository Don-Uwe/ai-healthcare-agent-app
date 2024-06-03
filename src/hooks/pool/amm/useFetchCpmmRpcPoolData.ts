import { Connection } from '@solana/web3.js'
import { CpmmPoolInfoLayout } from '@raydium-io/raydium-sdk-v2'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import BN from 'bn.js'
import { PublicKey } from '@solana/web3.js'
import { AccountLayout } from '@solana/spl-token'

interface Props {
  poolId?: string
  refreshInterval?: number
  shouldFetch?: boolean
  refreshTag?: number
}

export type RpcCpmmPool = (ReturnType<typeof CpmmPoolInfoLayout.decode> & { baseReserve: BN; quoteReserve: BN }) | undefined

const fetcher = async ([connection, id]: [Connection, string]) => {
  try {
    const accountData = await connection.getAccountInfo(new PublicKey(id))
    if (!accountData) return undefined
    const poolInfo = CpmmPoolInfoLayout.decode(accountData.data)
    const [poolVaultAState, poolVaultBState] = await connection.getMultipleAccountsInfo([poolInfo.vaultA, poolInfo.vaultB])

    if (!poolVaultAState) throw new Error(`pool vaultA info not found: ${poolInfo.vaultA.toBase58()}`)
    if (!poolVaultBState) throw new Error(`pool vaultB info not found: ${poolInfo.vaultB.toBase58()}`)

    return {
      ...poolInfo,
      baseReserve: new BN(AccountLayout.decode(poolVaultAState.data).amount.toString())
        .sub(poolInfo.protocolFeesMintA)
        .sub(poolInfo.fundFeesMintA),
      quoteReserve: new BN(AccountLayout.decode(poolVaultBState.data).amount.toString())
        .sub(poolInfo.protocolFeesMintB)
        .sub(poolInfo.fundFeesMintB)
    }
  } catch (e) {
    return undefined
  }
}

export default function useFetchCpmmRpcPoolData({ poolId, refreshInterval = MINUTE_MILLISECONDS, shouldFetch = true, refreshTag }: Props) {
  const [connection] = useAppStore((s) => [s.connection], shallow)
  const readyFetch = !!(connection && poolId && shouldFetch)

  const { data, isLoading, mutate } = useSWR(readyFetch ? [connection, poolId, refreshTag] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  return {
    data,
    isLoading,
    mutate
  }
}
