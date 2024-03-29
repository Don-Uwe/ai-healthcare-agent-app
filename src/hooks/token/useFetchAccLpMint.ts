import { useMemo } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { MintLayout, RawMint } from '@solana/spl-token'
import shallow from 'zustand/shallow'
import useSWR from 'swr'
import { useTokenAccountStore, useAppStore } from '@/store'
import useFetchPoolByLpMint from '@/hooks/pool/useFetchPoolByLpMint'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import Decimal from 'decimal.js'
import ToPublicKey from '@/utils/publicKey'
import { setStorageItem, getStorageItem } from '@/utils/localStorage'

interface Props<T> {
  shouldFetch?: boolean
  refreshInterval?: number
  fetchLpPoolInfo?: boolean
  type?: T
}
type MintData = RawMint & { address: PublicKey }

const preFetchMints: Map<string, MintData> = new Map()
const poolLpAuthority = new Set(['5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', '3uaZBfHPfmpAHW7dsimC1SnyR61X4bJqQZKWmRSCXJxv'])
const LP_CACHE_KEY = '_r_lp_b_'
const noneLpMintSet = new Set<string>(JSON.parse(getStorageItem(LP_CACHE_KEY) || '[]'))

const fetcher = async ([connection, publicKeyList]: [Connection, string[]]) => {
  const [newFetchList, fetchedList]: [PublicKey[], string[]] = [[], []]
  publicKeyList.forEach((p) => {
    if (!preFetchMints.has(p)) newFetchList.push(ToPublicKey(p))
    else fetchedList.push(p)
  })
  if (!newFetchList.length) return fetchedList.map((p) => preFetchMints.get(p)!)
  console.log('rpc: get multiple lp mint acc info')

  const chunkSize = 100
  const keyGroup = []
  for (let i = 0; i < publicKeyList.length; i += chunkSize) {
    keyGroup.push(publicKeyList.slice(i, i + chunkSize))
  }
  const res = await Promise.all(
    keyGroup.map((list) =>
      connection.getMultipleAccountsInfo(
        list.map((publicKey) => ToPublicKey(publicKey)),
        { commitment: 'confirmed' }
      )
    )
  )
  const data = res
    .flat()
    .map((accountData, idx) => {
      if (accountData?.data.length === MintLayout.span) {
        const r = MintLayout.decode(accountData.data)
        const mintData = { ...r, address: newFetchList[idx] }
        preFetchMints.set(mintData.address.toBase58(), mintData)
        if (!poolLpAuthority.has(mintData.mintAuthority.toBase58())) noneLpMintSet.add(mintData.address.toBase58())
        return mintData
      }
      return undefined
    })
    .filter((d) => !!d)
    .concat(fetchedList.map((p) => preFetchMints.get(p)))

  try {
    setStorageItem(LP_CACHE_KEY, JSON.stringify(Array.from(noneLpMintSet)))
  } catch {
    console.error('unable set non lp mints')
  }
  return data as MintData[]
}

export default function useFetchAccLpMint<T>({
  shouldFetch = true,
  refreshInterval = MINUTE_MILLISECONDS * 60 * 24,
  fetchLpPoolInfo = false,
  type
}: Props<T>) {
  const connection = useAppStore((s) => s.connection)
  const [tokenAccounts, getTokenBalanceUiAmount] = useTokenAccountStore((s) => [s.tokenAccounts, s.getTokenBalanceUiAmount], shallow)

  const readyFetchMints = tokenAccounts
    .filter((p) => !p.mint.equals(PublicKey.default) && !p.amount.isZero())
    .map((t) => t.mint.toString())
    .filter((k) => !noneLpMintSet.has(k))

  const fetch = shouldFetch && !!connection

  const { data, ...rest } = useSWR(fetch ? [connection, readyFetchMints] : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  const lpMintList = useMemo(() => data?.filter((s) => s && poolLpAuthority.has(s.mintAuthority.toBase58())) || [], [data])
  const noneZeroLpMintList = useMemo(
    () =>
      lpMintList.filter((s) => s && !getTokenBalanceUiAmount({ mint: s.address.toBase58(), decimals: s.decimals }).isZero) as MintData[],
    [lpMintList]
  )

  const { formattedData: poolData = [] } = useFetchPoolByLpMint({
    shouldFetch: fetchLpPoolInfo,
    lpMintList: noneZeroLpMintList.map((p) => p!.address.toBase58()),
    refreshInterval: MINUTE_MILLISECONDS
  })

  let lpAll = new Decimal(0)
  const lpAssetsList = noneZeroLpMintList.map((mint) => {
    const poolInfo = poolData.find((p) => p.lpMint.address === mint.address.toBase58())
    const volume = getTokenBalanceUiAmount({ mint: mint.address.toBase58(), decimals: mint.decimals }).amount.mul(poolInfo?.lpPrice ?? 0)
    lpAll = lpAll.add(volume)
    return {
      key: poolInfo?.poolName.replace(' - ', '/') || mint.address.toBase58(),
      value: volume.toFixed(4),
      type,
      percentage: 0
    }
  })
  lpAssetsList.forEach((data) => (data!.percentage = new Decimal(data!.value ?? 0).div(lpAll).mul(100).toDecimalPlaces(2).toNumber()))

  return {
    data: lpMintList,
    noneZeroLpMintList,
    lpAssetsList,
    lpPoolInfo: poolData,
    ...rest
  }
}
