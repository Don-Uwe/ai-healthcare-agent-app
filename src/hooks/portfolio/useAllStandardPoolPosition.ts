import { useMemo } from 'react'
import { RAYMint, ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import { useTokenAccountStore, useTokenStore } from '@/store'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchAccLpMint from '@/hooks/token/useFetchAccLpMint'
import useTokenPrice from '@/hooks/token/useTokenPrice'

import Decimal from 'decimal.js'

export default function useAllStandardPoolPosition<T>({ type }: { type?: T }) {
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const tokenPriceRecord = useTokenStore((s) => s.tokenPriceRecord)

  const { lpBasedData } = useFarmPositions({})
  const allLpInfo = new Map(
    Array.from(lpBasedData.values())
      .filter((d) => d.hasAmount && d.lpMint !== RAYMint.toString())
      .map((data) => {
        return [
          data.lpMint,
          {
            staked: data.totalLpAmount,
            unStaked: '0'
          }
        ]
      })
  )
  const { data: lpMintList, lpPoolInfo: poolList } = useFetchAccLpMint({ fetchLpPoolInfo: true })

  lpMintList.forEach((lpMintData) => {
    const lpMint = lpMintData.address.toString()
    const stakedData = allLpInfo.get(lpMint)
    const balance = getTokenBalanceUiAmount({
      mint: lpMint,
      decimals: poolList.find((p) => p.lpMint.address === lpMint)?.lpMint.decimals || 6
    })
    if (balance.isZero) return

    if (stakedData) {
      allLpInfo.set(lpMint, { ...stakedData, unStaked: balance.rawAmount.toString() })
      return
    }
    allLpInfo.set(lpMint, {
      staked: '0',
      unStaked: balance.rawAmount.toString()
    })
  })

  const [standardPoolList, standardPoolListByMint] = useMemo(() => {
    const dataByMint: { [key: string]: { mint: ApiV3Token; amount: string; usd: string } } = {}
    const data = Array.from(allLpInfo.entries())
      .map(([key, data]) => {
        const pool = poolList.find((p) => p.lpMint.address === key)
        if (!pool)
          return {
            key: '',
            value: '0',
            type,
            percentage: 0
          }

        const totalLp = new Decimal(data.staked).add(data.unStaked).div(10 ** pool.lpMint.decimals)
        const baseAmount = new Decimal(pool.mintAmountA).div(pool.lpAmount || 1).mul(totalLp)
        const quoteAmount = new Decimal(pool.mintAmountB).div(pool.lpAmount || 1).mul(totalLp)
        const baseUsdValue = baseAmount.mul(tokenPriceRecord.get(pool.mintA.address)?.data?.value || 0)
        const quoteUsdValue = quoteAmount.mul(tokenPriceRecord.get(pool.mintB.address)?.data?.value || 0)

        dataByMint[pool.mintA.address] = {
          mint: pool.mintA,
          amount: new Decimal(dataByMint[pool.mintA.address]?.amount || 0).add(baseAmount).toString(),
          usd: new Decimal(dataByMint[pool.mintA.address]?.usd || 0).add(baseUsdValue).toString()
        }

        dataByMint[pool.mintB.address] = {
          mint: pool.mintB,
          amount: new Decimal(dataByMint[pool.mintB.address]?.amount || 0).add(quoteAmount).toString(),
          usd: new Decimal(dataByMint[pool.mintB.address]?.usd || 0).add(quoteUsdValue).toString()
        }

        return {
          key: pool.poolName.replace(' - ', '/'),
          value: baseUsdValue.add(quoteUsdValue).toDecimalPlaces(4).toString(),
          type,
          percentage: 0
        }
      })
      .filter((d) => !!d && !!d.key)
    return [data, dataByMint]
  }, [lpBasedData, poolList, tokenPriceRecord])

  useTokenPrice({
    mintList: Object.keys(standardPoolListByMint)
  })

  const allValue = standardPoolList.reduce((acc, data) => acc.add(new Decimal(data.value)), new Decimal(0))
  standardPoolList.forEach((data) => (data.percentage = new Decimal(data.value).div(allValue).mul(100).toDecimalPlaces(2).toNumber()))

  const idleLpMintList = useMemo(
    () =>
      lpMintList
        .filter((lpMint) => {
          const pool = poolList.find((p) => p.lpMint.address === lpMint.address.toString())
          return (
            pool &&
            pool.farmOngoingCount > 0 &&
            !getTokenBalanceUiAmount({
              mint: pool.lpMint.address,
              decimals: pool.lpMint.decimals
            }).isZero
          )
        })
        .map((lpMint) => {
          const pool = poolList.find((p) => p.lpMint.address === lpMint.address.toString())!
          const balance = getTokenBalanceUiAmount({
            mint: pool.lpMint.address,
            decimals: pool.lpMint.decimals
          })

          return {
            token: pool.lpMint,
            address: pool.lpMint.address.toString(),
            isZero: balance.isZero,
            amount: balance.text,
            amountInUSD: new Decimal(balance.text).mul(pool.lpPrice || 0).toString()
          }
        }),
    [lpMintList, poolList, getTokenBalanceUiAmount]
  )

  return {
    totalUSD: allValue,
    data: standardPoolList,
    standardPoolListByMint,
    idleLpMintList
  }
}
