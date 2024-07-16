import Decimal from 'decimal.js'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import Close from '@/icons/misc/Close'
import { colors } from '@/theme/cssVariables'
import { AprKey } from '@/hooks/pool/type'
import { AprData } from '@/features/Clmm/utils/calApr'
import {
  Button,
  Badge,
  Box,
  Flex,
  Text,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import EstimatedApr from './ClmmPositionAccountItemDetail/EstimatedApr'
import PendingYield from './ClmmPositionAccountItemDetail/PendingYield'
import PoolInfoDrawerFace from './ClmmPositionAccountItemDetail/PoolInfoDrawerFace'
import { useEvent } from '@/hooks/useEvent'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import LiquidityChartRangeInput from '@/features/Clmm/components/LiquidityChartRangeInput'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { getTimeBasis } from '@/utils/time'
import { toAPRPercent } from '@/features/Pools/util'
import { debounce } from '@/utils/functionMethods'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'

type DetailProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  aprData: AprData
  timeBasis: AprKey
  onTimeBasisChange?: (val: AprKey) => void
  nftMint: string
  totalPendingYield: string
  baseIn: boolean
  hasReward?: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickCloseButton: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickMinusButton: () => void
  onClickPlusButton: () => void
  onClickViewTrigger: () => void
}

const emptyObj = {}

export default function ClmmPositionAccountItemDetailMobileDrawer({
  poolInfo,
  position,
  nftMint,
  aprData,
  totalPendingYield,
  baseIn,
  timeBasis,
  onTimeBasisChange,
  hasReward,
  rewardInfos,
  onHarvest,
  onClickCloseButton,
  onClickMinusButton,
  onClickPlusButton,
  onClickViewTrigger
}: DetailProps) {
  const { t } = useTranslation()
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const { isOpen: isCloseLoading, onOpen: onCloseSend, onClose: onCloseFinally } = useDisclosure()
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
  const totalVolume = volumeA.add(volumeB)
  const timeBasisIdx = 0
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

  const inRange = new Decimal(priceLower).lt(price) && new Decimal(priceUpper).gt(price)
  const allVolume = volumeA.add(volumeB)
  const percentA = allVolume.isZero() ? 0 : new Decimal(volumeA).div(volumeA.add(volumeB)).mul(100).toDecimalPlaces(1).toNumber()
  const percentB = allVolume.isZero() ? 0 : 100 - percentA

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

  const handleClose = useEvent(() => {
    onClickCloseButton({
      onSend: onCloseSend,
      onFinally: onCloseFinally
    })
  })

  return (
    <Drawer isOpen={true} variant="popFromBottom" placement="bottom" onClose={onClickViewTrigger}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader visibility="hidden">Position Detail</DrawerHeader>
        <DrawerBody>
          <VStack gap={4}>
            <PoolInfoDrawerFace poolInfo={poolInfo} baseIn={baseIn} position={position}></PoolInfoDrawerFace>
            <Flex
              flexDirection={['column', 'row']}
              gap={8}
              bg={colors.backgroundDark}
              borderRadius="12px"
              justify="center"
              py={5}
              px={4}
              w={'full'}
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
                    <Text color={colors.textPrimary}>
                      {formatCurrency(poolInfo.tvl, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                  </HStack>

                  <HStack>
                    <Text color={colors.textSecondary}>
                      {getTimeBasis(timeBasisIdx)} {t('common.volume')}
                    </Text>
                    <Text color={colors.textPrimary}>
                      {formatCurrency(poolInfo.day.volume, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                  </HStack>
                </HStack>
              </Box>

              {/* info detail */}
              <VStack align={'stretch'} alignSelf={['unset', 'end']} fontSize="sm" flex={1} spacing={4}>
                <VStack align={'stretch'} spacing={1.5}>
                  <Flex gap={2} color={colors.textSecondary} justifyContent="space-between">
                    <Box>{t('liquidity.my_position')}</Box>
                    <Box>{formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}</Box>
                  </Flex>
                  <Flex gap={2} mt={1} justifyContent="space-between">
                    <HStack>
                      <TokenAvatar size="sm" token={poolInfo.mintA} />
                      <Text>{formatCurrency(positionDetailInfo.amountA, { decimalPlaces: poolInfo.mintA.decimals })}</Text>
                      <Text color={colors.textSecondary}>{poolInfo.mintA.symbol}</Text>
                    </HStack>
                    <Flex textAlign="right" justifyContent="space-between" gap="1.5" minW="79px">
                      {formatCurrency(volumeA, { symbol: '$', decimalPlaces: 2 })}
                      <Box as="span" color={colors.textSecondary}>
                        {formatToRawLocaleStr(toAPRPercent(percentA, { decimalMode: 'trim' }))}
                      </Box>
                    </Flex>
                  </Flex>
                  <Flex gap={2} justifyContent="space-between">
                    <HStack>
                      <TokenAvatar size="sm" token={poolInfo.mintB} />
                      <Text>{formatCurrency(positionDetailInfo.amountB, { decimalPlaces: poolInfo.mintB.decimals })}</Text>
                      <Text color={colors.textSecondary}>{poolInfo.mintB.symbol}</Text>
                    </HStack>
                    <Flex textAlign="right" justifyContent="space-between" gap="1.5" minW="79px">
                      {formatCurrency(volumeB, { symbol: '$', decimalPlaces: 2 })}
                      <Box as="span" color={colors.textSecondary}>
                        {formatToRawLocaleStr(toAPRPercent(percentB, { decimalMode: 'trim' }))}
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
                    {formatCurrency(new Decimal(priceLower), { decimalPlaces: recommendDecimal })} -{' '}
                    {formatCurrency(new Decimal(priceUpper), { decimalPlaces: recommendDecimal })}
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
            <EstimatedApr
              aprData={aprData}
              timeBasis={timeBasis}
              onTimeBasisChange={onTimeBasisChange}
              timeAprData={poolInfo.allApr}
              poolId={poolInfo.id}
            />
            <PendingYield
              isLoading={isLoading}
              hasReward={hasReward}
              rewardInfos={rewardInfos}
              pendingYield={formatCurrency(totalPendingYield.toString(), { symbol: '$', decimalPlaces: 2 })}
              onHarvest={handleHarvest}
            />
            <HStack w="full" spacing={4}>
              {position.liquidity.isZero() ? (
                <CloseButton isLoading={isCloseLoading} onClick={handleClose} />
              ) : (
                <MinusButton
                  isLoading={false}
                  onClick={() => {
                    onClickViewTrigger()
                    onClickMinusButton()
                  }}
                />
              )}
              <PlusButton
                isLoading={false}
                onClick={() => {
                  onClickViewTrigger()
                  onClickPlusButton()
                }}
              />
            </HStack>
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <Button w="full" variant="ghost" onClick={onClickViewTrigger}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button flex={1} isLoading={props.isLoading} onClick={props.onClick} variant="outline">
      <Close width={10} height={10} color={colors.secondary} />
    </Button>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button flex={1} isLoading={props.isLoading} onClick={props.onClick} variant="outline">
      <MinusIcon color={colors.secondary} />
    </Button>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button flex={1} isLoading={props.isLoading} onClick={props.onClick}>
      <PlusIcon color={colors.backgroundDark} />
    </Button>
  )
}
