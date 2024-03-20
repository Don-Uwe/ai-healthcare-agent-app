import { useMemo } from 'react'
import { Heading, SimpleGrid } from '@chakra-ui/react'
import { useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import useClmmPortfolioData from '@/hooks/portfolio/clmm/useClmmPortfolioData'
import useAllStandardPoolPosition from '@/hooks/portfolio/useAllStandardPoolPosition'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import PortfolioIdle, { IdleType } from './components/PortfolioIdle'
import PortfolioInfo from './components/PortfolioInfo'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

export enum AssetType {
  STANDARD = 'Standard',
  CONCENTRATED = 'Concentrated',
  ALL = 'All'
}
export default function SectionOverview() {
  const { t } = useTranslation()
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [getTokenBalanceUiAmount, tokenAccounts] = useTokenAccountStore((s) => [s.getTokenBalanceUiAmount, s.tokenAccounts])
  const { data: tokenPrices } = useTokenPrice({
    mintList: tokenAccounts
      .filter((tokenAccount) => (tokenAccount.isNative || tokenAccount.isAssociated) && !tokenAccount.amount.isZero())
      .map((a) => a.mint)
  })

  const { data: clmmPoolAssets, totalUSD: totalClmmPosition, clmmBalanceByMint } = useClmmPortfolioData({ type: AssetType.CONCENTRATED })
  const {
    data: standardPoolList,
    standardPoolListByMint,
    totalUSD: totalStandardPosition
  } = useAllStandardPoolPosition({ type: AssetType.STANDARD })

  const productiveBalance = totalClmmPosition.add(totalStandardPosition).toString()

  const idleList: IdleType[] = useMemo(() => {
    return (
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
        // .concat(idleLpMintList)
        .sort((a, b) => new Decimal(b.amountInUSD).sub(a.amountInUSD).toNumber()) ?? []
    )
  }, [tokenAccounts, getTokenBalanceUiAmount, tokenMap, tokenPrices])

  const idleBalance = useMemo(() => idleList.reduce((acc, cur) => acc.add(cur.amountInUSD), new Decimal(0)), [idleList])

  const tokenAssetsNew = useMemo(() => {
    const total = { ...clmmBalanceByMint }
    Object.keys(standardPoolListByMint).forEach((key) => {
      const data = standardPoolListByMint[key]
      total[key] = {
        mint: total[key]?.mint || data.mint,
        amount: new Decimal(total[key]?.amount || 0).add(data.amount).toString(),
        usd: new Decimal(total[key]?.usd || 0).add(data.usd).toString()
      }
    })
    const allUSD = Object.values(total).reduce((acc, cur) => acc.add(cur.usd), new Decimal(0))

    return Object.values(total).map((data) => ({
      key: data.mint?.symbol || data.mint.address.slice(0, 6),
      value: data.usd,
      percentage: new Decimal(data.usd).div(allUSD).mul(100).toDecimalPlaces(2).toNumber()
    }))
  }, [clmmBalanceByMint, standardPoolListByMint])

  return (
    <>
      <Heading id="overview" fontSize={['lg', 'xl']} fontWeight="500" mb={[2, 4]} mt={[3, 6]} color={colors.textPrimary}>
        {t('portfolio.section_overview')}
      </Heading>
      <SimpleGrid templateColumns={'1fr 1fr'} gap={[3, 8]} overflow={['scroll']} mx={[-5, 0]} px={[5, 0]} scrollSnapType={'x'}>
        <PortfolioInfo poolAssets={[...standardPoolList, ...clmmPoolAssets]} tokenAssets={tokenAssetsNew} />
        <PortfolioIdle idleBalance={idleBalance.toString()} productiveBalance={productiveBalance} idleList={idleList} />
      </SimpleGrid>
    </>
  )
}
