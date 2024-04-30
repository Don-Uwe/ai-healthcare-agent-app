import { useState, useCallback, useRef, useEffect } from 'react'
import { Minus, Plus } from 'react-feather'
import { ApiV3PoolInfoConcentratedItem, ApiV3Token, solToWSol } from '@raydium-io/raydium-sdk-v2'
import { Box, Text, Flex, HStack, VStack, SimpleGrid } from '@chakra-ui/react'
import shallow from 'zustand/shallow'
import DecimalInput from '@/components/DecimalInput'
import PanelCard from '@/components/PanelCard'
import Tabs from '@/components/Tabs'
import Button from '@/components/Button'
import HorizontalSwitchSmallIcon from '@/icons/misc/HorizontalSwitchSmallIcon'
import { DatePick, HourPick, MinutePick } from '@/components/DateTimePicker'
import EditIcon from '@/icons/misc/EditIcon'
import { QuestionToolTip } from '@/components/QuestionToolTip'

import { useClmmStore } from '@/store/useClmmStore'
import { debounce } from '@/utils/functionMethods'
import { colors } from '@/theme/cssVariables/colors'
import { wSolToSolString } from '@/utils/token'
import { usePriceRangeValidate } from '../useValidate'
import { TickData } from './type'

import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { usePopper } from 'react-popper'
import FocusTrap from 'focus-trap-react'
import { Side } from '@/features/Clmm/components/RangeInput'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { extractNumberOnly } from '@/utils/numberish/regex'

const IconStyle = {
  cursor: 'pointer',
  color: colors.secondary,
  background: colors.secondary10,
  width: '20px',
  height: '20px',
  borderRadius: '4px'
}
const RangeInputStyle = {
  ctr: { bg: colors.backgroundDark, borderRadius: 'xl', userSelect: 'none' },
  input: { px: '8px', h: '24px', textAlign: ['left', 'center'], fontWeight: 500, fontSize: 'sm' },
  inputGroup: {
    display: 'flex',
    ml: ['0', '8px'],
    h: '24px',
    lineHeight: '24px'
  }
}

interface Props {
  initState?: {
    currentPrice?: string
    priceRange?: [string, string]
    startTime?: number
  }
  token1: ApiV3Token
  token2: ApiV3Token
  tokenPrices: Record<string, TokenPrice>
  tempCreatedPool?: ApiV3PoolInfoConcentratedItem
  baseIn: boolean
  completed: boolean
  onPriceChange: (props: { price: string }) => void
  onConfirm: (props: { price: string; startTime?: number } & Required<TickData>) => void
  onEdit: (step: number) => void
  onSwitchBase: (baseIn: boolean) => void
}

