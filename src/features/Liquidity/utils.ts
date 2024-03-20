import { isClient } from '@/utils/common'
import { CreateTabOptionType } from '../Create/StandardPool'
import { DecreaseTabOptionType } from './Decrease'
import { IncreaseTabOptionType } from './Increase'

export const SIDE = {
  BASE: 'base',
  QUOTE: 'quote'
}

const CACHE_KEY = '_ray_liq_'
type PoolType = 'standard' | 'clmm'

export interface PairData {
  baseMint: string
  quoteMint: string
}
export const getPairCache = (key: PoolType): PairData => {
  if (!isClient()) return { baseMint: '', quoteMint: '' }
  const cache = localStorage.getItem(`_${key}_${CACHE_KEY}`)
  return cache ? JSON.parse(cache) : { baseMint: '', quoteMint: '' }
}

export const setPairCache = (params: { key: PoolType } & Partial<PairData>) => {
  if (!isClient()) return
  const { key, ...values } = params
  const currentCache = getPairCache(key)
  localStorage.setItem(
    `_${key}_${CACHE_KEY}`,
    JSON.stringify({
      ...currentCache,
      ...values
    })
  )
}

// type
export type LiquidityActionModeType = 'add' | 'remove' | 'stake' | 'unstake' | 'no_id' | 'has_id' | 'init'

export type LiquidityFarmActionModeType = 'select' | 'reward' | 'review' | 'done'

export type CreateFarmType = 'Standard' | 'Concentrated'

export type LiquidityTabOptionType = IncreaseTabOptionType['value'] | DecreaseTabOptionType['value'] | CreateTabOptionType['value']

export const tabValueModeMapping: { [key in LiquidityTabOptionType]: LiquidityActionModeType } = {
  'Add Liquidity': 'add',
  'Stake Liquidity': 'stake',
  'Unstake Liquidity': 'unstake',
  'Remove Liquidity': 'remove',
  'I have an ID': 'has_id',
  'No ID': 'no_id'
}
