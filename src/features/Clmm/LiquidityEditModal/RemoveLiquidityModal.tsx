import AmountSlider from '@/components/AmountSlider'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenInput from '@/components/TokenInput'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import useClmmBalance from '@/hooks/portfolio/clmm/useClmmBalance'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import useFetchClmmRewardInfo from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import { useAppStore, useClmmStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'
import { formatCurrency, getFirstNonZeroDecimal } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import {
  Box,
  Checkbox,
  Collapse,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import { SlippageSettingField } from '@/components/SlippageAdjuster/SlippageSettingField'
import Decimal from 'decimal.js'
import { useCallback, useEffect, useRef, useState, ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { removeValidateSchema } from './validateSchema'
import { useEvent } from '@/hooks/useEvent'
import { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import { useDisclosure } from '@/hooks/useDelayDisclosure'

export default function RemoveLiquidityModal({
  isOpen,
  onClose,
  onSyncSending,
  onRefresh,
  poolInfo,
  position,
  initRpcPoolData
}: {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
  onSyncSending: (val: boolean) => void
  poolInfo: ApiV3PoolInfoConcentratedItem
  position: PositionWithUpdateFn
  initRpcPoolData?: RpcPoolData
}) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.removeConcentratedPosition)
  const removeLiquidityAct = useClmmStore((s) => s.removeLiquidityAct)
  const { getPriceAndAmount } = useClmmBalance({})
  const sliderRef = useRef({ changeValue: (_val: number) => {} })
  const focusARef = useRef(true)
  const [decimalA, decimalB] = [poolInfo.mintA.decimals, poolInfo.mintB.decimals]
  const { amountSlippageA, amountSlippageB } = getPriceAndAmount({ poolInfo, position })
  const circleRef = useRef<IntervalCircleHandler>(null)
  const { isOpen: isSlippageOpen, onToggle: onToggleSlippage, onClose: onSlippageClose } = useDisclosure()

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    onRefresh?.()
  })

  const handleCloseModal = useEvent(() => {
    onClose()
    onSlippageClose()
  })

  const [sending, setIsSending] = useState(false)
  const [percent, setPercent] = useState(0)
  const [closePosition, setClosePosition] = useState(true)
  const [closePositionOpen, setClosePositionOpen] = useState(false)

  const [positionAmountA, positionAmountB] = [
    amountSlippageA.toDecimalPlaces(poolInfo.mintA.decimals, Decimal.ROUND_FLOOR).toString(),
    amountSlippageB.toDecimalPlaces(poolInfo.mintB.decimals, Decimal.ROUND_FLOOR).toString()
  ]
  const [tokenAmount, setTokenAmount] = useState(['', ''])
  const [minTokenAmount, setMinTokenAmount] = useState(['', ''])

  const { rewards } = useFetchClmmRewardInfo({
    poolInfo,
    position,
    subscribe: false,
    shouldFetch: false,
    initRpcPoolData,
    tickLowerPrefetchData: position.tickLowerRpcData,
    tickUpperPrefetchData: position.tickUpperRpcData
  })

  const handleFocusA = useCallback(() => (focusARef.current = true), [])
  const handleFocusB = useCallback(() => (focusARef.current = false), [])

  let error = undefined
  try {
    removeValidateSchema(t).validateSync({
      tokenAmount,
      positionAmountA,
      positionAmountB
    })
    error = undefined
  } catch (e: any) {
    error = e.message as string
  }

  const debounceSetPercent = useEvent(
    debounce((percent: number) => {
      setPercent(percent)
      sliderRef.current.changeValue(percent)
    }, 100)
  )

  const handleAmountAChange = useCallback(
    (val: string) =>
      setTokenAmount(() => {
        if (!val) return ['', '']
        const inputRate = new Decimal(val).gte(positionAmountA) ? new Decimal(1) : Decimal.min(new Decimal(val).div(positionAmountA), 1)
        debounceSetPercent(inputRate.mul(100).toDecimalPlaces(2).toNumber())
        return [val, new Decimal(positionAmountB).mul(inputRate).toDecimalPlaces(decimalB).toString()]
      }),
    [debounceSetPercent, positionAmountA, positionAmountB, decimalB]
  )
  const handleAmountBChange = useCallback(
    (val: string) => {
      setTokenAmount(() => {
        if (!val) return ['', '']
        const inputRate = new Decimal(val).gte(positionAmountB) ? new Decimal(1) : Decimal.min(new Decimal(val).div(positionAmountB), 1)
        debounceSetPercent(inputRate.mul(100).toDecimalPlaces(2).toNumber())
        return [new Decimal(positionAmountA).mul(inputRate).toDecimalPlaces(decimalA).toString(), val]
      })
    },
    [debounceSetPercent, positionAmountA, positionAmountB, decimalA]
  )

  const debounceCalculate = useCallback(
    debounce((percent: number) => {
      setTokenAmount([
        new Decimal(positionAmountA).mul(percent).toDecimalPlaces(decimalA).toString(),
        new Decimal(positionAmountB).mul(percent).toDecimalPlaces(decimalB).toString()
      ])
    }),
    [positionAmountA, positionAmountB, decimalA, decimalB]
  )

  const handlePercentChange = useCallback(
    (val: number) => {
      setPercent(val)
      debounceCalculate(val / 100)
    },
    [debounceCalculate]
  )
  const handleClosePositionChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
    setClosePosition(!event.target.checked)
  })

  useEffect(() => {
    setPercent(0)
    setTokenAmount(['', ''])
  }, [isOpen])

  useEffect(() => {
    setClosePositionOpen(percent === 100)
  }, [percent])

  useEffect(() => {
    setMinTokenAmount([
      new Decimal(positionAmountA).mul(percent / 100).toString(),
      new Decimal(positionAmountB).mul(percent / 100).toString()
    ])
  }, [tokenAmount, percent])

  useEffect(() => {
    onSyncSending(sending)
    return () => onSyncSending(false)
  }, [sending, onSyncSending])

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display={'flex'} gap="2" alignItems="center">
          {t('clmm.modal_header_remove_liquidity')}
        </ModalHeader>
        <ModalCloseButton top="25px" />
        <ModalBody mt="10px">
          <TokenInput
            ctrSx={{ w: '100%', mb: '10px' }}
            disableSelectToken
            hideControlButton
            token={poolInfo.mintA}
            readonly={featureDisabled}
            value={tokenAmount[0]}
            forceBalanceAmount={positionAmountA}
            onFocus={handleFocusA}
            onChange={handleAmountAChange}
          />
          <TokenInput
            ctrSx={{ w: '100%' }}
            disableSelectToken
            hideControlButton
            token={poolInfo.mintB}
            readonly={featureDisabled}
            forceBalanceAmount={positionAmountB}
            onFocus={handleFocusB}
            value={tokenAmount[1]}
            onChange={handleAmountBChange}
          />
          <Box mt={[3, 4]}>
            <AmountSlider actionRef={sliderRef} percent={percent} onChange={handlePercentChange} isDisabled={position.liquidity.isZero()} />
            <Flex align="center" justify={closePositionOpen ? 'space-between' : 'flex-end'} gap={3}>
              {closePositionOpen && (
                <HStack gap={1}>
                  <Checkbox color={colors.textSecondary} isChecked={!closePosition} onChange={handleClosePositionChange}>
                    <Box fontSize="sm">{t('liquidity.keep_my_position_open')}</Box>
                  </Checkbox>
                  <QuestionToolTip
                    iconType="info"
                    iconProps={{ color: colors.textSecondary }}
                    label={t('liquidity.keep_my_position_open_tip')}
                  />
                </HStack>
              )}
              <Flex align="center" justify="flex-end" gap={3}>
                <SlippageAdjuster onClick={onToggleSlippage} />
                <IntervalCircle
                  componentRef={circleRef}
                  svgWidth={18}
                  strokeWidth={2}
                  trackStrokeColor={colors.secondary}
                  trackStrokeOpacity={0.5}
                  filledTrackStrokeColor={colors.secondary}
                  onClick={handleClick}
                  onEnd={onRefresh}
                />
              </Flex>
            </Flex>
            <Collapse in={isSlippageOpen} animateOpacity>
              <SlippageSettingField onClose={onSlippageClose} />
            </Collapse>
            <Flex
              flexDirection="column"
              gap="2"
              mt="2"
              px="4"
              py="2"
              border={`1px solid ${colors.backgroundTransparent10}`}
              bg={colors.backgroundTransparent07}
              rounded="xl"
            >
              <Text variant="title">{t('clmm.you_will_receive')}</Text>

              <Flex justifyContent="space-between" alignItems="center">
                <Flex alignItems="center" gap="2">
                  <Text fontSize={['sm', 'md']}>{t('clmm.pooled_assets')}</Text>
                  <TokenAvatarPair size={['smi', 'md']} token1={poolInfo.mintA} token2={poolInfo.mintB} />
                </Flex>
                <HStack fontSize={['xs', 'sm']} gap="1">
                  <Text>{formatCurrency(minTokenAmount[0], { decimalPlaces: getFirstNonZeroDecimal(minTokenAmount[0]) + 1 })}</Text>
                  <Text color={colors.textTertiary}>{getMintSymbol({ mint: poolInfo.mintA, transformSol: true })}</Text>
                  <Text color={colors.textTertiary}>+</Text>
                  <Text>{formatCurrency(minTokenAmount[1], { decimalPlaces: getFirstNonZeroDecimal(minTokenAmount[1]) + 1 })}</Text>
                  <Text color={colors.textTertiary}>{getMintSymbol({ mint: poolInfo.mintB, transformSol: true })}</Text>
                </HStack>
              </Flex>

              <Flex justifyContent="space-between" alignItems="center">
                <Flex alignItems="center" gap="2">
                  <Text fontSize={['sm', 'md']}>{t('clmm.pending_rewards')}</Text>
                  {poolInfo.rewardDefaultInfos.map((r, idx) => (
                    <TokenAvatar key={r.mint.address} size={['smi', 'md']} token={r.mint} ml={idx ? '-2px' : '0'} />
                  ))}
                </Flex>
                <Flex fontSize="sm" gap="1">
                  {position.rewardInfos.map((r, idx) => {
                    const rewardToken = poolInfo.rewardDefaultInfos[idx]?.mint
                    if (!rewardToken) return null

                    const rewardAmount = new Decimal(rewards[idx]?.toString() || 0).div(10 ** rewardToken.decimals).toString()
                    return (
                      <HStack key={`reward-${rewardToken.address}`} fontSize={['xs', 'sm']} gap="1">
                        {idx > 0 ? <Text>+</Text> : null}
                        <Text>{formatCurrency(rewardAmount, { decimalPlaces: getFirstNonZeroDecimal(rewardAmount) + 1 })}</Text>
                        <Text color={colors.textTertiary}>{getMintSymbol({ mint: rewardToken, transformSol: true })}</Text>
                      </HStack>
                    )
                  })}
                </Flex>
              </Flex>
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter mt="8" flexDirection="column" gap="2">
          <Button
            w="full"
            isDisabled={featureDisabled || (!position.liquidity.isZero() && !!error)}
            isLoading={sending}
            loadingText={t(position.liquidity.isZero() ? 'clmm.close_position' : 'liquidity.withdraw_liquidity') + '...'}
            onClick={() => {
              setIsSending(true)
              removeLiquidityAct({
                poolInfo,
                position,
                liquidity: new Decimal(position.liquidity.toString()).mul(percent / 100).toFixed(0),
                amountMinA: minTokenAmount[0],
                amountMinB: minTokenAmount[1],
                needRefresh: percent <= 100,
                closePosition: percent === 100 ? closePosition : undefined,
                onSent: () => {
                  setIsSending(false)
                  setPercent(0)
                  setTokenAmount(['', ''])
                  setMinTokenAmount(['', ''])
                  handleCloseModal()
                },
                onError: () => setIsSending(false)
              })
            }}
          >
            {featureDisabled ? t('common.disabled') : position.liquidity.isZero() ? t('clmm.close_position') : error || t('button.confirm')}
          </Button>
          <Button w="full" variant="ghost" fontSize="sm" color={colors.textSecondary} onClick={handleCloseModal}>
            {t('button.cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
