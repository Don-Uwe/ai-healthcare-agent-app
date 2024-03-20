import { useCallback, useEffect, useState, useRef } from 'react'
import { Box, Flex, HStack, NumberInput, NumberInputField, Text, VStack, useDisclosure } from '@chakra-ui/react'
import shallow from 'zustand/shallow'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import FocusTrap from 'focus-trap-react'
import { usePopper } from 'react-popper'
import { useTranslation } from 'react-i18next'

import { DatePick, HourPick, MinutePick } from '@/components/DateTimePicker'
import DecimalInput from '@/components/DecimalInput'
import Button from '@/components/Button'
import TokenInput from '@/components/TokenInput'
import Tabs from '@/components/Tabs'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import HorizontalSwitchSmallIcon from '@/icons/misc/HorizontalSwitchSmallIcon'
import AddLiquidityPlus from '@/icons/misc/AddLiquidityPlus'
import { useTokenStore, useLiquidityStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { wSolToSolString, wsolToSolToken } from '@/utils/token'
import { numberRegExp } from '@/utils/numberish/regex'
import { TxErrorModal } from '@/components/Modal/TxErrorModal'
import useTokenPrice from '@/hooks/token/useTokenPrice'

import CreateSuccessModal from './CreateSuccessModal'
import useInitPoolSchema from '../hooks/useInitPoolSchema'

import Decimal from 'decimal.js'
import dayjs from 'dayjs'

type InitializeProps = {
  marketId?: string
  mintA?: string
  mintB?: string
  onGoBack?: () => void
}

export default function Initialize({ marketId, mintA, mintB }: InitializeProps) {
  const { t } = useTranslation()

  const [tokenMap, getChainTokenInfo] = useTokenStore((s) => [s.tokenMap, s.getChainTokenInfo], shallow)
  const [createPoolAct, newCreatedPool] = useLiquidityStore((s) => [s.createPoolAct, s.newCreatedPool], shallow)

  const [baseIn, setBaeIn] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const { isOpen: isTxError, onOpen: onTxError, onClose: offTxError } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()

  const { isOpen: isPopperOpen, onOpen: onPopperOpen, onClose: closePopper } = useDisclosure()
  const popperRef = useRef<HTMLDivElement>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const popper = usePopper(popperRef.current, popperElement, {
    placement: 'top-start'
  })
  const [{ baseToken, quoteToken }, setMints] = useState<{ baseToken?: ApiV3Token; quoteToken?: ApiV3Token }>({
    baseToken: tokenMap.get(mintA || ''),
    quoteToken: tokenMap.get(mintB || '')
  })
  const [price, setPrice] = useState('')
  const [tokenAmount, setTokenAmount] = useState<{ base: string; quote: string }>({ base: '', quote: '' })
  const [baseSymbol, quoteSymbol] = [wSolToSolString(baseToken?.symbol), wSolToSolString(quoteToken?.symbol)]

  const [startDateMode, setStartDateMode] = useState<'now' | 'custom'>('now')
  const isStartNow = startDateMode === 'now'

  const { data: tokenPrices } = useTokenPrice({
    mintList: [baseToken?.address, quoteToken?.address]
  })

  const [basePrice, quotePrice] = baseIn
    ? [tokenPrices[baseToken?.address || '']?.value ?? 0, tokenPrices[quoteToken?.address || '']?.value ?? 0]
    : [tokenPrices[quoteToken?.address || '']?.value ?? 0, tokenPrices[baseToken?.address || '']?.value ?? 0]

  const error = useInitPoolSchema({ price, baseToken, quoteToken, tokenAmount, startTime: startDate })

  const currentPrice = new Decimal(basePrice || 0)
    .div(quotePrice || 1)
    .toDecimalPlaces(baseToken?.decimals ?? 6)
    .toString()

  useEffect(() => {
    if (!tokenMap.size) return
    const data: { baseToken?: ApiV3Token; quoteToken?: ApiV3Token } = {
      baseToken: tokenMap.get(mintA || ''),
      quoteToken: tokenMap.get(mintB || '')
    }
    setMints(data)
  }, [mintA, mintB, tokenMap, getChainTokenInfo])

  useEffect(() => () => useLiquidityStore.setState({ newCreatedPool: undefined }), [])

  const onInitializeClick = () => {
    onLoading()
    createPoolAct({
      pool: {
        marketId: marketId!,
        mintA: baseToken!,
        mintB: quoteToken!
      },
      baseAmount: new Decimal(tokenAmount.base).mul(10 ** baseToken!.decimals).toString(),
      quoteAmount: new Decimal(tokenAmount.quote).mul(10 ** quoteToken!.decimals).toString(),
      startTime: startDate,
      onError: onTxError,
      onFinally: offLoading
    })
  }

  // const onGoBackClick = useCallback(() => {
  //   router.back()
  //   onGoBack?.()
  // }, [onGoBack, router])

  return (
    <VStack borderRadius="20px" w="full" bg={colors.backgroundLight} p={6} spacing={5}>
      {/* initial liquidity */}
      <Flex direction="column" w="full" align={'flex-start'} gap={4}>
        <Text fontWeight="medium" fontSize="sm">
          {t('create_standard_pool.initial_liquidity')}
        </Text>
        <Flex direction="column" w="full" align={'center'}>
          <TokenInput
            ctrSx={{ w: '100%', textColor: colors.textSecondary }}
            topLeftLabel={t('create_standard_pool.base_token_initial_liquidity')}
            disableSelectToken
            hideControlButton
            value={tokenAmount.base}
            onChange={(val) => setTokenAmount((prev) => ({ ...prev, base: val }))}
            token={baseToken ? wsolToSolToken(baseToken) : undefined}
          />
          <Box my={'-10px'} zIndex={1}>
            <AddLiquidityPlus />
          </Box>
          <TokenInput
            ctrSx={{ w: '100%', textColor: colors.textSecondary }}
            topLeftLabel={t('create_standard_pool.quote_token_initial_liquidity')}
            disableSelectToken
            hideControlButton
            onChange={(val) => setTokenAmount((prev) => ({ ...prev, quote: val }))}
            value={tokenAmount.quote}
            token={quoteToken ? wsolToSolToken(quoteToken) : undefined}
          />
        </Flex>
      </Flex>

      {/* initial price */}
      <Flex direction="column" w="full" align={'flex-start'} gap={3}>
        <HStack gap={1}>
          <Text fontWeight="medium" fontSize="sm">
            Initial price
          </Text>
          <QuestionToolTip iconType="info" label={t('create_standard_pool.initial_price_tooltip')} />
        </HStack>
        <Flex
          w="full"
          flex={1}
          bg={colors.backgroundDark}
          py={3}
          px={4}
          color={colors.textSecondary}
          borderRadius="12px"
          align="center"
          justify={'space-between'}
        >
          <NumberInput
            variant="clean"
            value={price}
            onChange={setPrice}
            min={0}
            flexGrow={1}
            fontWeight="500"
            fontSize="xl"
            isValidCharacter={useCallback((val: string) => numberRegExp.test(val), [])}
          >
            <NumberInputField />
          </NumberInput>
          <Text fontWeight="400" fontSize="sm" opacity={0.5}>
            {baseIn ? quoteSymbol : baseSymbol}/{baseIn ? baseSymbol : quoteSymbol}
          </Text>
        </Flex>
        <HStack spacing={1}>
          <Text fontWeight="400" fontSize="sm" color={colors.textTertiary}>
            {t('create_standard_pool.current_price')}:
          </Text>
          <Text pl={1} fontSize="sm" color={colors.textSecondary} fontWeight="medium">
            1 {baseIn ? baseSymbol : quoteSymbol} ≈ {currentPrice} {baseIn ? quoteSymbol : baseSymbol}
          </Text>
          <Box
            padding="1px"
            border={`1px solid ${colors.secondary}`}
            borderRadius="2px"
            width={'fit-content'}
            height={'fit-content'}
            lineHeight={0}
          >
            <HorizontalSwitchSmallIcon fill={colors.secondary} cursor="pointer" onClick={() => setBaeIn((val) => !val)} />
          </Box>
        </HStack>
      </Flex>

      {/* Fee Tier */}
      <Flex direction="column" w="full" align={'flex-start'} gap={3}>
        <Text fontWeight="medium" fontSize="sm">
          {t('field.fee_tier')}
        </Text>
        <Flex flexWrap="wrap" justifyContent="space-evenly" gap="2">
          {/* TODO need fee tier data */}
          {Object.values({
            1: { id: '1', selected: false, tradeFeeRate: 0.25 },
            2: { id: '2', selected: true, tradeFeeRate: 1 },
            3: { id: '3', selected: false, tradeFeeRate: 4 },
            4: { id: '4', selected: false, tradeFeeRate: 6 }
          }).map((config) => {
            const { selected, tradeFeeRate, id } = config
            return (
              <Flex
                key={id}
                flexDirection="column"
                gap="2.5"
                bg={colors.selectInactive}
                px="16px"
                py="8px"
                borderRadius="41px"
                textAlign="center"
                fontSize="sm"
                sx={{
                  cursor: 'pointer',
                  border: `1px solid ${selected ? colors.secondary : 'transparent'}`,
                  fontWeight: `${selected ? 500 : 400}`
                }}
              >
                <Text>{tradeFeeRate}%</Text>
              </Flex>
            )
          })}
        </Flex>
      </Flex>

      {/* start time */}
      <Flex direction="column" w="full" gap={3}>
        <Text fontWeight="medium" textAlign="left" fontSize="sm">
          {t('field.start_time')}:
        </Text>
        <Tabs
          w="full"
          tabListSX={{ display: 'flex' }}
          tabItemSX={{ flex: 1, fontWeight: 400, fontSize: '12px', py: '4px' }}
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
              label: t('create_standard_pool.start_now')
            },
            {
              value: 'custom',
              label: t('create_standard_pool.custom')
            }
          ]}
        />
        {isStartNow ? null : (
          <div ref={popperRef}>
            <DecimalInput
              postFixInField
              readonly
              onClick={onPopperOpen}
              variant="filledDark"
              value={startDate ? dayjs(startDate).format('YYYY/MM/DD') : ''}
              ctrSx={{ bg: colors.backgroundDark, borderRadius: 'xl', pr: '14px', py: '6px' }}
              inputGroupSx={{ w: 'fit-content', bg: colors.backgroundDark, alignItems: 'center', borderRadius: 'xl' }}
              inputSx={{ pl: '4px', fontWeight: 500, fontSize: ['md', 'xl'] }}
              postfix={
                <Text variant="label" size="sm" whiteSpace="nowrap" fontSize="xl" fontWeight="normal" color={colors.textSecondary}>
                  {startDate ? dayjs(startDate).utc().format('HH:mm (UTC)') : ''}
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
                      setStartDate((preVal) =>
                        dayjs(val)
                          .set('hour', dayjs(preVal).hour())
                          .set(
                            'minute',
                            dayjs(preVal)
                              .add(preVal ? 0 : 10, 'minutes')
                              .minute()
                          )
                          .toDate()
                      )
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
                  <Flex bg={colors.backgroundDark} px="10px" justifyContent="flex-end" borderRadius="0 0 10px 10px">
                    <Button variant="outline" size="sm" onClick={closePopper}>
                      {t('button.confirm')}
                    </Button>
                  </Flex>
                </Box>
              </FocusTrap>
            )}
          </div>
        )}
        <HStack>
          <Text fontWeight="medium" fontSize="sm" color={colors.semanticWarning} my="-2">
            {/* TODO need creation fee */}
            {t('create_standard_pool.pool_creation_fee_note', { subject: `${''}` })}
          </Text>
          <QuestionToolTip iconType="info" label={t('create_standard_pool.pool_creation_fee_tooltip')} />
        </HStack>
        <Text color="red" my="-2">
          {error}
        </Text>
      </Flex>
      <HStack w="full" spacing={4} mt={2}>
        {/* <Button variant="outline" w="fit-content" onClick={onGoBackClick}>
          {t('button.back')}
        </Button> */}
        <Button w="full" isLoading={isLoading} isDisabled={!!error} onClick={onInitializeClick}>
          {t('create_standard_pool.button_initialize_liquidity_pool')}
        </Button>
      </HStack>
      {newCreatedPool ? <CreateSuccessModal ammId={newCreatedPool.ammId.toString()} /> : null}
      <TxErrorModal description="Failed to create pool. Please try again later." isOpen={isTxError} onClose={offTxError} />
    </VStack>
  )
}
