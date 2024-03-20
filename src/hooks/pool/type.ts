import {
  ApiV3PoolInfoItem,
  ApiV3PoolInfoStandardItem,
  ApiV3PoolInfoConcentratedItem,
  ApiV3Token,
  PoolFarmRewardInfo,
  PoolFetchType
} from '@raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'

export type WeeklyRewardData = { orgAmount: string; amount: string; token: ApiV3Token; startTime?: number; endTime?: number }[]
export type AprData = { apr: number; percent: number; token?: ApiV3Token; isTradingFee?: boolean }[]
export type TimeAprData = Record<AprKey, { apr: number; percent: number; token?: ApiV3Token; isTradingFee?: boolean }[]>
export type TotalApr = Record<AprKey, number>

export interface FormattedPoolReward extends PoolFarmRewardInfo {
  apr: number
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  upcoming: boolean
  ongoing: boolean
  ended: boolean
  totalRewards: string
}

type FormattedExtendInfo = {
  poolName: string
  poolDecimals: number
  isOpenBook: boolean
  weeklyRewards: WeeklyRewardData
  allApr: TimeAprData
  totalApr: TotalApr
  recommendDecimal: (val: string | number | Decimal) => number
  formattedRewardInfos: FormattedPoolReward[]
  isRewardEnded: boolean
}

export type FormattedPoolInfoItem = ApiV3PoolInfoItem & FormattedExtendInfo

export type FormattedPoolInfoStandardItem = ApiV3PoolInfoStandardItem & FormattedExtendInfo

export type FormattedPoolInfoConcentratedItem = ApiV3PoolInfoConcentratedItem & FormattedExtendInfo

export enum AprKey {
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

export type TimeBasisOptionType = {
  value: AprKey
  label: '24H' | '7D' | '30D'
}

export const timeBasisOptions: TimeBasisOptionType[] = [
  {
    value: AprKey.Day,
    label: '24H'
  },
  {
    value: AprKey.Week,
    label: '7D'
  },
  {
    value: AprKey.Month,
    label: '30D'
  }
]

export type ConditionalPoolType<T> = T extends ApiV3PoolInfoStandardItem
  ? FormattedPoolInfoStandardItem
  : T extends ApiV3PoolInfoConcentratedItem
  ? FormattedPoolInfoConcentratedItem
  : FormattedPoolInfoItem

export type ReturnPoolType<T> = T extends typeof PoolFetchType.Standard
  ? ApiV3PoolInfoStandardItem
  : T extends typeof PoolFetchType.Concentrated
  ? ApiV3PoolInfoConcentratedItem
  : ApiV3PoolInfoItem

export type ReturnFormattedPoolType<T> = T extends typeof PoolFetchType.Standard
  ? FormattedPoolInfoStandardItem
  : T extends typeof PoolFetchType.Concentrated
  ? FormattedPoolInfoConcentratedItem
  : FormattedPoolInfoItem
