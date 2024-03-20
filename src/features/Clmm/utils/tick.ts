import { TickUtils, ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'

export function getPriceBoundary({ baseIn, poolInfo }: { baseIn: boolean; poolInfo: ApiV3PoolInfoConcentratedItem }):
  | {
      priceLowerTick: number
      priceLower: Decimal
      priceUpperTick: number
      priceUpper: Decimal
    }
  | undefined {
  try {
    const decimals = Math.max(poolInfo.mintA.decimals ?? 0, poolInfo.mintB.decimals ?? 0, 10)
    const minNumber = new Decimal(1 / 10 ** decimals)
    const currentPrice = new Decimal(poolInfo.price)
    const trimMin = currentPrice.mul(1 - poolInfo.config.defaultRange).clamp(minNumber, Number.MAX_SAFE_INTEGER)
    const trimMax = currentPrice.mul(1 + poolInfo.config.defaultRange).clamp(minNumber, Number.MAX_SAFE_INTEGER)

    const { price: priceMin, tick: tickMin } = TickUtils.getPriceAndTick({
      poolInfo,
      baseIn: true,
      price: trimMin
    })
    const { price: priceMax, tick: tickMax } = TickUtils.getPriceAndTick({
      poolInfo,
      baseIn: true,
      price: trimMax
    })

    if (!baseIn) {
      return {
        priceLowerTick: tickMax,
        priceLower: new Decimal(1).div(priceMax),
        priceUpperTick: tickMin,
        priceUpper: new Decimal(1).div(priceMin)
      }
    }

    return {
      priceLowerTick: tickMin,
      priceLower: priceMin,
      priceUpperTick: tickMax,
      priceUpper: priceMax
    }
  } catch (err) {
    return
  }
}
