import { useMemo } from 'react'
import { useTokenAccountStore, useTokenStore } from '@/store'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import Decimal from 'decimal.js'
import { IdleType } from '@/features/Portfolio/components/SectionOverview/components/PortfolioIdle'

const displayCount = 3

export default function useTokenBalance() {
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [getTokenBalanceUiAmount, tokenAccounts] = useTokenAccountStore((s) => [s.getTokenBalanceUiAmount, s.tokenAccounts])
  const { data: tokenPrices } = useTokenPrice({
    mintList: tokenAccounts
      .filter((tokenAccount) => (tokenAccount.isNative || tokenAccount.isAssociated) && !tokenAccount.amount.isZero())
      .map((a) => a.mint)
  })

  const idleList: IdleType[] = useMemo(() => {
    const allBalance =
      tokenAccounts
        .filter((tokenAccount) => tokenAccount.isNative || tokenAccount.isAssociated)
        .map((tokenAccount) => {
          const uiAmount = getTokenBalanceUiAmount({ mint: tokenAccount.mint })
          const tokenMint = tokenAccount.mint.toString()
          const token = tokenMap.get(tokenMint)
          if (!token) {
            return {
              token: {
                decimals: 0,
                chainId: 101,
                symbol: tokenMint.slice(0, 6),
                address: tokenMint,
                programId: '',
                logoURI: '',
                name: tokenMint.slice(0, 6),
                tags: [],
                extensions: {}
              },
              address: tokenAccount.mint.toString(),
              isZero: true,
              amount: uiAmount.text,
              amountInUSD: '0'
            }
          }

          return {
            token,
            address: tokenAccount.mint.toString(),
            isZero: uiAmount.isZero,
            amount: uiAmount.text,
            amountInUSD: new Decimal(uiAmount.text).mul(tokenPrices[tokenMint]?.value || 0).toString()
          } as IdleType & { isZero: boolean }
        })
        .filter((item) => !item.isZero)
        .sort((a, b) => new Decimal(b.amountInUSD).sub(a.amountInUSD).toNumber()) ?? []
    const top5 = allBalance.slice(0, displayCount)
    const last5 = allBalance.slice(displayCount, allBalance.length).reduce(
      (acc: any, cur: IdleType) =>
        ({
          ...acc,
          token: {
            decimals: 0,
            chainId: 101,
            symbol: 'Others',
            address: '',
            programId: '',
            logoURI: '',
            name: 'Others',
            tags: [],
            extensions: {}
          },
          address: '',
          isZero: !acc || new Decimal(acc.amountInUSD || 0).add(cur.amountInUSD).isZero(),
          amount: '0',
          amountInUSD: new Decimal(acc?.amountInUSD || 0).add(cur.amountInUSD).toString()
        } as IdleType),
      {}
    )

    return allBalance.length > displayCount ? [...top5, last5] : top5
  }, [tokenAccounts, getTokenBalanceUiAmount, tokenMap, tokenPrices])

  const idleBalance = useMemo(() => idleList.reduce((acc, cur) => acc.add(cur.amountInUSD), new Decimal(0)), [idleList])

  return {
    idleList,
    idleBalance
  }
}
