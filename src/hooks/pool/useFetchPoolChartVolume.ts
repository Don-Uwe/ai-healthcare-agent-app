import axios from '@/api/axios'
import { birdeyeAuthorizeKey, birdeyePairVolumeApiAddress } from '@/utils/config/birdeyeAPI'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { throttle } from '@/utils/functionMethods'
import { CandlestickData } from 'lightweight-charts'
import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import { useEvent } from '../useEvent'

export type TimeType = '15m' | '1H' | '4H' | '1D' | '1W'

type RawVolumeDataItem = {
  /** volume */
  v: number
  /** open */
  o: number
  /** close */
  c: number
  /** high */
  h: number
  /** low */
  l: number

  /** unix time (s) */
  unixTime: number
  type: TimeType
}

const fetcher = (url: string) => {
  return axios.get<{ items: RawVolumeDataItem[] }>(url, {
    skipError: true,
    headers: {
      'x-chain': 'solana',
      'X-API-KEY': birdeyeAuthorizeKey
    }
  })
}

const MINUTE_SECONDS = 60
export const SECONDS: Record<TimeType, number> = {
  '15m': 15 * MINUTE_SECONDS,
  '1H': 60 * MINUTE_SECONDS,
  '4H': 4 * 60 * MINUTE_SECONDS,
  '1D': 24 * 60 * MINUTE_SECONDS,
  '1W': 7 * 24 * 60 * MINUTE_SECONDS
}
const offsetSize: Record<TimeType, number> = {
  '15m': 50,
  '1H': 50,
  '4H': 50,
  '1D': 50,
  '1W': 50
}

const getOffset = (timeType: TimeType, page: number) => SECONDS[timeType] * (offsetSize[timeType] * page)
let lastFetchDate = Math.floor(Date.now() / 1000)

export default function useFetchPoolChartVolume({
  disable = false,
  poolAddress,
  timeType = '4H',
  untilDate: propUntilDate = Math.floor(Date.now() / 1000), // in seconds
  refreshInterval = 3 * MINUTE_MILLISECONDS
}: {
  disable?: boolean
  poolAddress?: string
  timeType?: TimeType
  untilDate?: number
  refreshInterval?: number
}) {
  const untilDate =
    propUntilDate > 0 ? (Math.abs(propUntilDate - lastFetchDate) * 1000 > refreshInterval ? propUntilDate : lastFetchDate) : lastFetchDate
  lastFetchDate = untilDate

  const shouldFetch = !!poolAddress
  const { data, setSize, error, isLoading, ...swrProps } = useSWRInfinite(
    (index) =>
      shouldFetch && !disable
        ? birdeyePairVolumeApiAddress({
            poolAddress: poolAddress ?? '',
            timeType,
            timeFrom: untilDate - getOffset(timeType, index + 1),
            timeTo: untilDate - getOffset(timeType, index)
          })
        : null,
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const isLoadEnded = !isLoading && !swrProps.isValidating ? (data ? data[data?.length - 1 || 0].data.items.length < 1 : false) : false
  const allPoints = useMemo(() => (data || []).reduce((acc, cur) => cur.data.items.concat(acc), [] as RawVolumeDataItem[]), [data])
  const isEmptyResult = !isLoading && !(data && !error)

  const loadMore = useEvent(
    throttle(() => {
      if (isLoading || swrProps.isValidating || isLoadEnded) return
      setSize((s) => s + 1)
    }, 1000)
  )

  const formattedData = useMemo(
    () =>
      allPoints.map(
        (p) =>
          ({
            open: p.o,
            high: p.h,
            low: p.l,
            close: p.c,
            time: p.unixTime,
            value: p.v
          } as CandlestickData & { value: number })
      ),
    [allPoints]
  )
  const lastData = formattedData[formattedData.length - 1]
  const prev24HData =
    timeType === '1W'
      ? formattedData[formattedData.length - 2]
      : formattedData[formattedData.length - Math.floor(SECONDS['1D'] / SECONDS[timeType] + 1)]
  const change24H = lastData && prev24HData ? (lastData.close - prev24HData.close) / prev24HData.close : undefined

  return {
    data: formattedData,
    currentPrice: lastData?.close,
    change24H,
    loadMore,
    isLoadEnded,
    isLoading,
    error,
    isEmptyResult,
    ...swrProps
  }
}
