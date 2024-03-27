import { AprKey } from '@/hooks/pool/type'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack
} from '@chakra-ui/react'
import {
  ApiV3PoolInfoConcentratedItem,
  ApiV3PoolInfoStandardItem,
  ApiV3Token,
  FormatFarmInfoOutV6,
  TickUtils,
  getLiquidityFromAmounts
} from '@raydium-io/raydium-sdk-v2'
import { useEffect, useRef, useState } from 'react'

import { useAppStore, useLiquidityStore } from '@/store'

import TokenAvatar from '@/components/TokenAvatar'
import { getPriceBoundary } from '@/features/Clmm/utils/tick'
import useRefreshEpochInfo from '@/hooks/app/useRefreshEpochInfo'
import useSubscribeClmmInfo from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import { useEvent } from '@/hooks/useEvent'
import CircleArrowRight from '@/icons/misc/CircleArrowRight'
import CircleCheck from '@/icons/misc/CircleCheck'
import CirclePlus from '@/icons/misc/CirclePlus'
import { colors } from '@/theme/cssVariables'
import { toVolume } from '@/utils/numberish/autoSuffixNumberish'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { routeToPage } from '@/utils/routeTools'

import CircleArrowDown from '@/icons/misc/CircleArrowDown'
import toPercentString from '@/utils/numberish/toPercentString'
import { wSolToSolString } from '@/utils/token'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import EstimatedAprInfo from './AprInfo'
import RangeInput from './RangeInput'
import useValidateSchema from './useValidateSchema'

interface MigrateFromStandardDialogProps {
  isOpen: boolean
  poolInfo: ApiV3PoolInfoStandardItem
  clmmPoolInfo: FormattedPoolInfoConcentratedItem
  farmInfo?: FormatFarmInfoOutV6
  lpAmount: string
  farmLpAmount: string
  pooledAmountA: string
  pooledAmountB: string
  currentRewardInfo: { mint: ApiV3Token; amount: string }[]
  onClose(): void
}

interface TickData {
  priceLowerTick: number
  priceLower: Decimal
  priceUpperTick: number
  priceUpper: Decimal
}

function getExactPriceAndTick({ price, poolInfo, baseIn }: { price: Decimal; poolInfo: ApiV3PoolInfoConcentratedItem; baseIn: boolean }) {
  const { tick, price: tickPrice } = TickUtils.getPriceAndTick({
    baseIn,
    poolInfo,
    price
  })
  return { tick, price: tickPrice }
}

