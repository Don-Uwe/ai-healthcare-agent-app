import {
  ApiV3Token,
  FormatFarmInfoOut,
  FormatFarmInfoOutV345,
  FormatFarmInfoOutV6,
  RewardInfoV345,
  RewardInfoV6
} from '@raydium-io/raydium-sdk-v2'
import { FarmDecodeData } from './farmUtils'
export enum FarmType {
  Raydium = 'Raydium',
  Fusion = 'Fusion',
  Ecosystem = 'Ecosystem'
}

export type FormattedRewardInfo = {
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  totalRewards: string
  upcoming: boolean
  ongoing: boolean
  ended: boolean
} & (RewardInfoV345 | RewardInfoV6)

export type FormattedRewardInfoV345 = {
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  totalRewards: string
  upcoming: boolean
  ongoing: boolean
  ended: boolean
} & RewardInfoV345

export type FormattedRewardInfoV6 = {
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  totalRewards: string
  upcoming: boolean
  ongoing: boolean
  ended: boolean
} & RewardInfoV6

export type ConditionalFormattedRewardType<T> = T extends FormatFarmInfoOutV6
  ? FormattedRewardInfoV6
  : T extends FormatFarmInfoOutV345
  ? FormattedRewardInfoV345
  : FormattedRewardInfo

export type FormattedFarmInfo<T = FormattedRewardInfo> = {
  farmName: string
  isOngoing: boolean
  type: FarmType
  version: 3 | 5 | 6
  formattedRewardInfos: ConditionalFormattedRewardType<T>[]
} & FormatFarmInfoOut

export type FormattedFarmInfoV6 = {
  farmName: string
  isOngoing: boolean
  type: FarmType
  version: 3 | 5 | 6
  formattedRewardInfos: FormattedRewardInfoV6[]
} & FormatFarmInfoOutV6

export type FormattedFarmInfoV345 = {
  farmName: string
  isOngoing: boolean
  type: FarmType
  version: 3 | 5 | 6
  formattedRewardInfos: FormattedRewardInfoV345[]
} & FormatFarmInfoOutV345

export type ConditionalFarmType<T> = T extends FormatFarmInfoOutV6
  ? FormattedFarmInfoV6
  : T extends FormatFarmInfoOutV345
  ? FormattedFarmInfoV345
  : FormattedFarmInfo

export type FarmBalanceInfo = {
  deposited: string
  hasDeposited: boolean
  id: string
  rpcInfoData?: FarmDecodeData
  rewardDebts: string[]
  voteLockedBalance: string
  pendingRewards: string[]
  isLoading: boolean
  error?: any
  isEmptyResult: boolean
  mutate: () => void
  isValidating: boolean
  lpMint?: ApiV3Token
  vault: string
}
