import { ApiV3PoolInfoItem, ApiV3PoolInfoCountItem, TokenInfo } from '@raydium-io/raydium-sdk-v2'

import { isClient } from '@/utils/common'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import toPercentString, { ToPercentStringOptions, toTotalPercent } from '@/utils/numberish/toPercentString'
import { transformSymbol } from '@/utils/pool/nameFormat'

const POOL_CACHE_KEY = '_ray_favorite_pool_'

const favoritePoolCache =
  typeof window !== 'undefined' ? new Set<string>(JSON.parse(localStorage.getItem(POOL_CACHE_KEY) || '[]')) : new Set<string>()

export const getFavoritePoolCache = (): Set<string> => {
  return favoritePoolCache
}

export const setFavoritePoolCache = (values: string | string[]) => {
  if (!isClient()) return
  if (Array.isArray(values)) {
    values.forEach((v) => {
      if (favoritePoolCache.has(v)) favoritePoolCache.delete(v)
      else favoritePoolCache.add(v)
    })
  } else {
    if (favoritePoolCache.has(values)) favoritePoolCache.delete(values)
    else favoritePoolCache.add(values)
  }
  localStorage.setItem(POOL_CACHE_KEY, JSON.stringify(Array.from(favoritePoolCache)))
  return favoritePoolCache
}

export const getPoolName = (pool: ApiV3PoolInfoItem) => transformSymbol([pool.mintA, pool.mintB])

export const toAPRPercent = (apr: number, options?: ToPercentStringOptions) =>
  apr > 999.99 ? '>999.99%' : toPercentString(apr, { decimals: 2, ...options })

export type TimeBase = '24h' | '7d' | '30d'

export const FILED_KEY: Record<TimeBase, 'day' | 'week' | 'month'> = {
  '24h': 'day',
  '7d': 'week',
  '30d': 'month'
}

export type UIAprInfoItem = {
  apr: number | string
  percentInTotal: number | string
  isTradingFee?: boolean
  token?: TokenInfo | undefined
  tokens?: (Omit<TokenInfo, 'priority'> | undefined)[] | undefined
}

export const formatPoolData = ({ pool, timeData }: { pool: ApiV3PoolInfoItem; timeData: ApiV3PoolInfoCountItem }) => {
  const allApr: UIAprInfoItem[] = [
    {
      apr: timeData.feeApr,
      percentInTotal: toTotalPercent(timeData.feeApr, timeData.apr),
      isTradingFee: true
    }
  ]

  allApr.push(
    ...timeData.rewardApr.map((r, idx) => ({
      apr: r,
      percentInTotal: toTotalPercent(r, timeData.apr),
      token: { ...pool.rewardDefaultInfos[idx].mint, priority: 1 }
    }))
  )

  return {
    poolName: getPoolName(pool),
    isOpenBook: pool.pooltype.includes('OpenBookMarket'),
    tvl: formatLocaleStr(pool.tvl),
    volume: formatLocaleStr(timeData.volume),
    volumeFee: formatLocaleStr(timeData.volumeFee),
    apr: toAPRPercent(timeData.apr),
    allApr
  }
}

export const POOL_SORT_KEY = {
  default: 'default',
  liquidity: 'liquidity',
  volume: 'volume',
  fee: 'fee',
  apr: 'apr'
}