export default function MigrateFromStandardDialog({
  isOpen,
  onClose,
  poolInfo,
  clmmPoolInfo,
  farmInfo,
  lpAmount,
  farmLpAmount,
  currentRewardInfo,
  pooledAmountA,
  pooledAmountB
}: MigrateFromStandardDialogProps) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const migrateToClmmAct = useLiquidityStore((s) => s.migrateToClmmAct)
  const epochInfo = useAppStore((s) => s.epochInfo)
  const refreshTag = useRef(Date.now())
  useRefreshEpochInfo()

  const { currentPrice } = useSubscribeClmmInfo({
    initialFetch: true,
    poolInfo: clmmPoolInfo,
    throttle: 1000,
    refreshTag: refreshTag.current
  })
  clmmPoolInfo.price = currentPrice || clmmPoolInfo.price

  const [loading, setLoading] = useState(false)
  const [lpNotEnough, setLpNotEnough] = useState(false)
  const [mode, setMode] = useState<'quick' | 'custom'>('quick')
  const [baseIn, setBaseIn] = useState(true)
  const [defaultTicker, setDefaultTicker] = useState<TickData | undefined>()
  const [aprTab, setAprTab] = useState(AprKey.Day)
  const customTickRef = useRef<TickData | undefined>()

  const [clmmAmount, setClmmAmount] = useState({ amountA: '', amountB: '', amountSlippageA: new BN(0), amountSlippageB: new BN(0) })
  const [priceRange, setPriceRange] = useState<[string, string]>(['', ''])

  const error = useValidateSchema({ priceLower: priceRange[0], priceUpper: priceRange[1] })

  const isQuickMode = mode === 'quick'
  const [mintADecimal, mintBDecimal] = [clmmPoolInfo.mintA.decimals, clmmPoolInfo.mintB.decimals]
  const baseToken = clmmPoolInfo.mintA
  const quoteToken = clmmPoolInfo.mintB

  const calculateAmount = useEvent(({ priceLowerTick, priceUpperTick }: { priceLowerTick: number; priceUpperTick: number }) => {
    const slippage = useAppStore.getState().slippage

    const data = getLiquidityFromAmounts({
      poolInfo: clmmPoolInfo,
      tickLower: Math.min(priceLowerTick, priceUpperTick),
      tickUpper: Math.max(priceLowerTick, priceUpperTick),
      amountA: new BN(new Decimal(pooledAmountA).mul(10 ** mintADecimal).toFixed(0)),
      amountB: new BN(new Decimal(pooledAmountB).mul(10 ** mintBDecimal).toFixed(0)),
      slippage,
      add: true,
      epochInfo: epochInfo!,
      amountHasFee: true
    })
    setClmmAmount({
      amountA: new Decimal(data.amountA.amount.toString()).div(10 ** mintADecimal).toFixed(20),
      amountB: new Decimal(data.amountB.amount.toString()).div(10 ** mintBDecimal).toFixed(20),
      amountSlippageA: new BN(new Decimal(data.amountSlippageA.amount.toString()).toFixed(0)),
      amountSlippageB: new BN(new Decimal(data.amountSlippageB.amount.toString()).toFixed(0))
    })
    setLpNotEnough(data.liquidity.isZero())
  })

  useEffect(
    () => () => {
      setPriceRange(['', ''])
      customTickRef.current = undefined
    },
    [clmmPoolInfo.id]
  )

  useEffect(() => {
    setPriceRange(([priceLower, priceUpper]) => [
      priceUpper ? new Decimal(1).div(priceUpper).toDecimalPlaces(clmmPoolInfo.poolDecimals).toString() : priceUpper,
      priceLower ? new Decimal(1).div(priceLower).toDecimalPlaces(clmmPoolInfo.poolDecimals).toString() : priceLower
    ])
  }, [baseIn, clmmPoolInfo.poolDecimals])

  const handleBlur = useEvent((side: 'lower' | 'upper', val: string) => {
    if (new Decimal(val || 0).lte(0)) return
    const tickData = getExactPriceAndTick({
      poolInfo: clmmPoolInfo,
      price: new Decimal(val || clmmPoolInfo.price),
      baseIn: true
    })
    const isLower = side === 'lower'
    if (!customTickRef.current) customTickRef.current = { ...defaultTicker! }
    if (isLower) {
      customTickRef.current!.priceLower = tickData.price
      customTickRef.current!.priceLowerTick = tickData.tick
    } else {
      customTickRef.current!.priceUpper = tickData.price
      customTickRef.current!.priceUpperTick = tickData.tick
    }
    setPriceRange((preVal) =>
      isLower
        ? [tickData.price.toDecimalPlaces(clmmPoolInfo.poolDecimals).toString(), preVal[1]]
        : [preVal[0], tickData.price.toDecimalPlaces(clmmPoolInfo.poolDecimals).toString()]
    )

    calculateAmount(customTickRef.current!)
  })

  const rpcPriceLoaded = currentPrice !== undefined

  useEffect(() => {
    if (!rpcPriceLoaded) return
    const res = getPriceBoundary({
      baseIn,
      poolInfo: { ...clmmPoolInfo, price: clmmPoolInfo.price }
    })

    if (res) {
      setDefaultTicker({ ...res })
      setPriceRange((prevRange) => {
        if (prevRange[0] === '') {
          customTickRef.current = { ...res }
          return [
            res.priceLower.toDecimalPlaces(clmmPoolInfo.poolDecimals).toString(),
            res.priceUpper.toDecimalPlaces(clmmPoolInfo.poolDecimals).toString()
          ]
        }
        return prevRange
      })
    }
  }, [clmmPoolInfo, baseIn, rpcPriceLoaded])

  // calculate amount in quick mode
  useEffect(() => {
    if (!defaultTicker || !epochInfo) return
    calculateAmount(isQuickMode ? defaultTicker : customTickRef.current || defaultTicker)
  }, [
    isQuickMode,
    clmmPoolInfo,
    pooledAmountA,
    pooledAmountB,
    defaultTicker?.priceLowerTick,
    defaultTicker?.priceUpperTick,
    epochInfo,
    currentPrice
  ])

  const handleConfirm = () => {
    setLoading(true)

    const isMintABase = !new Decimal(pooledAmountB)
      .mul(10 ** mintBDecimal)
      .toDecimalPlaces(0)
      .eq(new Decimal(clmmAmount.amountB).mul(10 ** mintBDecimal).toDecimalPlaces(0))

    migrateToClmmAct({
      poolInfo,
      clmmPoolInfo: {
        ...clmmPoolInfo,
        price: clmmPoolInfo.price
      },
      removeLpAmount: new BN(lpAmount),
      createPositionInfo: {
        tickLower: (isQuickMode ? defaultTicker?.priceLowerTick : customTickRef.current?.priceLowerTick)!,
        tickUpper: (isQuickMode ? defaultTicker?.priceUpperTick : customTickRef.current?.priceUpperTick)!,
        baseAmount: isMintABase
          ? new BN(new Decimal(clmmAmount.amountA).mul(10 ** mintADecimal).toFixed(0))
          : new BN(new Decimal(clmmAmount.amountB).mul(10 ** mintBDecimal).toFixed(0)),
        otherAmountMax: isMintABase ? clmmAmount.amountSlippageB : clmmAmount.amountSlippageA
      },
      farmInfo,
      base: isMintABase ? 'MintA' : 'MintB',
      userFarmLpAmount: new BN(farmLpAmount),
      onSuccess: onClose,
      onFinally: () => {
        setLoading(false)
        routeToPage('portfolio', { queryProps: { section: 'my-positions', position_tab: 'concentrated' } })
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'2xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('migrate_clmm.title')}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5}>
          <VStack gap={[3, 4]} align={'stretch'}>
            <Text fontSize={'sm'} color={colors.textSecondary}>
              {t('migrate_clmm.desc')} <Link isExternal>{t('migrate_clmm.desc_link')}</Link>.
            </Text>

            {/* mode switcher */}
            <HStack flexDirection={['column', 'row']} spacing={3} alignItems={'stretch'}>
              <ModeItem
                selected={mode === 'quick'}
                title={t('migrate_clmm.quick_migration')}
                description={t('migrate_clmm.quick_migration_desc')}
                onClick={() => {
                  setMode('quick')
                }}
              />
              <ModeItem
                selected={mode === 'custom'}
                title={t('migrate_clmm.custom_migration')}
                description={t('migrate_clmm.custom_migration_desc')}
                onClick={() => {
                  setMode('custom')
                }}
              />
            </HStack>

            {/* CLMM Pool */}
            <Box>
              <Heading mb={3} fontSize={'md'} fontWeight={500} color={colors.textPrimary}>
                {t('migrate_clmm.heading_clmm_pool')}
              </Heading>
              <Flex
                rounded={'xl'}
                flexDirection={['column', 'row']}
                rowGap={1}
                py={2}
                px={4}
                justify={'space-between'}
                border={`1px solid ${colors.backgroundTransparent10}`}
                bg={colors.backgroundTransparent12}
              >
                <HStack gap={2}>
                  <Text color={colors.textSecondary} fontWeight={500} fontSize={'md'}>
                    {t('common.per_unit_2', { subA: baseToken?.symbol ?? '--', subB: quoteToken?.symbol ?? '--' })}
                  </Text>
                  <Box
                    bg={colors.backgroundTransparent12}
                    color={colors.textSecondary}
                    fontSize={'xs'}
                    rounded={'full'}
                    py={0.5}
                    px={2}
                    fontWeight={500}
                  >
                    {t('field.fee')} {toPercentString(clmmPoolInfo.config.tradeFeeRate / 10000)}
                  </Box>
                </HStack>
                <HStack gap={2}>
                  <Text color={colors.textTertiary} fontWeight={500} fontSize={'sm'}>
                    {t('migrate_clmm.current_price')}:
                  </Text>
                  <Text color={colors.textSecondary} fontSize={'md'} fontWeight={500}>
                    {toVolume(baseIn ? clmmPoolInfo.price : new Decimal(1).div(clmmPoolInfo.price || 1))}
                  </Text>
                  <Text color={colors.textTertiary} fontWeight={500} fontSize={'sm'}>
                    {baseIn
                      ? t('common.per_unit', { subA: quoteToken?.symbol ?? '--', subB: baseToken?.symbol ?? '--' })
                      : t('common.per_unit', { subA: baseToken?.symbol ?? '--', subB: quoteToken?.symbol ?? '--' })}
                  </Text>
                </HStack>
              </Flex>
            </Box>

            {/* price range */}
            <Box>
              <HStack mb={1} justify={'space-between'}>
                <Heading fontSize={'md'} fontWeight={500} color={colors.textPrimary}>
                  {t('migrate_clmm.heading_price_range')}
                </Heading>
                <Tabs variant="roundedLight" bg={colors.backgroundDark} onChange={(index) => setBaseIn(index === 0)}>
                  <TabList>
                    <Tab sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg' } }}>
                      {t('common.token_price', { token: wSolToSolString(baseToken.symbol) })}
                    </Tab>
                    <Tab sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg' } }}>
                      {t('common.token_price', { token: wSolToSolString(quoteToken.symbol) })}
                    </Tab>
                  </TabList>
                </Tabs>
              </HStack>
              {isQuickMode ? (
                <Flex
                  rounded={'xl'}
                  py={2}
                  px={4}
                  justify={'space-between'}
                  border={`1px solid ${colors.backgroundTransparent10}`}
                  bg={colors.backgroundTransparent12}
                >
                  <Text color={colors.textSecondary} fontWeight={500} fontSize={['sm', 'md']}>
                    {formatLocaleStr(defaultTicker?.priceLower.toString(), mintADecimal)} -{' '}
                    {formatLocaleStr(defaultTicker?.priceUpper.toString(), mintBDecimal)}
                  </Text>

                  <Text color={colors.textTertiary} fontWeight={500} fontSize={'sm'}>
                    {baseIn
                      ? `${quoteToken?.symbol ?? '--'} per ${baseToken?.symbol ?? '--'}`
                      : `${baseToken?.symbol ?? '--'} per ${quoteToken?.symbol ?? '--'}`}
                  </Text>
                </Flex>
              ) : (
                <RangeInput priceRange={priceRange} priceError={error} onPriceChange={setPriceRange} onBlur={handleBlur} />
              )}
            </Box>

            {/* result panels */}
            <Box>
              <Grid
                pt={6}
                gridTemplate={[
                  `
                    "current"  auto
                    "arrow  "  auto
                    "details" / 1fr 
                  `,
                  `
                    "current arrow details" auto / 1.2fr auto 2fr
                  `
                ]}
                alignItems={'center'}
                justifyItems={['center', 'stretch']}
                gap={[3, 4]}
                color={colors.textSecondary}
                fontSize={'sm'}
                fontWeight={500}
                flex={1}
              >
                <GridItem area={'current'}>
                  <ResultPanel
                    borderStyle="solid"
                    hasTokenSymbol
                    title={t('migrate_clmm.current_position')}
                    tokenInfo={[
                      { token: baseToken, amount: pooledAmountA },
                      { token: quoteToken, amount: pooledAmountB }
                    ]}
                  />
                </GridItem>
                <GridItem area={'arrow'}>
                  {isMobile ? <CircleArrowDown color={colors.textSecondary} /> : <CircleArrowRight color={colors.textSecondary} />}
                </GridItem>
                <GridItem area={'details'} justifySelf={'stretch'}>
                  <HStack spacing={[2, 4]} pt={[6, 'revert']}>
                    <ResultPanel
                      borderStyle="dashed"
                      title={t('migrate_clmm.clmm_pool')}
                      tokenInfo={[
                        { token: baseToken, amount: clmmAmount.amountA },
                        { token: quoteToken, amount: clmmAmount.amountB }
                      ]}
                    />
                    <Box flexShrink="none">
                      <CirclePlus stroke={colors.textTertiary} />
                    </Box>
                    <ResultPanel
                      borderStyle="dashed"
                      title={t('migrate_clmm.wallet')}
                      tokenInfo={[
                        {
                          token: baseToken,
                          amount: new Decimal(pooledAmountA)
                            .sub(clmmAmount.amountA || '0')
                            .toDecimalPlaces(mintADecimal)
                            .toString()
                        },
                        {
                          token: quoteToken,
                          amount: new Decimal(pooledAmountB)
                            .sub(clmmAmount.amountB || '0')
                            .toDecimalPlaces(mintBDecimal)
                            .toString()
                        }
                      ]}
                    />
                  </HStack>
                </GridItem>
              </Grid>
              {currentRewardInfo.length > 0 ? (
                <Flex gap={1} mt={[4, 2]} color={colors.textSecondary} flexWrap={'wrap'} fontSize={'sm'}>
                  {t('migrate_clmm.footer_note')}
                  {currentRewardInfo.map((data) => (
                    <Text as="span" key={data.mint.address} fontWeight="600">
                      {toVolume(data.amount, { decimals: isMobile ? undefined : data.mint.decimals })} {data.mint.symbol}
                    </Text>
                  ))}
                  {t('migrate_clmm.footer_note_2')}
                </Flex>
              ) : null}
            </Box>

            {/* Esimated APR */}
            <EstimatedAprInfo value={aprTab} onChange={setAprTab} aprData={clmmPoolInfo.allApr} totalApr={clmmPoolInfo.totalApr} />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <VStack width="full" spacing={0} alignItems="flex-start">
            <Button
              w="full"
              isDisabled={(!isQuickMode && !!error) || (!clmmAmount.amountA && !clmmAmount.amountB) || lpNotEnough}
              isLoading={loading}
              onClick={handleConfirm}
            >
              {lpNotEnough ? t('error.liquidity_not_enough') : t('button.migrate')}
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function ResultPanel(props: {
  borderStyle: 'solid' | 'dashed'
  hasTokenSymbol?: boolean
  tokenInfo: { token?: ApiV3Token; amount?: number | string }[]
  title: string
}) {
  const isMobile = useAppStore((s) => s.isMobile)

  return (
    <Box
      w={'full'}
      position={'relative'}
      border={'1.5px solid'}
      borderStyle={props.borderStyle}
      borderColor={colors.backgroundTransparent10}
      rounded={'xl'}
      p={2}
    >
      <Text
        position={'absolute'}
        top={-6}
        insetInline={0}
        textAlign="center"
        fontSize={'sm'}
        sx={{ textWrap: 'nowrap' }}
        color={colors.textSecondary}
      >
        {props.title}
      </Text>
      <Flex direction={'column'} gap={0.5}>
        {props.tokenInfo.map(
          ({ token, amount }) =>
            token && (
              <HStack key={token.address} justify={'space-between'} gap={4} color={colors.textSecondary}>
                <HStack>
                  <TokenAvatar token={token} size="xs" />
                  {props.hasTokenSymbol && <Text fontSize={'sm'}>{token.symbol}</Text>}
                </HStack>
                <Text color={colors.textSecondary} fontSize={'xs'}>
                  {toVolume(amount || 0, { decimals: isMobile ? undefined : token.decimals, decimalMode: 'trim' })}
                </Text>
              </HStack>
            )
        )}
      </Flex>
    </Box>
  )
}

function ModeItem({
  title,
  description,
  selected,
  onClick
}: {
  title: string
  description: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <Box
      onClick={onClick}
      position={'relative'}
      border={'1.5px solid'}
      borderColor={selected ? colors.secondary : 'transparent'}
      rounded={'xl'}
      py={3}
      px={4}
      bg={colors.backgroundDark}
      cursor={'pointer'}
    >
      {selected && (
        <Box position="absolute" color={colors.secondary} right={3} top={3}>
          <CircleCheck />
        </Box>
      )}
      <Text fontWeight={selected ? 500 : undefined} fontSize={'md'} color={colors.textPrimary} mb={1}>
        {title}
      </Text>
      <Text fontSize={'sm'} color={selected ? colors.textSecondary : colors.textTertiary}>
        {description}
      </Text>
    </Box>
  )
}
