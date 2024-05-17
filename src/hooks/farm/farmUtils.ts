import {
  farmStateV3Layout,
  farmStateV5Layout,
  farmStateV6Layout,
  farmLedgerLayoutV3_2,
  farmLedgerLayoutV5_2,
  farmLedgerLayoutV6_1,
  FormatFarmInfoOut,
  FARM_PROGRAM_ID_V3,
  FARM_PROGRAM_ID_V5,
  FARM_PROGRAM_ID_V6,
  RewardInfoV6,
  Structure,
  SplAccount
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { getMintSymbol } from '@/utils/token'
import { FarmType, ConditionalFarmType, ConditionalFormattedRewardType } from './type'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { useAppStore } from '@/store/useAppStore'

export type FarmLedgerData = Structure<
  PublicKey | BN | BN[],
  '',
  {
    id: PublicKey
    state: BN
    owner: PublicKey
    deposited: BN
    rewardDebts: BN[]
    voteLockedBalance?: BN
  }
>

export const FARM_TYPE: Record<
  string,
  {
    name: FarmType
    version: 3 | 5 | 6
    ledgerLayout: FarmLedgerData
    stateLayout: typeof farmStateV3Layout | typeof farmStateV5Layout | typeof farmStateV6Layout
  }
> = {
  [FARM_PROGRAM_ID_V3.toString()]: {
    name: FarmType.Raydium,
    version: 3,
    ledgerLayout: farmLedgerLayoutV3_2,
    stateLayout: farmStateV3Layout
  },
  [FARM_PROGRAM_ID_V5.toString()]: {
    name: FarmType.Fusion,
    version: 5,
    ledgerLayout: farmLedgerLayoutV5_2,
    stateLayout: farmStateV5Layout
  },
  [FARM_PROGRAM_ID_V6.toString()]: {
    name: FarmType.Ecosystem,
    version: 6,
    ledgerLayout: farmLedgerLayoutV6_1,
    stateLayout: farmStateV6Layout
  }
}

export type FarmDecodeData =
  | ReturnType<typeof farmStateV3Layout.decode>
  | ReturnType<typeof farmStateV5Layout.decode>
  | ReturnType<typeof farmStateV6Layout.decode>

export const getFarmState = ({ farmData, chainTimeOffset }: { farmData?: FarmDecodeData; chainTimeOffset: number }) => {
  if (!farmData || !farmData.rewardInfos.length) return [false, true]
  farmData.rewardInfos[0].totalReward
  if (farmData.version !== 6) {
    const perSlotRewards = farmData.rewardInfos.map(({ perSlotReward }) => perSlotReward)
    if (perSlotRewards.length === 2 && String(perSlotRewards[0]) === '0' && String(perSlotRewards[1]) === '0') return [false, true]
    if (perSlotRewards.length === 1 && String(perSlotRewards[0]) === '0') return [false, true]
    return [false, false]
  }

  const currentTime = Date.now() + chainTimeOffset
  const rewardInfos = farmData.rewardInfos
  if (rewardInfos.every(({ rewardOpenTime }) => rewardOpenTime.mul(new BN(1000)).gt(new BN(currentTime)))) return [true, false]
  if (rewardInfos.every(({ rewardEndTime }) => rewardEndTime.mul(new BN(1000)).lt(new BN(currentTime)))) return [false, true]
  return [false, false]
}

export function formatFarmData<T = FormatFarmInfoOut>(farm: FormatFarmInfoOut): ConditionalFarmType<T> {
  const farmName =
    getMintSymbol({ mint: farm.symbolMints[0], transformSol: true }) +
    (farm.symbolMints[1] ? '/' + getMintSymbol({ mint: farm.symbolMints[1], transformSol: true }) : '')
  const farmType = FARM_TYPE[farm.programId] || FARM_TYPE[FarmType.Raydium]

  const formattedRewardInfos = farm.rewardInfos.map((r) => {
    const now = dayjs(Date.now() + useAppStore.getState().chainTimeOffset)
    const isV6 = farm.programId === FARM_PROGRAM_ID_V6.toString()
    const openTime = isV6 ? dayjs(Number((r as RewardInfoV6).openTime) * 1000) : now
    const endTime = isV6 ? dayjs(Number((r as RewardInfoV6).endTime) * 1000) : now
    const totalRewards = new Decimal(endTime.diff(openTime, 'seconds'))
      .mul(r.perSecond)
      .div(10 ** r.mint.decimals)
      .toString()
    const ongoing =
      (r as RewardInfoV6).openTime && (r as RewardInfoV6).endTime
        ? openTime.isBefore(now, 'seconds') && endTime.isAfter(now, 'seconds')
        : Number(r.perSecond) > 0
    const ended = isV6 ? endTime.isBefore(now, 'seconds') : Number(r.perSecond) === 0
    const unEmitRewards = new Decimal(Math.max(endTime.diff(now, 'seconds'), 0))
      .mul(r.perSecond)
      .div(10 ** r.mint.decimals)
      .toString()
    return {
      ...r,
      apr: r.apr * 100,
      openTime: openTime.valueOf(),
      endTime: endTime.valueOf(),
      weekly: new Decimal(r.perSecond)
        .mul(60 * 60 * 24 * 7)
        .div(10 ** r.mint.decimals)
        .toString(),
      periodString:
        farm.programId === FARM_PROGRAM_ID_V6.toString() ? `${openTime.format('YYYY/MM/DD')} - ${endTime.format('YYYY/MM/DD')}` : '',
      periodDays: endTime.diff(openTime, 'days'),
      unEmit: unEmitRewards,
      totalRewards,
      mint: {
        ...r.mint,
        symbol: getMintSymbol({ mint: r.mint, transformSol: true })
      },
      upcoming: isV6 ? openTime.isBefore(now) && endTime.isAfter(now) : false,
      ongoing,
      ended
    } as any
  })

  return {
    ...farm,
    farmName,
    symbolMints: farm.symbolMints.map((mint) => ({ ...mint, symbol: getMintSymbol({ mint, transformSol: true }) })),
    formattedRewardInfos,
    isOngoing: formattedRewardInfos.filter((reward) => reward.ongoing).length > 0,
    type: farmType?.name,
    version: farmType?.version
  } as any
}

export function updatePoolInfo(poolInfo: FarmDecodeData, lpVault: SplAccount, slot: number, chainTime: number) {
  if (poolInfo.version === 3 || poolInfo.version === 5) {
    if (poolInfo.lastSlot.gte(new BN(slot))) return poolInfo

    const spread = new BN(slot).sub(poolInfo.lastSlot)
    poolInfo.lastSlot = new BN(slot)

    for (const itemRewardInfo of poolInfo.rewardInfos) {
      if (lpVault.amount.eq(new BN(0))) continue

      const reward = itemRewardInfo.perSlotReward.mul(spread)
      itemRewardInfo.perShareReward = itemRewardInfo.perShareReward.add(
        reward.mul(new BN(10).pow(new BN(poolInfo.version === 3 ? 9 : 15))).div(lpVault.amount)
      )
      itemRewardInfo.totalReward = itemRewardInfo.totalReward.add(reward)
    }
  } else if (poolInfo.version === 6) {
    for (const itemRewardInfo of poolInfo.rewardInfos) {
      if (itemRewardInfo.rewardState.eq(new BN(0))) continue
      const updateTime = BN.min(new BN(chainTime), itemRewardInfo.rewardEndTime)
      if (itemRewardInfo.rewardOpenTime.gte(updateTime)) continue
      const spread = updateTime.sub(itemRewardInfo.rewardLastUpdateTime)
      let reward = spread.mul(itemRewardInfo.rewardPerSecond)
      const leftReward = itemRewardInfo.totalReward.sub(itemRewardInfo.totalRewardEmissioned)
      if (leftReward.lt(reward)) {
        reward = leftReward
        itemRewardInfo.rewardLastUpdateTime = itemRewardInfo.rewardLastUpdateTime.add(leftReward.div(itemRewardInfo.rewardPerSecond))
      } else {
        itemRewardInfo.rewardLastUpdateTime = updateTime
      }
      if (lpVault.amount.eq(new BN(0))) continue
      itemRewardInfo.accRewardPerShare = itemRewardInfo.accRewardPerShare.add(reward.mul(poolInfo.rewardMultiplier).div(lpVault.amount))
      itemRewardInfo.totalRewardEmissioned = itemRewardInfo.totalRewardEmissioned.add(reward)
    }
  }
  return poolInfo
}

export const farmInfoCache: Map<string, FormatFarmInfoOut> = new Map()
export const farmRpcInfoCache: Map<string, FarmDecodeData> = new Map()
