import { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { OwnerIdoInfo } from '@raydium-io/raydium-sdk-v2'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore, useFarmStore } from '@/store'
import { isValidPublicKey } from '@/utils/publicKey'
import { MINUTE_MILLISECONDS } from '@/utils/date'

export interface OwnerFullData {
  userIdoInfo: string
  programId: string
  poolId: string
  coin: string
  pc: string
}

let lastRefreshTag = 0
let isNoData = false
const fetcher = (url: string) => axios.get<OwnerIdoInfo>(url, { skipError: true })

export default function useFetchOwnerIdo(props: { owner?: string | PublicKey; shouldFetch?: boolean; refreshInterval?: number }) {
  const { owner, shouldFetch = true, refreshInterval = MINUTE_MILLISECONDS * 30 } = props || {}
  const isOwnerValid = owner ? isValidPublicKey(owner) : false

  const refreshIdoTag = useFarmStore((s) => s.refreshIdoTag)
  const [host, ownerIdoUrl] = useAppStore((s) => [s.urlConfigs.OWNER_BASE_HOST, s.urlConfigs.OWNER_IDO], shallow)
  const url = isNoData || !isOwnerValid || !shouldFetch ? null : host + ownerIdoUrl.replace('{owner}', owner!.toString())

  const { data, isLoading, error, ...rest } = useSWR(url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const formattedData: OwnerFullData[] = useMemo(() => {
    const res = data?.data || {}
    const keys = Object.keys(res)
    return keys.map((key) => ({
      ...res[key],
      userIdoInfo: key
    }))
  }, [data])

  const isEmptyResult = !isLoading && !(data && !error)

  useEffect(() => {
    if (!url || isLoading) return
    isNoData = error?.response?.status === 404
  }, [isLoading, error, url])

  useEffect(() => {
    if (lastRefreshTag === refreshIdoTag || isNoData) return
    lastRefreshTag = refreshIdoTag
    rest.mutate()
  }, [isNoData, refreshIdoTag, rest.mutate])

  return {
    data: data?.data,
    formattedData,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