export default function SetPriceAndRange({
  completed,
  initState,
  tokenPrices,
  token1,
  token2,
  tempCreatedPool,
  baseIn,
  onPriceChange,
  onSwitchBase,
  onConfirm,
  onEdit
}: Props) {
  const { t } = useTranslation()
  const [getPriceAndTick, getTickPrice] = useClmmStore((s) => [s.getPriceAndTick, s.getTickPrice], shallow)
  const [priceReverse, setPriceReverse] = useState(false)
  const [rangeMode, setRangeMode] = useState<'full' | 'custom'>('full')
  const [currentPrice, setCurrentPrice] = useState<string>(initState?.currentPrice || '')
  const [priceRange, setPriceRange] = useState<[string, string]>(initState?.priceRange || ['', ''])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [startDateMode, setStartDateMode] = useState<'now' | 'custom'>('now')
  const switchRef = useRef(false)
  const focusMintARef = useRef(true)
  const priceRangeRef = useRef(priceRange)
  const hasInitPriceRange = !!initState?.priceRange?.[0] && !!initState?.priceRange?.[1]
  priceRangeRef.current = priceRange
  const isFullRange = rangeMode === 'full'
  const isStartNow = startDateMode === 'now'

  const [isPopperOpen, setIsPopperOpen] = useState(false)
  const popperRef = useRef<HTMLDivElement>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const popper = usePopper(popperRef.current, popperElement, {
    placement: 'top-start'
  })
  const closePopper = () => setIsPopperOpen(false)

  const handleFocus = useEvent((isMintA: boolean) => {
    focusMintARef.current = isMintA
  })

  const error = usePriceRangeValidate({
    focusMintA: focusMintARef.current,
    startTime: startDate ? startDate.valueOf() : dayjs().add(1, 'h').valueOf(),
    currentPrice,
    priceRange: isFullRange ? ['1', '100'] : priceRange
  })

  const [tokenBase, tokenQuote] = [
    baseIn ? tempCreatedPool?.mintB || token2 : tempCreatedPool?.mintA || token1,
    baseIn ? tempCreatedPool?.mintA || token1 : tempCreatedPool?.mintB || token2
  ]

  const [priceBase, priceQuote] = [
    tokenPrices[solToWSol(tokenBase.address).toString()],
    tokenPrices[solToWSol(tokenQuote.address).toString()]
  ]

  const onlinePrice =
    tokenBase && tokenQuote && priceBase.value && priceQuote.value
      ? new Decimal((priceReverse ? priceBase.value : priceQuote.value) || 0)
          .div((priceReverse ? priceQuote.value : priceBase.value) || 1)
          .toDecimalPlaces((priceReverse ? tokenQuote.decimals : tokenBase.decimals) || 6)
          .toString()
      : '-- '

  const tickPriceRef = useRef<TickData>({})
  const fullRangeTickRef = useRef<TickData>({})

  const decimals = tempCreatedPool ? Math.max(tempCreatedPool?.mintA.decimals || 0, tempCreatedPool?.mintB.decimals || 0) : 15
  const formatDecimalToDigit = useEvent(({ val }: { val: string }) =>
    new Decimal(val).toDecimalPlaces(Math.max(decimals, 8), Decimal.ROUND_FLOOR).toString()
  )

  const debouncePriceChange = useEvent(debounce(onPriceChange, 150))

  const handlePriceChange = useCallback(
    (propsVal: string) => {
      if (switchRef.current) {
        switchRef.current = false
        return
      }
      switchRef.current = false
      const val = extractNumberOnly(propsVal)
      setCurrentPrice(val)
      debouncePriceChange({ price: val })
      handleLeftRangeBlur(new Decimal(val || 0).mul(0.5).toString())
      handleRightRangeBlur(new Decimal(val || 0).mul(1.5).toString())
    },
    [baseIn]
  )

  const handleLeftRangeBlur = useEvent((val: string) => {
    if (
      !tempCreatedPool?.id ||
      new Decimal(tickPriceRef.current.priceLower || 0).toDecimalPlaces(Math.max(decimals, 8), Decimal.ROUND_FLOOR).eq(val)
    )
      return
    const r = getPriceAndTick({ pool: tempCreatedPool, price: val, baseIn })
    if (!r) return
    tickPriceRef.current.tickLower = r.tick
    tickPriceRef.current.priceLower = r.price.toFixed(20)
    setPriceRange((range) => [formatDecimalToDigit({ val: r.price.toFixed(20) }), range[1]])
    if (r.tick === tickPriceRef.current.tickUpper) {
      handleClickAdd(Side.Right, true)
    }
  })
  const handleRightRangeBlur = useEvent((val: string) => {
    if (
      !tempCreatedPool?.id ||
      new Decimal(tickPriceRef.current.priceUpper || 0).toDecimalPlaces(Math.max(decimals, 8), Decimal.ROUND_FLOOR).eq(val)
    )
      return
    const r = getPriceAndTick({ pool: tempCreatedPool, price: val, baseIn })
    if (!r) return
    tickPriceRef.current.tickUpper = r.tick
    tickPriceRef.current.priceUpper = r.price.toString()
    setPriceRange((range) => [range[0], formatDecimalToDigit({ val: r.price.toString() })])
    if (r.tick === tickPriceRef.current.tickLower) {
      handleClickAdd(Side.Left, false)
    }
  })

  const handleInputChange = useCallback((val: string, _: number, side?: string) => {
    setPriceRange((pos) => (side === Side.Left ? [val, pos[1]] : [pos[0], val]))
  }, [])

  const handleClickAdd = useEvent((side: string, isAdd: boolean) => {
    if (!tempCreatedPool) return
    const tickKey = side === Side.Left ? 'tickLower' : 'tickUpper'
    const tick = tickPriceRef.current[tickKey]
    const pow = (isAdd && baseIn) || (!baseIn && !isAdd) ? 0 : 1
    const nextTick = tick! + tempCreatedPool.config.tickSpacing * Math.pow(-1, pow)
    const p = getTickPrice({
      pool: tempCreatedPool,
      tick: nextTick,
      baseIn
    })
    if (!p) return
    const anotherSideTick = tickPriceRef.current?.[side === Side.Left ? 'tickUpper' : 'tickLower']
    if (nextTick === anotherSideTick) return
    tickPriceRef.current[tickKey] = p.tick
    tickPriceRef.current[side === Side.Left ? 'priceLower' : 'priceUpper'] = p.price.toString()
    handleInputChange(formatDecimalToDigit({ val: p.price.toString() }), 0, side)
  })

  const computeFullRange = useEvent(() => {
    const minTick = getTickPrice({
      pool: tempCreatedPool,
      tick: parseInt((-443636 / tempCreatedPool!.config.tickSpacing).toString()) * tempCreatedPool!.config.tickSpacing,
      baseIn
    })
    const maxTick = getTickPrice({
      pool: tempCreatedPool,
      tick: parseInt((443636 / tempCreatedPool!.config.tickSpacing).toString()) * tempCreatedPool!.config.tickSpacing,
      baseIn
    })
    fullRangeTickRef.current = {
      tickLower: minTick?.tick,
      priceLower: baseIn
        ? minTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR).toFixed(30)
        : new Decimal(1).div(minTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR) || 1).toFixed(30),
      tickUpper: maxTick?.tick,
      priceUpper: baseIn
        ? maxTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR).toFixed(30)
        : new Decimal(1).div(maxTick?.price.toDecimalPlaces(30, Decimal.ROUND_FLOOR) || 1).toFixed(30)
    }
  })

  const handleSwitchBase = useCallback((v: 'base' | 'quote') => {
    switchRef.current = true
    setCurrentPrice((val) => {
      const newPrice = val ? new Decimal(1).div(val).toString() : val
      handleLeftRangeBlur(new Decimal(newPrice).mul(0.5).toString())
      handleRightRangeBlur(new Decimal(newPrice).mul(1.5).toString())
      return newPrice
    })
    onSwitchBase(v === 'base')
  }, [])

  useEffect(() => {
    if (!isFullRange || !tempCreatedPool) return
    if (isFullRange) {
      computeFullRange()
      return
    }
  }, [tempCreatedPool, tempCreatedPool?.price, baseIn, isFullRange])

  useEffect(() => {
    if (!currentPrice) {
      setPriceRange(['', ''])
      return
    }
    if (hasInitPriceRange) return
    handleLeftRangeBlur(new Decimal(currentPrice).mul(0.5).toString())
    handleRightRangeBlur(new Decimal(currentPrice).mul(1.5).toString())
  }, [currentPrice, hasInitPriceRange, tempCreatedPool, handleLeftRangeBlur, handleRightRangeBlur])

  const handleClick = useEvent(() => {
    setPriceReverse((val) => {
      return !val
    })
    handleLeftRangeBlur(new Decimal(1).div(priceRangeRef.current[1]).toString())
    handleRightRangeBlur(new Decimal(1).div(priceRangeRef.current[0]).toString())
  })
  if (completed)
    return (
      <PanelCard px={[3, 6]} py={[3, 4]} fontSize="sm" fontWeight="500" color={colors.textSecondary}>
        <Flex alignItems="center" gap="2" justifyContent="space-between">
          <VStack align="stretch">
            <HStack>
              <Text variant="label" fontSize="sm">
                {t('clmm.initial_price')}:
              </Text>
              <Text>{formatCurrency(currentPrice, { decimalPlaces: Math.max(token1.decimals, token2.decimals) })}</Text>
              <Text>
                {t('common.per_unit', {
                  subA: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintB' : 'mintA'].symbol),
                  subB: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintA' : 'mintB'].symbol)
                })}
              </Text>
            </HStack>
            <HStack>
              <Text variant="label" fontSize="sm">
                {t('clmm.price_range')}:
              </Text>
              <Text>
                {isFullRange
                  ? `${formatCurrency(new Decimal(fullRangeTickRef.current.priceLower || 0).toFixed(24), {
                      maximumDecimalTrailingZeroes: 5,
                      abbreviated: true
                    })} - ${formatCurrency(new Decimal(fullRangeTickRef.current.priceUpper || 0).toFixed(24), {
                      maximumDecimalTrailingZeroes: 5,
                      abbreviated: true
                    })}`
                  : `${formatToRawLocaleStr(priceRange[0])} - ${formatToRawLocaleStr(priceRange[1])}`}
              </Text>
              <Text>
                {t('common.per_unit', {
                  subA: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintB' : 'mintA'].symbol),
                  subB: wSolToSolString(tempCreatedPool?.[baseIn ? 'mintA' : 'mintB'].symbol)
                })}
              </Text>
            </HStack>
          </VStack>
          <EditIcon cursor="pointer" onClick={() => onEdit(1)} />
        </Flex>
      </PanelCard>
    )

  return (
    <PanelCard p={[3, 6]}>
      <Desktop>
        <Flex mb={3} justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="500">
            {t('clmm.price_setting')}
          </Text>
          <Tabs
            variant="squarePanelDark"
            onChange={handleSwitchBase}
            defaultValue={baseIn ? 'base' : 'quote'}
            value={baseIn ? 'base' : 'quote'}
            items={[
              {
                value: 'base',
                label: t('common.subject_price', { subject: wSolToSolString(tempCreatedPool?.mintA.symbol || token1.symbol) })
              },
              {
                value: 'quote',
                label: t('common.subject_price', { subject: wSolToSolString(tempCreatedPool?.mintB.symbol || token2.symbol) })
              }
            ]}
          />
        </Flex>
      </Desktop>
      <Text mb="2" variant="title">
        {t('clmm.initial_price')}
      </Text>
      <DecimalInput
        decimals={decimals}
        variant="filledDark"
        ctrSx={{ bg: colors.backgroundDark, borderRadius: 'xl', px: '4px', py: ['2px', '6px'] }}
        inputGroupSx={{ bg: colors.backgroundDark, alignItems: 'center', borderRadius: 'xl' }}
        inputSx={{ pl: '4px', fontWeight: 500, fontSize: ['md', 'xl'] }}
        postfix={
          <>
            <Desktop>
              <Text variant="label" size="sm" whiteSpace="nowrap" px={4}>
                {t('common.per_unit', {
                  subA: wSolToSolString(tokenBase.symbol),
                  subB: wSolToSolString(tokenQuote.symbol)
                })}
              </Text>
            </Desktop>
            <Mobile>
              <Tabs
                variant="squarePanelDark"
                onChange={handleSwitchBase}
                defaultValue={baseIn ? 'base' : 'quote'}
                value={baseIn ? 'base' : 'quote'}
                items={[
                  {
                    value: 'base',
                    label: t('common.subject_price', { subject: wSolToSolString(tempCreatedPool?.mintA.symbol || token1.symbol) })
                  },
                  {
                    value: 'quote',
                    label: t('common.subject_price', { subject: wSolToSolString(tempCreatedPool?.mintB.symbol || token2.symbol) })
                  }
                ]}
              />
            </Mobile>
          </>
        }
        value={currentPrice}
        onChange={handlePriceChange}
      />
      <Flex alignItems="center" gap="2" mt="2" mb="4">
        <Text variant="label" fontSize="sm">
          {t('field.current_price')}:
        </Text>
        <QuestionToolTip iconType="question" label={t('create_standard_pool.current_price_tooltip')} />
        <Text color={colors.textSecondary} fontSize="sm">
          {formatToRawLocaleStr(onlinePrice)}{' '}
          {t('common.per_unit', {
            subA: wSolToSolString(priceReverse ? tokenQuote.symbol : tokenBase.symbol),
            subB: wSolToSolString(priceReverse ? tokenBase.symbol : tokenQuote.symbol)
          })}
        </Text>
        <Box
          border={`1px solid ${colors.secondary}`}
          p="1px"
          borderRadius="2px"
          width={'fit-content'}
          height={'fit-content'}
          lineHeight={0}
        >
          <HorizontalSwitchSmallIcon cursor="pointer" onClick={handleClick} width="10" height="10" fill={colors.secondary} />
        </Box>
      </Flex>

      <Text variant="title" mb="2" userSelect="none">
        {t('clmm.price_range')}
      </Text>
      <Tabs
        w="full"
        mb="3"
        tabListSX={{ display: 'flex' }}
        tabItemSX={{ flex: 1 }}
        variant="squarePanelDark"
        defaultValue={rangeMode}
        value={rangeMode}
        onChange={setRangeMode}
        items={[
          {
            value: 'full',
            label: t('clmm.full_range')
          },
          {
            value: 'custom',
            label: t('clmm.custom')
          }
        ]}
      />
      {rangeMode === 'full' ? null : (
        <SimpleGrid gridTemplate={'repeat(auto-fill, 1fr)'} gridAutoFlow={['row', 'column']} gap={[3, 4]} mb="4">
          <PriceRangeInputBox
            side={Side.Left}
            topLabel={t('field.min')}
            currentPriceRangeValue={priceRange[0]}
            decimals={Math.max(8, decimals)}
            base={tokenBase}
            quote={tokenQuote}
            onFocus={() => handleFocus(true)}
            onAdd={() => handleClickAdd(Side.Left, true)}
            onMinus={() => handleClickAdd(Side.Left, false)}
            onInputBlur={handleLeftRangeBlur}
            onInputChange={handleInputChange}
          />
          <PriceRangeInputBox
            side={Side.Right}
            topLabel={t('field.max')}
            currentPriceRangeValue={priceRange[1]}
            decimals={Math.max(8, decimals)}
            base={tokenBase}
            quote={tokenQuote}
            onFocus={() => handleFocus(false)}
            onAdd={() => handleClickAdd(Side.Right, true)}
            onMinus={() => handleClickAdd(Side.Right, false)}
            onInputBlur={handleRightRangeBlur}
            onInputChange={handleInputChange}
          />
        </SimpleGrid>
      )}

      <Text variant="title" mb="2" userSelect="none">
        {t('field.start_time')}
      </Text>
      <Tabs
        w="full"
        mb="3"
        tabListSX={{ display: 'flex' }}
        tabItemSX={{ flex: 1 }}
        variant="squarePanelDark"
        value={startDateMode}
        onChange={(val) => {
          setStartDateMode(val)
          if (val === 'now') setStartDate(undefined)
          else setStartDate(dayjs().add(10, 'minutes').toDate())
        }}
        items={[
          {
            value: 'now',
            label: t('clmm.start_now')
          },
          {
            value: 'custom',
            label: t('clmm.custom')
          }
        ]}
      />
      {isStartNow ? null : (
        <div ref={popperRef}>
          <DecimalInput
            postFixInField
            readonly
            onClick={() => setIsPopperOpen(true)}
            variant="filledDark"
            value={dayjs(startDate).format('YYYY/MM/DD')}
            ctrSx={{ bg: colors.backgroundDark, borderRadius: 'xl', pr: '14px', py: '6px' }}
            inputGroupSx={{ w: 'fit-content', bg: colors.backgroundDark, alignItems: 'center', borderRadius: 'xl' }}
            inputSx={{ pl: '4px', fontWeight: 500, fontSize: ['md', 'xl'] }}
            postfix={
              <Text variant="label" size="sm" whiteSpace="nowrap">
                {dayjs(startDate).utc().format('HH:mm (UTC)')}
              </Text>
            }
          />
          {isPopperOpen && (
            <FocusTrap
              active
              focusTrapOptions={{
                initialFocus: false,
                allowOutsideClick: true,
                clickOutsideDeactivates: true,
                onDeactivate: closePopper
              }}
            >
              <Box
                tabIndex={-1}
                style={{
                  ...popper.styles.popper,
                  zIndex: 3
                }}
                className="dialog-sheet"
                {...popper.attributes.popper}
                ref={setPopperElement}
                role="dialog"
                aria-label="DayPicker calendar"
                bg={colors.backgroundDark}
                rounded={'xl'}
              >
                <DatePick
                  initialFocus={isPopperOpen}
                  mode="single"
                  selected={startDate || new Date()}
                  onSelect={(val) =>
                    setStartDate((preVal) => dayjs(val).set('hour', dayjs(preVal).hour()).set('minute', dayjs(preVal).minute()).toDate())
                  }
                />
                <Flex>
                  <HourPick
                    sx={{ w: '100%', borderRadius: '0', fontSize: 'md', px: '20px' }}
                    value={dayjs(startDate).hour()}
                    onChange={(h) => setStartDate((val) => dayjs(val).set('h', h).toDate())}
                  />
                  <MinutePick
                    sx={{ w: '100%', borderRadius: '0', fontSize: 'md', px: '20px' }}
                    value={dayjs(startDate).minute()}
                    onChange={(m) => setStartDate((val) => dayjs(val).set('m', m).toDate())}
                  />
                </Flex>
                <Flex px="10px" justifyContent="flex-end" borderRadius="0 0 10px 10px">
                  <Button variant="outline" size="sm" onClick={closePopper}>
                    {t('button.confirm')}
                  </Button>
                </Flex>
              </Box>
            </FocusTrap>
          )}
        </div>
      )}
      <Button
        mt="4"
        isDisabled={!!error}
        onClick={() => {
          const dataSource = isFullRange ? fullRangeTickRef.current : tickPriceRef.current
          onConfirm({
            price: currentPrice,
            priceLower: dataSource.priceLower!,
            priceUpper: dataSource.priceUpper!,
            tickLower: dataSource.tickLower!,
            tickUpper: dataSource.tickUpper!,
            startTime: startDate ? dayjs(startDate).valueOf() / 1000 : undefined
          })
        }}
      >
        {error || t('button.continue')}
      </Button>
    </PanelCard>
  )
}
function PriceRangeInputBox(props: {
  side: Side
  topLabel: string
  currentPriceRangeValue: string
  decimals: number
  base: ApiV3Token
  quote: ApiV3Token
  onFocus?: () => void
  onAdd: () => void
  onMinus: () => void
  onInputBlur: (val: string, side?: string | undefined) => void
  onInputChange: (val: string, valNumber: number, side?: string | undefined) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <Desktop>
        <Flex alignItems="center" gap="1" sx={{ bg: colors.backgroundDark, alignItems: 'center', borderRadius: 'xl', p: '8px' }}>
          <Minus style={IconStyle} onClick={props.onMinus} />
          <Box textAlign="center" flexGrow={1}>
            <Text whiteSpace={'nowrap'} variant="label" userSelect="none">
              {props.topLabel}
            </Text>
            <DecimalInput
              variant="filledDark"
              ctrSx={RangeInputStyle.ctr}
              inputSx={RangeInputStyle.input}
              inputGroupSx={RangeInputStyle.inputGroup}
              side={props.side}
              value={props.currentPriceRangeValue}
              decimals={props.decimals}
              onFocus={props.onFocus}
              onBlur={props.onInputBlur}
              onChange={props.onInputChange}
            />
            <Text variant="label" userSelect="none">
              {t('common.per_unit', {
                subA: wSolToSolString(props.base.symbol),
                subB: wSolToSolString(props.quote.symbol)
              })}
            </Text>
          </Box>
          <Plus style={IconStyle} cursor="pointer" onClick={props.onAdd} />
        </Flex>
      </Desktop>
      <Mobile>
        <HStack>
          <Text variant="label" userSelect="none" width={'3em'}>
            {props.topLabel}
          </Text>
          <HStack sx={{ bg: colors.backgroundDark, alignItems: 'center', borderRadius: 'xl', p: '8px' }}>
            <DecimalInput
              variant="unstyled"
              ctrSx={RangeInputStyle.ctr}
              inputSx={RangeInputStyle.input}
              inputGroupSx={RangeInputStyle.inputGroup}
              side={props.side}
              value={props.currentPriceRangeValue}
              decimals={props.decimals}
              onFocus={props.onFocus}
              onBlur={props.onInputBlur}
              onChange={props.onInputChange}
            />
            <Text variant="label" userSelect="none" whiteSpace={'nowrap'}>
              {t('common.per_unit', {
                subA: wSolToSolString(props.base.symbol),
                subB: wSolToSolString(props.quote.symbol)
              })}
            </Text>
          </HStack>
        </HStack>
      </Mobile>
    </>
  )
}
