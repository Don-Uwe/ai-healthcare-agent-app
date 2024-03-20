import { UserPositionAccount, Price } from '@raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'

export const checkYielding = (tokenPrice: Record<string, Price>, position?: UserPositionAccount) => {
  const res = {
    harvestable: false,
    pendingYield: new Decimal(0)
  }
  if (!position) return res

  const poolRewards = position.rewardInfos.map((r) => {
    if (!r.pendingReward || r.pendingReward?.isZero())
      return {
        token: r.pendingReward?.token,
        volume: new Decimal(0)
      }
    res.harvestable = true
    return {
      token: r.pendingReward?.token,
      volume: new Decimal(r.pendingReward.toFixed())
        .mul(tokenPrice[r.pendingReward.token.mint.toBase58()].toFixed())
        .div(10 ** r.pendingReward.token.decimals)
    }
  })

  const [tokenAmountA, tokenAmountB] = [position.tokenFeeAmountA, position.tokenFeeAmountB]
  res.harvestable = res.harvestable || (!!tokenAmountA && !tokenAmountA.isZero()) || (!!tokenAmountB && !tokenAmountB.isZero())
  const feeRewards = [
    ...(tokenAmountA
      ? [
          {
            token: tokenAmountA.token,
            volume: new Decimal(tokenAmountA.toFixed() || 0)
              .mul(tokenPrice[tokenAmountA.token.mint.toBase58()].toFixed())
              .div(10 ** tokenAmountA.token.decimals)
          }
        ]
      : []),
    ...(tokenAmountB
      ? [
          {
            token: tokenAmountB.token,
            volume: new Decimal(tokenAmountB.toFixed() || 0)
              .mul(tokenPrice[tokenAmountB.token.mint.toBase58()].toFixed())
              .div(10 ** tokenAmountB.token.decimals)
          }
        ]
      : [])
  ]

  res.pendingYield = poolRewards.concat(feeRewards).reduce((acc, { volume }) => acc.plus(volume), new Decimal(0))

  return res
}
