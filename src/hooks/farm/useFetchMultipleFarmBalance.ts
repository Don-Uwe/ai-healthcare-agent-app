import { useEffect } from 'react'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import { ApiV3Token, getAssociatedLedgerAccount } from '@raydium-io/raydium-sdk-v2'
import { Connection } from '@solana/web3.js'

import { useAppStore } from '@/store'
import { addAccChangeCbk, removeAccChangeCbk } from '@/hooks/app/useTokenAccountInfo'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import ToPublicKey from '@/utils/publicKey'
import { FarmBalanceInfo } from './type'
import useFetchMultipleFarmInfoByRpc from './useFetchMultipleFarmInfoByRpc'
import { FARM_TYPE } from './farmUtils'
import BN from 'bn.js'

import Decimal from 'decimal.js'
import { useEvent } from '../useEvent'

const fetcher = ([connection, publicKeyList]: [Connection, string[]]) => {
  console.log('rpc: get multiple farm balance info')
  return connection.getMultipleAccountsInfo(
    publicKeyList.map((publicKey) => ToPublicKey(publicKey)),
    { commitment: 'confirmed' }
  )
}

export default function useFetchMultipleFarmBalance(props: {
  shouldFetch?: boolean
  shouldFetchPendingRewards?: boolean
  farmInfoList: {
    programId: string
    id: string
    lpMint: ApiV3Token
  }[]
  refreshInterval?: number
}) {
  const { shouldFetch = true, shouldFetchPendingRewards = true, farmInfoList, refreshInterval = MINUTE_MILLISECONDS * 5 } = props || {}
  const [connection, publicKey, tokenAccLoaded] = useAppStore((s) => [s.connection, s.publicKey, s.tokenAccLoaded], shallow)
  const {
    data: rpcInfoDataList,
    isLoading: isFarmLoading,
    mutate: mutateFarmRpc
  } = useFetchMultipleFarmInfoByRpc({
    shouldFetch: shouldFetchPendingRewards,
    farmInfoList
  })

  const fetch = shouldFetch && farmInfoList.length && publicKey && connection

  // check fetch
  const ledgerList = fetch
    ? farmInfoList.map((farmInfo) =>
        getAssociatedLedgerAccount({
          programId: ToPublicKey(farmInfo.programId),
          poolId: ToPublicKey(farmInfo.id),
          owner: publicKey,
          version: FARM_TYPE[farmInfo.programId].version
        })
      )
    : []

  const {
    data: responses,
    isLoading: isLedgerLoading,
    error,
    mutate,
    ...rest
  } = useSWR(
    connection && tokenAccLoaded && ledgerList.length ? [connection, ledgerList.map((ledger) => ledger.toString())] : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const isEmptyResult = !!fetch && !isLedgerLoading && !(responses && !error)
  const isLoading = isFarmLoading || isLedgerLoading

  useEffect(() => {
    if (!connection || !publicKey) return
    addAccChangeCbk(mutate)

    return () => {
      removeAccChangeCbk(mutate)
    }
  }, [mutate, connection?.rpcEndpoint, publicKey])

  const handleMutate = useEvent(() => {
    mutate()
    mutateFarmRpc()
  })
  if (responses) {
    return {
      isLoading,
      rpcInfoDataList,
      mutate: mutateFarmRpc,
      allFarmBalances: responses
        .map((data, idx) => {
          if (!data)
            return {
              rpcInfoData: undefined,
              id: farmInfoList[idx].id,
              deposited: '0',
              rewardDebts: [],
              voteLockedBalance: '0',
              pendingRewards: [],
              lpMint: farmInfoList[idx].lpMint.address,
              isLoading: isLedgerLoading,
              error,
              isEmptyResult,
              mutate,
              ...rest
            }
          const ledgerLayout = FARM_TYPE[data.owner.toString()].ledgerLayout
          if (!ledgerLayout) return
          const decodeData = ledgerLayout.decode(data!.data)
          const rpcInfoData = rpcInfoDataList.find((d) => d.id === decodeData.id.toString())
          let multiplier: BN
          if (rpcInfoData?.version === 6) {
            multiplier = rpcInfoData?.rewardMultiplier ?? new BN(10).pow(new BN(9))
          } else {
            multiplier = rpcInfoData?.rewardInfos.length === 1 ? new BN(10).pow(new BN(9)) : new BN(10).pow(new BN(15))
          }

          const farmInfo = farmInfoList.find((f) => f.id === decodeData.id.toString())

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
                return new Decimal(pendingReward.toString()).div(10 ** farmInfo!.lpMint.decimals).toString()
              })
            : []

          return {
            rpcInfoData,
            id: decodeData.id.toString(),
            deposited: new Decimal(decodeData.deposited.toString() || 0).div(10 ** farmInfo!.lpMint.decimals).toString(),
            rewardDebts: decodeData.rewardDebts.map((r) => r.toString()),
            voteLockedBalance: decodeData.voteLockedBalance?.toString() || '0',
            pendingRewards,
            lpMint: farmInfo!.lpMint,
            isLoading: isLedgerLoading,
            error,
            isEmptyResult,
            mutate,
            ...rest
          }
        })
        .filter((f) => !!f) as FarmBalanceInfo[]
    }
  }

  return {
    isLoading,
    rpcInfoDataList: [],
    allFarmBalances: [],
    mutate: handleMutate
  }
}
