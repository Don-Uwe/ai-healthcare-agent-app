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
  PoolFetchType,
  TickUtils,
  getLiquidityFromAmounts,
  FARM_PROGRAM_TO_VERSION
} from '@raydium-io/raydium-sdk-v2'
import { useEffect, useRef, useState } from 'react'

import { useAppStore, useClmmStore, useLiquidityStore } from '@/store'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import TokenAvatar from '@/components/TokenAvatar'
import useRefreshEpochInfo from '@/hooks/app/useRefreshEpochInfo'
import useSubscribeClmmInfo from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import { useEvent } from '@/hooks/useEvent'
import CircleArrowRight from '@/icons/misc/CircleArrowRight'
import CircleCheck from '@/icons/misc/CircleCheck'
import CirclePlus from '@/icons/misc/CirclePlus'
import { colors } from '@/theme/cssVariables'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
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
import { MigrateClmmConfig } from '@/hooks/pool/useMigratePoolConfig'
import { PublicKey } from '@solana/web3.js'

interface MigrateFromStandardDialogProps {
  isOpen: boolean
  poolInfo: ApiV3PoolInfoStandardItem
  migrateClmmConfig: MigrateClmmConfig
  farmInfo?: FormatFarmInfoOutV6
  lpAmount: string
  farmLpAmount: string
  pooledAmountA: string
  pooledAmountB: string
  currentRewardInfo: { mint: ApiV3Token; amount: string }[]
  userAuxiliaryLedgers?: string[]
  onClose(): void
  onRefresh(): void
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
  onRefresh,
  poolInfo,
  userAuxiliaryLedgers,
  migrateClmmConfig,
  farmInfo,
  lpAmount,
  farmLpAmount,
  currentRewardInfo,
  pooledAmountA: propAmountA,
  pooledAmountB: propAmountB
}: MigrateFromStandardDialogProps) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const getPriceAndTick = useClmmStore((s) => s.getPriceAndTick)
  const migrateToClmmAct = useLiquidityStore((s) => s.migrateToClmmAct)
  const epochInfo = useAppStore((s) => s.epochInfo)
  const refreshTag = useRef(Date.now())
  const refreshCircleRef = useRef<IntervalCircleHandler>(null)
  useRefreshEpochInfo()

  const { formattedData } = useFetchPoolById<ApiV3PoolInfoConcentratedItem>({
    idList: [migrateClmmConfig.clmmId],
    type: PoolFetchType.Concentrated
  })
  const clmmPoolInfo = formattedData?.[0]

  const { currentPrice, mutateRpcData } = useSubscribeClmmInfo({
    initialFetch: true,
    poolInfo: clmmPoolInfo,
    throttle: 1000,
    refreshTag: refreshTag.current
  })

  const handleRefresh = useEvent(() => {
    onRefresh()
    mutateRpcData()
  })

  const handleClick = useEvent(() => {
    refreshCircleRef.current?.restart()
    handleRefresh()
  })

  if (clmmPoolInfo) clmmPoolInfo.price = currentPrice || clmmPoolInfo.price

  const [pooledAmountA, pooledAmountB] =
    poolInfo.mintA.address === clmmPoolInfo?.mintA.address ? [propAmountA, propAmountB] : [propAmountB, propAmountA]

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
  const [mintADecimal, mintBDecimal] = [clmmPoolInfo?.mintA.decimals ?? 0, clmmPoolInfo?.mintB.decimals ?? 0]
  const baseToken = clmmPoolInfo?.mintA
  const quoteToken = clmmPoolInfo?.mintB

  const calculateAmount = useEvent(({ priceLowerTick, priceUpperTick }: { priceLowerTick: number; priceUpperTick: number }) => {
    if (!clmmPoolInfo) return
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
    [clmmPoolInfo?.id]
  )

  useEffect(() => {
    setPriceRange(([priceLower, priceUpper]) => [
      priceUpper
        ? new Decimal(1)
            .div(priceUpper)
            .toDecimalPlaces(clmmPoolInfo?.poolDecimals ?? 0)
            .toString()
        : priceUpper,
      priceLower
        ? new Decimal(1)
            .div(priceLower)
            .toDecimalPlaces(clmmPoolInfo?.poolDecimals ?? 0)
            .toString()
        : priceLower
    ])
  }, [baseIn, clmmPoolInfo?.poolDecimals])

  const handleBlur = useEvent((side: 'lower' | 'upper', val: string) => {
    if (!clmmPoolInfo || new Decimal(val || 0).lte(0)) return
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
    if (!rpcPriceLoaded || !clmmPoolInfo) return

    const minTick = getPriceAndTick({ pool: clmmPoolInfo, price: migrateClmmConfig.defaultPriceMin.toString(), baseIn })
    const maxTick = getPriceAndTick({ pool: clmmPoolInfo, price: migrateClmmConfig.defaultPriceMax.toString(), baseIn })

    if (minTick && maxTick) {
      const res = {
        priceLowerTick: Math.min(minTick.tick, maxTick.tick),
        priceUpperTick: Math.max(minTick.tick, maxTick.tick),
        priceLower: baseIn ? minTick.price : new Decimal(1).div(maxTick.price.toString()),
        priceUpper: baseIn ? maxTick.price : new Decimal(1).div(minTick.price.toString())
      }
      setDefaultTicker({
        ...res
      })
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
  }, [clmmPoolInfo, baseIn, rpcPriceLoaded, migrateClmmConfig])

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
    if (!clmmPoolInfo) return
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
      userAuxiliaryLedgers: userAuxiliaryLedgers?.length ? userAuxiliaryLedgers.filter(Boolean).map((p) => new PublicKey(p)) : undefined,
      base: isMintABase ? 'MintA' : 'MintB',
      userFarmLpAmount: new BN(farmLpAmount),
      onSent: () => {
        setLoading(false)
        onClose()
      },
      onConfirmed: () => {
        routeToPage('portfolio', { queryProps: { section: 'my-positions', position_tab: 'concentrated' } })
      },
      onError: () => setLoading(false)
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
                    {t('field.fee')}{' '}
                    {formatToRawLocaleStr(toPercentString((clmmPoolInfo?.config.tradeFeeRate ?? 0) / 10000, { alreadyPercented: true }))}
                  </Box>
                </HStack>
                <HStack gap={2}>
                  <Text color={colors.textTertiary} fontWeight={500} fontSize={'sm'}>
                    {t('migrate_clmm.current_price')}:
                  </Text>
                  <Text color={colors.textSecondary} fontSize={'md'} fontWeight={500}>
                    {formatCurrency(baseIn ? clmmPoolInfo?.price ?? 0 : new Decimal(1).div(clmmPoolInfo?.price ?? 1), { decimalPlaces: 2 })}
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
                <Heading display="flex" gap="2" alignItems={'center'} fontSize={'md'} fontWeight={500} color={colors.textPrimary}>
                  {t('migrate_clmm.heading_price_range')}
                  <IntervalCircle
                    componentRef={refreshCircleRef}
                    duration={60 * 1000}
                    svgWidth={18}
                    strokeWidth={2}
                    trackStrokeColor={colors.secondary}
                    trackStrokeOpacity={0.5}
                    filledTrackStrokeColor={colors.secondary}
                    onClick={handleClick}
                    onEnd={handleRefresh}
                  />
                </Heading>
                <Tabs variant="roundedLight" bg={colors.backgroundDark} onChange={(index) => setBaseIn(index === 0)}>
                  <TabList>
                    <Tab sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg' } }}>
                      {t('common.token_price', { token: wSolToSolString(baseToken?.symbol) })}
                    </Tab>
                    <Tab sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg' } }}>
                      {t('common.token_price', { token: wSolToSolString(quoteToken?.symbol) })}
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
                    {formatCurrency(defaultTicker?.priceLower.toString(), { decimalPlaces: mintADecimal })} -{' '}
                    {formatCurrency(defaultTicker?.priceUpper.toString(), { decimalPlaces: mintBDecimal })}
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
                      {formatCurrency(data.amount, { decimalPlaces: isMobile ? undefined : data.mint.decimals })} {data.mint.symbol}
                    </Text>
                  ))}
                  {t('migrate_clmm.footer_note_2')}
                </Flex>
              ) : null}
            </Box>

            {/* Esimated APR */}
            {clmmPoolInfo ? (
              <EstimatedAprInfo value={aprTab} onChange={setAprTab} aprData={clmmPoolInfo.allApr} totalApr={clmmPoolInfo.totalApr} />
            ) : null}
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
                  {formatCurrency(amount || 0, { decimalPlaces: isMobile ? undefined : token.decimals })}
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
