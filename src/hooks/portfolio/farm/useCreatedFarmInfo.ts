import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { OwnerCreatedFarmInfo } from '@raydium-io/raydium-sdk-v2'
import useSWR from 'swr'
import shallow from 'zustand/shallow'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { isValidPublicKey } from '@/utils/common'

export enum FarmCategory {
  Clmm = 'concentrated',
  Standard = 'standard',
  All = 'all'
}
let refreshTag = Date.now()
export const refreshCreatedFarm = () => (refreshTag = Date.now())

const fetcher = (url: string) => axios.get<OwnerCreatedFarmInfo>(url, { skipError: true })

export default function useCreatedFarmInfo(props: { owner?: string | PublicKey; shouldFetch?: boolean; refreshInterval?: number }) {
  const { owner, shouldFetch = true, refreshInterval = 1000 * 60 * 3 } = props || {}
  const isOwnerValid = owner ? isValidPublicKey(owner) : false

  const [host, OWNER_CREATED_FARM] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.OWNER_CREATED_FARM], shallow)
  const url = !isOwnerValid || !shouldFetch ? null : host + OWNER_CREATED_FARM.replace('{owner}', owner!.toString()) + `?time=${refreshTag}`

  const { data, isLoading, error, ...rest } = useSWR(url, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })
  const formattedData = useMemo(() => {
    const res = data?.data || { clmm: [], farm: [] }
    return res.clmm.map((d) => ({ ...d, type: FarmCategory.Clmm })).concat(res.farm.map((d) => ({ ...d, type: FarmCategory.Standard })))
  }, [data])
  const isEmptyResult = !isLoading && !(data && !error)

  return {
    data: data?.data || {
      farm: [],
      clmm: []
    },
    formattedData,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
