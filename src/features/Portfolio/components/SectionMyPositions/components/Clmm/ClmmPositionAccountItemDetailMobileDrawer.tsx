import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Badge,
  Box,
  Flex,
  Text,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  HStack,
  SimpleGrid,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import { FormattedPoolInfoConcentratedItem, AprKey, timeBasisOptions } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import Close from '@/icons/misc/Close'
import LockIcon from '@/icons/misc/LockIcon'
import { colors } from '@/theme/cssVariables'
import { AprData } from '@/features/Clmm/utils/calApr'
import PoolInfoDrawerFace from './ClmmPositionAccountItemDetail/PoolInfoDrawerFace'
import { useEvent } from '@/hooks/useEvent'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import LiquidityChartRangeInput from '@/features/Clmm/components/LiquidityChartRangeInput'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { getTimeBasis } from '@/utils/time'
import { debounce } from '@/utils/functionMethods'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import Tabs from '@/components/Tabs'
import { PoolListItemAprLine } from '@/features/Pools/components/PoolListItemAprLine'

type DetailProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  aprData: AprData
  onTimeBasisChange?: (val: AprKey) => void
  nftMint: string
  totalPendingYield: string
  baseIn: boolean
  hasReward?: boolean
  isLock?: boolean
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
  onTimeBasisChange,
  hasReward,
  isLock,
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
    <Drawer
      isOpen={true}
      variant="popFromBottom"
      placement="bottom"
      autoFocus={false}
      returnFocusOnClose={false}
      onClose={onClickViewTrigger}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody>
          <VStack gap={4}>
            <PoolInfoDrawerFace poolInfo={poolInfo} baseIn={baseIn} position={position}></PoolInfoDrawerFace>
            <Flex direction="column" gap={8} bg={colors.backgroundDark} rounded="xl" justify="center" py={5} px={4} w={'full'}>
              {/* chart */}
              <Box flex={1}>
                <HStack justifyContent="center" gap={2} mb={2}>
                  <Text color={colors.textSecondary} fontSize="xs" opacity={0.5}>
                    {t('field.current_price')}
                  </Text>
                  <Text color={colors.lightPurple} fontSize="xs">
                    <Text as="span" color={colors.textPrimary} fontWeight="medium">
                      {baseIn
                        ? formatCurrency(poolInfo.price, {
                            decimalPlaces: poolInfo.recommendDecimal(poolInfo.price)
                          })
                        : formatCurrency(new Decimal(1).div(poolInfo.price).toString(), {
                            decimalPlaces: poolInfo.recommendDecimal(new Decimal(1).div(poolInfo.price).toString())
                          })}
                    </Text>{' '}
                    <Text as="span" opacity={0.5}>
                      {t('common.per_unit', {
                        subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
                        subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
                      })}
                    </Text>
                  </Text>
                </HStack>
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
                <HStack fontSize="sm" justifyContent={'space-between'} mt={5}>
                  <HStack>
                    <Text color={colors.lightPurple}>{t('liquidity.pool_liquidity')}</Text>
                    <Text color={colors.textPrimary}>
                      {formatCurrency(poolInfo.tvl, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                  </HStack>

                  <HStack>
                    <Text color={colors.lightPurple}>
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
                  <Flex gap={2} justifyContent="space-between">
                    <HStack gap={1} color={colors.textSecondary}>
                      <Text>{t('liquidity.my_position')}</Text>
                      {isLock && <LockIcon />}
                    </HStack>
                    <Box color={colors.lightPurple}>{formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}</Box>
                  </Flex>
                  <Flex gap={2} mt={1} justifyContent="space-between">
                    <HStack>
                      <TokenAvatar size="sm" token={poolInfo.mintA} />
                      <Text>{formatCurrency(positionDetailInfo.amountA, { decimalPlaces: poolInfo.mintA.decimals })}</Text>
                      <Text color={colors.lightPurple}>{poolInfo.mintA.symbol}</Text>
                    </HStack>
                    <Text textAlign="right">{formatCurrency(volumeA, { symbol: '$', decimalPlaces: 2 })}</Text>
                  </Flex>
                  <Flex gap={2} justifyContent="space-between">
                    <HStack>
                      <TokenAvatar size="sm" token={poolInfo.mintB} />
                      <Text>{formatCurrency(positionDetailInfo.amountB, { decimalPlaces: poolInfo.mintB.decimals })}</Text>
                      <Text color={colors.lightPurple}>{poolInfo.mintB.symbol}</Text>
                    </HStack>
                    <Text textAlign="right">{formatCurrency(volumeB, { symbol: '$', decimalPlaces: 2 })}</Text>
                  </Flex>
                </VStack>

                <HStack>
                  <Text color={colors.textSecondary}>{t('clmm.my_range')}</Text>
                  <Badge variant={inRange ? 'ok' : 'error'}>{t(inRange ? 'clmm.in_range' : 'clmm.out_of_range')}</Badge>
                </HStack>

                <HStack>
                  <Text fontWeight="medium">
                    {formatCurrency(new Decimal(priceLower), { decimalPlaces: recommendDecimal })} -{' '}
                    {formatCurrency(new Decimal(priceUpper), { decimalPlaces: recommendDecimal })}
                  </Text>
                  <Text color={colors.textSecondary} opacity={0.5}>
                    {poolInfo[baseIn ? 'mintB' : 'mintA'].symbol} per {poolInfo[baseIn ? 'mintA' : 'mintB'].symbol}
                  </Text>
                </HStack>

                <HStack wordBreak={'break-all'}>
                  <Text color={colors.textSecondary} opacity={0.5}>
                    {t('clmm.nft_mint_address')}:{' '}
                  </Text>
                  <AddressChip
                    address={nftMint}
                    canCopy
                    canExternalLink
                    textProps={{
                      color: colors.lightPurple,
                      opacity: 0.5
                    }}
                    iconProps={{ color: colors.textLink }}
                  />
                </HStack>
              </VStack>
            </Flex>
            <Flex bg={colors.backgroundDark} w="full" rounded="xl" p={4} direction="column" justify={'space-between'} gap={2} fontSize="sm">
              <HStack justify="space-between" direction="column" alignItems="start">
                <HStack spacing={2}>
                  <Text color={colors.textSecondary}>{t('common.estimated_APR')}</Text>
                  <AprMDSwitchWidget />
                </HStack>
                <Tabs size="xs" items={timeBasisOptions} onChange={onTimeBasisChange} variant="roundedLight" />
              </HStack>
              <SimpleGrid
                gridTemplate={`
                  "value tokens" auto
                  "line  tokens" auto / .5fr 1fr
                `}
                alignItems={'center'}
                columnGap={3}
              >
                <Text gridArea={'value'} fontSize="xl" fontWeight="medium" color={colors.textPrimary}>
                  {formatToRawLocaleStr(toPercentString(aprData.apr))}
                </Text>
                <Box gridArea={'line'}>
                  <PoolListItemAprLine aprData={aprData} />
                </Box>
                <Box gridArea="tokens">
                  {poolInfo.weeklyRewards.map((r) => (
                    <TokenAvatar key={r.token.address} token={r.token} />
                  ))}
                </Box>
              </SimpleGrid>
            </Flex>
            <Flex bg={colors.backgroundDark} rounded="xl" py={5} px={4} w="full" direction="column" gap={3}>
              <Text fontSize="sm" color={colors.textSecondary} whiteSpace="nowrap">
                {t('portfolio.section_positions_clmm_account_pending_yield')}
              </Text>
              <Flex justify={'space-between'} align="center">
                <HStack fontSize="xl" fontWeight="medium" spacing={1}>
                  <Text whiteSpace="nowrap">{formatCurrency(totalPendingYield.toString(), { symbol: '$', decimalPlaces: 2 }) ?? '$0'}</Text>
                  <QuestionToolTip
                    label={t('staking.pending_rewards_tooltip')}
                    iconType="info"
                    iconProps={{
                      width: '18px',
                      height: '18px',
                      color: colors.lightPurple
                    }}
                  />
                </HStack>
                <Button isLoading={isLoading} isDisabled={!hasReward} onClick={handleHarvest} size="sm" fontSize="md" variant="outline">
                  {t('portfolio.section_positions_clmm_account_pending_yield_button')}
                </Button>
              </Flex>
            </Flex>
            {isLock ? null : (
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
            )}
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
