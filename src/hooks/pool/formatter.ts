import { PublicKey } from '@solana/web3.js'
import { ApiV3PoolInfoItem, TickUtils, ApiV3PoolInfoConcentratedItem, ApiV3PoolInfoCountItem } from '@raydium-io/raydium-sdk-v2'
import { getPoolName } from '@/features/Pools/util'
import { wSolToSolString } from '@/utils/token'
import { toTotalPercent } from '@/utils/numberish/toPercentString'
import { trimTrailZero } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import { useAppStore } from '@/store/useAppStore'
import { AprKey, TimeAprData, FormattedPoolInfoItem } from './type'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'

export const formatAprData = (data: ApiV3PoolInfoItem): ApiV3PoolInfoItem => {
  return {
    ...data,
    day: {
      ...data.day,
      apr: data.day.apr ?? 0,
      feeApr: data.day.feeApr ?? 0
    },
    week: {
      ...data.week,
      apr: data.week.apr ?? 0,
      feeApr: data.week.feeApr ?? 0
    },
    month: {
      ...data.month,
      apr: data.month.apr ?? 0,
      feeApr: data.month.feeApr ?? 0
    }
  }
}

export function formatPoolData(pool: ApiV3PoolInfoItem): FormattedPoolInfoItem {
  const allApr: TimeAprData = Object.values(AprKey).reduce(
    (acc, cur) => {
      const aprData = pool[cur]
      return {
        ...acc,
        [cur]: [
          {
            apr: aprData.feeApr ?? 0,
            percent: toTotalPercent(aprData.feeApr ?? 0, aprData.apr ?? 0),
            isTradingFee: true
          },
          ...aprData.rewardApr.map((r, idx) => ({
            apr: r,
            percent: toTotalPercent(r, aprData.apr ?? 0),
            token: { ...pool.rewardDefaultInfos[idx].mint }
          }))
        ]
      }
    },
    {
      [AprKey.Day]: [],
      [AprKey.Week]: [],
      [AprKey.Month]: []
    }
  )

  const weeklyRewards = pool.rewardDefaultInfos.map((r) => {
    const amount = new Decimal(r.perSecond || 0).mul(60 * 60 * 24 * 7).div(10 ** r.mint.decimals)
    return {
      orgAmount: amount.toString(),
      amount: trimTrailZero(amount.toFixed(r.mint.decimals)) as string,
      token: r.mint,
      startTime: r.startTime,
      endTime: r.endTime
    }
  })
  const formattedRewardInfos = pool.rewardDefaultInfos.map((r) => {
    const apr = allApr[AprKey.Day].find((data) => data.token?.address === r.mint.address)?.apr || 0
    const now = dayjs(Date.now() + useAppStore.getState().chainTimeOffset)
    const openTime = r.startTime ? dayjs(r.startTime * 1000) : now
    const endTime = r.endTime ? dayjs(r.endTime * 1000) : now
    const totalRewards = new Decimal(r.perSecond || 0)
      .mul(endTime.diff(openTime, 'seconds'))
      .div(10 ** r.mint.decimals)
      .toString()
    const ongoing = openTime.isBefore(now, 'seconds') && endTime.isAfter(now, 'seconds')
    const ended = endTime.isBefore(now, 'seconds') || r.perSecond <= 0
    const unEmitRewards = new Decimal(Math.max(endTime.diff(now, 'seconds'), 0))
      .mul(r.perSecond || 0)
      .div(10 ** r.mint.decimals)
      .toString()

    return {
      ...r,
      apr,
      startTime: openTime.valueOf(),
      endTime: endTime.valueOf(),
      weekly: new Decimal(r.perSecond || 0)
        .mul(60 * 60 * 24 * 7)
        .div(10 ** r.mint.decimals)
        .toString(),
      periodString: `${openTime.format('YYYY/MM/DD')} - ${endTime.format('YYYY/MM/DD')}`,
      periodDays: endTime.diff(openTime, 'days'),
      unEmit: unEmitRewards,
      totalRewards,
      upcoming: r.startTime ? openTime.isBefore(now) : false,
      ongoing,
      ended,
      mint: {
        ...r.mint,
        symbol: getMintSymbol({ mint: r.mint, transformSol: true })
      }
    }
  })

  const poolDecimals = Math.max(pool.mintA.decimals, pool.mintB.decimals)
  const recommendDecimal = (val: number | string | Decimal) => {
    const valDecimal = new Decimal(val)
    if (valDecimal.gte(1000)) return 2
    if (valDecimal.gte(10)) return 4
    return poolDecimals
  }

  return {
    ...formatAprData(pool),
    poolName: getPoolName(pool),
    poolDecimals,
    recommendDecimal,
    isOpenBook: pool.pooltype.includes('OpenBookMarket'),
    mintA: {
      ...pool.mintA,
      symbol: wSolToSolString(pool.mintA.symbol) || pool.mintA.address.substring(0, 6)
    },
    mintB: {
      ...pool.mintB,
      symbol: wSolToSolString(pool.mintB.symbol) || pool.mintB.address.substring(0, 6)
    },
    weeklyRewards,
    allApr,
    totalApr: {
      [AprKey.Day]: allApr[AprKey.Day].reduce((a, { apr: b }) => a + Number(b), 0),
      [AprKey.Week]: allApr[AprKey.Week].reduce((a, { apr: b }) => a + Number(b), 0),
      [AprKey.Month]: allApr[AprKey.Month].reduce((a, { apr: b }) => a + Number(b), 0)
    },
    formattedRewardInfos,
    isRewardEnded: !formattedRewardInfos.some((r) => !r.ended)
  }
}

export const poolInfoCache: Map<string, ApiV3PoolInfoItem> = new Map()

export const getTickArrayAddress = (props: { pool: ApiV3PoolInfoConcentratedItem; tickNumber: number }) =>
  TickUtils.getTickArrayAddressByTick(
    new PublicKey(props.pool.programId),
    new PublicKey(props.pool.id),
    props.tickNumber,
    props.pool.config.tickSpacing
  )
