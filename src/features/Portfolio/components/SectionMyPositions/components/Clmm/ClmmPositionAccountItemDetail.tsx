import { Flex, useDisclosure, Collapse, Divider, Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'
import { AprKey, FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { formatCurrency } from '@/utils/numberish/formatter'
import { AprData } from '@/features/Clmm/utils/calApr'
import EstimatedApr from './ClmmPositionAccountItemDetail/EstimatedApr'
import PendingYield from './ClmmPositionAccountItemDetail/PendingYield'
import { useEvent } from '@/hooks/useEvent'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import useWindowDimensions from '@/hooks/useWindowDimensions'
import { colors } from '@/theme/cssVariables'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import LiquidityChartRangeInput from '@/features/Clmm/components/LiquidityChartRangeInput'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { debounce } from '@/utils/functionMethods'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'

type DetailProps = {
  isViewOpen: boolean
  poolInfo: FormattedPoolInfoConcentratedItem
  timeBasis: AprKey
  onTimeBasisChange?: (val: AprKey) => void
  aprData: AprData
  position: ClmmPosition
  nftMint: string
  baseIn: boolean
  hasReward: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
}

const emptyObj = {}

export default function ClmmPositionAccountItemDetail({
  isViewOpen,
  poolInfo,
  position,
  timeBasis,
  aprData,
  nftMint,
  baseIn,
  hasReward,
  rewardInfos,
  onTimeBasisChange,
  onHarvest
}: DetailProps) {
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const { isMobile } = useWindowDimensions(1152)
  const { t } = useTranslation()
  const [chartTag, setChartTag] = useState(Date.now())

  const { getPriceAndAmount } = useClmmBalance({})
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })
  const positionDetailInfo = getPriceAndAmount({ poolInfo, position })
  const price = baseIn ? poolInfo.price : new Decimal(1).div(poolInfo.price).toNumber()
  const timePriceMin = baseIn ? poolInfo.day.priceMin : poolInfo.day.priceMax ? new Decimal(1).div(poolInfo.day.priceMax).toNumber() : 0
  const timePriceMax = baseIn ? poolInfo.day.priceMax : poolInfo.day.priceMin ? new Decimal(1).div(poolInfo.day.priceMin).toNumber() : 0

  const volumeA = positionDetailInfo.amountA.mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
  const volumeB = positionDetailInfo.amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0)

  const [priceLower, priceUpper] = useMemo(() => {
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
    return [priceLower.toString(), priceUpper.toString()]
  }, [baseIn, positionDetailInfo.priceLower, positionDetailInfo.priceUpper])

  useEffect(() => {
    const fn = debounce(() => setChartTag(Date.now()), 300)
    const { cancel } = onWindowSizeChange(fn)
    return cancel
  }, [])

  const handleHarvest = useEvent(() => {
    onHarvest({
      onSend,
      onFinally
    })
  })

  return (
    <Collapse in={isViewOpen} animateOpacity unmountOnExit={true}>
      <Flex
        p={2}
        bg={colors.modalContainerBg}
        border={`1px solid ${colors.selectInactive}`}
        borderTop="none"
        borderRadius="xl"
        borderTopRadius="none"
      >
        <Flex
          flexDirection={['column', 'row']}
          w="full"
          gap={[2, 4, 8]}
          bg={colors.backgroundDark}
          borderRadius="xl"
          justify="center"
          py={[3]}
          px={[3]}
        >
          {/* chart */}
          <Box flex={1.5} py={3}>
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
              containerStyle={{
                paddingLeft: '1.25rem'
              }}
            />

            {/* info head */}
            <Flex fontSize="xs" justifyContent={'center'} mt={3}>
              <VStack align="start" gap={1}>
                <HStack>
                  <Divider borderColor={colors.backgroundApp} opacity="1" width="6px" borderBottomWidth="2px" />
                  <Text color={colors.textSecondary}>{t('field.current_price')}: </Text>
                  <Text color={colors.lightPurple} fontWeight="medium">
                    <Text as="span" color={colors.textPrimary}>
                      {baseIn
                        ? formatCurrency(poolInfo.price, {
                            decimalPlaces: poolInfo.recommendDecimal(poolInfo.price)
                          })
                        : formatCurrency(new Decimal(1).div(poolInfo.price).toString(), {
                            decimalPlaces: poolInfo.recommendDecimal(new Decimal(1).div(poolInfo.price).toString())
                          })}
                    </Text>{' '}
                    {t('common.per_unit', {
                      subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
                      subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
                    })}
                  </Text>
                </HStack>

                <HStack>
                  <Divider borderColor={colors.textPurple} opacity="1" width="6px" borderBottomWidth="2px" />
                  <Text color={colors.textSecondary}>{t('clmm.time_price_range', { time: '24h' })}: </Text>
                  <Text color={colors.textPrimary} fontWeight="medium">
                    {`[${formatCurrency(timePriceMin, {
                      decimalPlaces: poolInfo.poolDecimals
                    })},${formatCurrency(timePriceMax, {
                      decimalPlaces: poolInfo.poolDecimals
                    })}]`}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </Box>
          <Divider borderWidth="1px" borderColor={colors.lightPurple} opacity="0.5" orientation="vertical" />
          {/* info detail */}
          <VStack fontSize="sm" flex={1} spacing={3} py={3}>
            <Flex flexDirection="column" flex={1} w="full" gap={4} justifyContent="space-between">
              <Flex justifyContent="space-between">
                <HStack>
                  <TokenAvatar size="sm" token={poolInfo.mintA} />
                  <Text>{formatCurrency(positionDetailInfo.amountA, { decimalPlaces: poolInfo.mintA.decimals })}</Text>
                  <Text color={colors.lightPurple}>{poolInfo.mintA.symbol}</Text>
                </HStack>
                <Text textAlign="right" minW="79px">
                  {formatCurrency(volumeA, { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <HStack>
                  <TokenAvatar size="sm" token={poolInfo.mintB} />
                  <Text>{formatCurrency(positionDetailInfo.amountB, { decimalPlaces: poolInfo.mintB.decimals })}</Text>
                  <Text color={colors.lightPurple}>{poolInfo.mintB.symbol}</Text>
                </HStack>
                <Text textAlign="right" minW="79px">
                  {formatCurrency(volumeB, { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Flex>
              <Flex
                direction={['column', 'column', 'row']}
                wordBreak={'break-all'}
                color={colors.textSecondary}
                justifyContent="center"
                gap={0.5}
              >
                <Text>{t('clmm.nft_mint_address')}: </Text>
                <AddressChip
                  address={nftMint}
                  canCopy
                  canExternalLink
                  iconProps={{
                    color: colors.textLink
                  }}
                />
              </Flex>
            </Flex>
            <Divider borderWidth="1px" borderColor={colors.lightPurple} opacity="0.5" />
            <Flex flex={1} flexDirection="column" w="full" justifyContent="space-between">
              <Flex justifyContent="space-between">
                <Text color={colors.textSecondary}> {t('liquidity.pool_liquidity')}</Text>
                <Text color={colors.textPrimary}>{formatCurrency(poolInfo.tvl, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color={colors.textSecondary}>{t('common.24h_volume')}</Text>
                <Text color={colors.textPrimary}>
                  {formatCurrency(poolInfo.day.volume, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color={colors.textSecondary}>{t('common.24h_volume')}</Text>
                <Text color={colors.textPrimary}>
                  {formatCurrency(poolInfo.day.volumeFee, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                </Text>
              </Flex>
            </Flex>
          </VStack>
          <Divider borderWidth="1px" borderColor={colors.lightPurple} opacity="0.5" orientation="vertical" />
          <Flex direction="column" flex={1} gap={4} py={3} w="full" overflow="hidden">
            <EstimatedApr
              isMobile={isMobile}
              timeAprData={poolInfo.allApr}
              aprData={aprData}
              timeBasis={timeBasis}
              onTimeBasisChange={onTimeBasisChange}
              poolId={poolInfo.id}
            />
            <PendingYield isLoading={isLoading} hasReward={hasReward} rewardInfos={rewardInfos} onHarvest={handleHarvest} />
          </Flex>
        </Flex>
      </Flex>
    </Collapse>
  )
}
