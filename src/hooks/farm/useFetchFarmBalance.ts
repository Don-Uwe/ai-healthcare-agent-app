import { useEffect } from 'react'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import { ApiV3Token, getAssociatedLedgerAccount } from '@raydium-io/raydium-sdk-v2'
import { Connection, PublicKey } from '@solana/web3.js'

import { useAppStore } from '@/store'
import { addAccChangeCbk, removeAccChangeCbk } from '@/hooks/app/useTokenAccountInfo'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import ToPublicKey from '@/utils/publicKey'
import useFetchFarmInfoByRpc from './useFetchFarmInfoByRpc'
import { FARM_TYPE, FarmDecodeData } from './farmUtils'
import { FarmBalanceInfo } from './type'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import logMessage from '@/utils/log'

const fetcher = ([connection, publicKey]: [Connection, string | PublicKey]) => {
  logMessage('rpc: get farm ledger info')
  return connection.getAccountInfo(ToPublicKey(publicKey), { commitment: useAppStore.getState().commitment })
}

export default function useFetchFarmBalance(props: {
  shouldFetch?: boolean
  shouldFetchPendingRewards?: boolean
  farmInfo?: {
    programId: string
    id: string
    lpMint: ApiV3Token
    rewardInfos: { mint: ApiV3Token }[]
  }
  prefetchedFarmData?: FarmDecodeData
  refreshInterval?: number
}) {
  const {
    shouldFetch = true,
    shouldFetchPendingRewards = true,
    farmInfo,
    prefetchedFarmData,
    refreshInterval = MINUTE_MILLISECONDS * 2
  } = props || {}
  const [connection, publicKey, tokenAccLoaded] = useAppStore((s) => [s.connection, s.publicKey, s.tokenAccLoaded], shallow)
  const { data: farmData, refresh } = useFetchFarmInfoByRpc({
    shouldFetch: shouldFetchPendingRewards && !prefetchedFarmData,
    farmInfo
  })

  const rpcInfoData = prefetchedFarmData || farmData
  const fetch = shouldFetch && farmInfo && FARM_TYPE[farmInfo.programId] && publicKey && connection

  // check fetch
  const ledger = fetch
    ? getAssociatedLedgerAccount({
        programId: ToPublicKey(farmInfo.programId),
        poolId: ToPublicKey(farmInfo.id),
        owner: publicKey,
        version: FARM_TYPE[farmInfo.programId].version
      })
    : undefined
  const ledgerLayout = fetch ? FARM_TYPE[farmInfo.programId].ledgerLayout : undefined

  const { data, isLoading, error, mutate, ...rest } = useSWR(
    connection && ledger && ledgerLayout && tokenAccLoaded ? [connection, ledger.toString()] : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const isEmptyResult = !!fetch && !isLoading && !(data && !error)

  useEffect(() => {
    if (!connection || !publicKey) return
    const refetch = () => {
      mutate()
      refresh()
    }
    addAccChangeCbk(refetch)

    return () => {
      removeAccChangeCbk(refetch)
    }
  }, [mutate, refresh, connection?.rpcEndpoint, publicKey])

  if (data) {
    const decodeData = ledgerLayout!.decode(data.data)
    let multiplier: BN
    if (rpcInfoData?.version === 6) {
      multiplier = rpcInfoData?.rewardMultiplier ?? new BN(10).pow(new BN(9))
    } else {
      multiplier = rpcInfoData?.rewardInfos.length === 1 ? new BN(10).pow(new BN(9)) : new BN(10).pow(new BN(15))
    }

    const pendingRewards: string[] = rpcInfoData
      ? rpcInfoData.rewardInfos.map((rewardInfo, index) => {
          const rewardDebt = decodeData.rewardDebts[index]
          let pendingReward = decodeData.deposited
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .mul(rpcInfoData?.version === 6 ? rewardInfo.accRewardPerShare : rewardInfo.perShareReward)
            .div(multiplier)
            .sub(rewardDebt)

          if (pendingReward.lt(new BN(0))) pendingReward = new BN(0)
          return new Decimal(pendingReward.toString()).div(10 ** (farmInfo!.rewardInfos[index]?.mint.decimals ?? 0)).toString()
        })
      : []

    return {
      id: decodeData.id.toString(),
      deposited: new Decimal(decodeData.deposited.toString() || 0).div(10 ** farmInfo!.lpMint.decimals).toString(),
      rewardDebts: decodeData.rewardDebts.map((r) => r.toString()),
      voteLockedBalance: decodeData.voteLockedBalance?.toString() || '0',
      pendingRewards,
      isLoading,
      error,
      isEmptyResult,
      mutate,
      ...rest
    } as FarmBalanceInfo
  }

  return {
    deposited: '0',
    farmLedgerId: '',
    rewardDebts: [],
    pendingRewards: [] as string[],
    voteLockedBalance: '0',
    isLoading,
    error,
    isEmptyResult,
    mutate,
    ...rest
  }
}
