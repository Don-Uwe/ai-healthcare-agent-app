import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import LiquidityChartRangeInput from '@/features/Clmm/components/LiquidityChartRangeInput'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { colors } from '@/theme/cssVariables'
import { toVolume } from '@/utils/numberish/autoSuffixNumberish'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { getTimeBasis } from '@/utils/time'
import { toAPRPercent } from '@/features/Pools/util'
import { debounce } from '@/utils/functionMethods'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'
import { Badge, Box, Flex, FlexProps, HStack, Text, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type RangeChartProps = FlexProps & {
  poolInfo: FormattedPoolInfoConcentratedItem
  positionData: ClmmPosition
  baseIn?: boolean
  nftMint: string
  timeBasisIdx?: number
}

const emptyObj = {}

export default function RangeChart({ poolInfo, positionData, baseIn = true, nftMint, timeBasisIdx = 0, ...rest }: RangeChartProps) {
  const { t } = useTranslation()
  const [chartTag, setChartTag] = useState(Date.now())
  const { getPriceAndAmount } = useClmmBalance({})
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })
  const positionDetailInfo = getPriceAndAmount({ poolInfo, position: positionData })
  const price = baseIn ? poolInfo.price : new Decimal(1).div(poolInfo.price).toNumber()
  const timePriceMin = baseIn ? poolInfo.day.priceMin : poolInfo.day.priceMax ? new Decimal(1).div(poolInfo.day.priceMax).toNumber() : 0
  const timePriceMax = baseIn ? poolInfo.day.priceMax : poolInfo.day.priceMin ? new Decimal(1).div(poolInfo.day.priceMin).toNumber() : 0

  const volumeA = positionDetailInfo.amountA.mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
  const volumeB = positionDetailInfo.amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0)
  const totalVolume = volumeA.add(volumeB)

  const [priceLower, priceUpper, recommendDecimal] = useMemo(() => {
    if (baseIn)
      return [
        positionDetailInfo.priceLower.price.toString(),
        positionDetailInfo.priceUpper.price.toString(),
        Math.max(
          poolInfo.recommendDecimal(positionDetailInfo.priceLower.price),
          poolInfo.recommendDecimal(positionDetailInfo.priceUpper.price)
        )
      ]
    const [priceLower, priceUpper] = [
      new Decimal(1).div(positionDetailInfo.priceUpper.price),
      new Decimal(1).div(positionDetailInfo.priceLower.price)
    ]
    return [
      priceLower.toString(),
      priceUpper.toString(),
      Math.max(poolInfo.recommendDecimal(priceLower), poolInfo.recommendDecimal(priceUpper))
    ]
  }, [baseIn, positionDetailInfo.priceLower, positionDetailInfo.priceUpper])

  const inRange = new Decimal(priceLower).lt(poolInfo.price) && new Decimal(priceUpper).gt(poolInfo.price)
  const allVolume = volumeA.add(volumeB)
  const percentA = allVolume.isZero() ? 0 : new Decimal(volumeA).div(volumeA.add(volumeB)).mul(100).toDecimalPlaces(1).toNumber()
  const percentB = allVolume.isZero() ? 0 : 100 - percentA

  useEffect(() => {
    const fn = debounce(() => setChartTag(Date.now()), 300)
    const { cancel } = onWindowSizeChange(fn)
    return cancel
  }, [])

  return (
    <Flex
      flexDirection={['column', 'row']}
      gap={8}
      bg={colors.backgroundDark}
      borderRadius="12px"
      justify="center"
      py={[5, 6]}
      px={[4, 10]}
      {...rest}
    >
      {/* chart */}
      <Box flex={1}>
        <LiquidityChartRangeInput
          key={chartTag}
          poolId={poolInfo.id}
          feeAmount={poolInfo.feeRate * 1000000}
          ticksAtLimit={emptyObj}
          price={price}
          priceLower={priceLower}
          priceUpper={priceUpper}
          timePriceMin={timePriceMin}
          timePriceMax={timePriceMax}
          interactive={false}
          baseIn={baseIn}
          autoZoom={true}
        />

        {/* info head */}
        <HStack fontSize="sm" justifyContent={'space-between'}>
          <HStack>
            <Text color={colors.textSecondary}>{t('liquidity.title')}</Text>
            <Text color={colors.textPrimary}>{toUsdVolume(poolInfo.tvl, { useShorterExpression: true })}</Text>
          </HStack>

          <HStack>
            <Text color={colors.textSecondary}>
              {getTimeBasis(timeBasisIdx)} {t('common.volume')}
            </Text>
            <Text color={colors.textPrimary}>{toUsdVolume(poolInfo.day.volume, { useShorterExpression: true })}</Text>
          </HStack>
        </HStack>
      </Box>

      {/* info detail */}
      <VStack align={'stretch'} alignSelf={['unset', 'end']} fontSize="sm" flex={1} spacing={4}>
        <VStack align={'stretch'} spacing={1.5}>
          <Flex gap={2} color={colors.textSecondary} justifyContent="space-between">
            <Box>{t('liquidity.my_position')}</Box>
            <Box>{toUsdVolume(totalVolume.toString())}</Box>
          </Flex>
          <Flex gap={2} mt={1} justifyContent="space-between">
            <HStack>
              <TokenAvatar size="sm" token={poolInfo.mintA} />
              <Text>{toVolume(positionDetailInfo.amountA, { decimals: poolInfo.mintA.decimals })}</Text>
              <Text color={colors.textSecondary}>{poolInfo.mintA.symbol}</Text>
            </HStack>
            <Flex textAlign="right" justifyContent="space-between" gap="1.5" minW="79px">
              {toUsdVolume(volumeA)}
              <Box as="span" color={colors.textSecondary}>
                {toAPRPercent(percentA, { decimalMode: 'trim' })}
              </Box>
            </Flex>
          </Flex>
          <Flex gap={2} justifyContent="space-between">
            <HStack>
              <TokenAvatar size="sm" token={poolInfo.mintB} />
              <Text>{toVolume(positionDetailInfo.amountB, { decimals: poolInfo.mintB.decimals })}</Text>
              <Text color={colors.textSecondary}>{poolInfo.mintB.symbol}</Text>
            </HStack>
            <Flex textAlign="right" justifyContent="space-between" gap="1.5" minW="79px">
              {toUsdVolume(volumeB)}
              <Box as="span" color={colors.textSecondary}>
                {toAPRPercent(percentB, { decimalMode: 'trim' })}
              </Box>
            </Flex>
          </Flex>
        </VStack>

        <HStack>
          <Text>{t('clmm.my_range')}</Text>
          <Badge variant={inRange ? 'ok' : 'error'}>{t(inRange ? 'clmm.in_range' : 'clmm.out_of_range')}</Badge>
        </HStack>

        <HStack>
          <Text>
            {new Decimal(priceLower).toDecimalPlaces(recommendDecimal).toNumber()} -{' '}
            {new Decimal(priceUpper).toDecimalPlaces(recommendDecimal).toNumber()}
          </Text>
          <Text color={colors.textTertiary}>
            {poolInfo[baseIn ? 'mintB' : 'mintA'].symbol} per {poolInfo[baseIn ? 'mintA' : 'mintB'].symbol}
          </Text>
        </HStack>

        <HStack wordBreak={'break-all'} color={colors.textTertiary}>
          <Text>{t('clmm.nft_mint_address')}: </Text>
          <AddressChip address={nftMint} canCopy canExternalLink />
        </HStack>
      </VStack>
    </Flex>
  )
}
