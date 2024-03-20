import AmountSlider from '@/components/AmountSlider'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenInput from '@/components/TokenInput'
import useClmmBalance from '@/hooks/portfolio/clmm/useClmmBalance'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import useFetchClmmRewardInfo from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import { useAppStore, useClmmStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'
import formatNumber, { trimTailingZero } from '@/utils/numberish/formatNumber'
import { getFirstNonZeroDecimal } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import {
  Box,
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
import Decimal from 'decimal.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { removeValidateSchema } from './validateSchema'
import { useEvent } from '@/hooks/useEvent'

export default function RemoveLiquidityModal({
  isOpen,
  onClose,
  poolInfo,
  position
}: {
  isOpen: boolean
  onClose: () => void
  poolInfo: ApiV3PoolInfoConcentratedItem
  position: PositionWithUpdateFn
}) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.removeConcentratedPosition)
  const { getPriceAndAmount } = useClmmBalance({})
  const sliderRef = useRef({ changeValue: (_val: number) => {} })
  const focusARef = useRef(true)
  const [decimalA, decimalB] = [poolInfo.mintA.decimals, poolInfo.mintB.decimals]
  const { amountA, amountB } = getPriceAndAmount({ poolInfo, position })

  const [sending, setIsSending] = useState(false)
  const [percent, setPercent] = useState(0)

  const [positionAmountA, positionAmountB] = [amountA.toString(), amountB.toString()]
  const [tokenAmount, setTokenAmount] = useState(['', ''])
  const [minTokenAmount, setMinTokenAmount] = useState(['', ''])

  const { rewards } = useFetchClmmRewardInfo({
    poolInfo,
    position,
    shouldFetch: false,
    tickLowerPrefetchData: position.tickLowerRpcData,
    tickUpperPrefetchData: position.tickUpperRpcData
  })

  const handleFocusA = useCallback(() => (focusARef.current = true), [])
  const handleFocusB = useCallback(() => (focusARef.current = false), [])

  const removeLiquidityAct = useClmmStore((s) => s.removeLiquidityAct)

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

  useEffect(() => {
    setPercent(0)
    setTokenAmount(['', ''])
  }, [isOpen])

  useEffect(() => {
    setMinTokenAmount([
      new Decimal(positionAmountA).mul(percent / 100).toString(),
      new Decimal(positionAmountB).mul(percent / 100).toString()
    ])
  }, [tokenAmount, percent])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('clmm.modal_header_remove_liquidity')}</ModalHeader>
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
                  <Text>{formatNumber(minTokenAmount[0], { maxDecimalCount: getFirstNonZeroDecimal(minTokenAmount[0]) + 1 })}</Text>
                  <Text color={colors.textTertiary}>{getMintSymbol({ mint: poolInfo.mintA, transformSol: true })}</Text>
                  <Text color={colors.textTertiary}>+</Text>
                  <Text>{formatNumber(minTokenAmount[1], { maxDecimalCount: getFirstNonZeroDecimal(minTokenAmount[1]) + 1 })}</Text>
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
                        <Text>
                          {trimTailingZero(formatNumber(rewardAmount, { maxDecimalCount: getFirstNonZeroDecimal(rewardAmount) + 1 }))}
                        </Text>
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
                onSuccess: () => {
                  setPercent(0)
                  setTokenAmount(['', ''])
                  setMinTokenAmount(['', ''])
                  if (percent >= 100) onClose()
                },
                onFinally: () => {
                  setIsSending(false)
                  onClose()
                }
              })
            }}
          >
            {featureDisabled ? t('common.disabled') : position.liquidity.isZero() ? t('clmm.close_position') : error || t('button.confirm')}
          </Button>
          <Button w="full" variant="ghost" fontSize="sm" color={colors.textSecondary} onClick={onClose}>
            {t('button.cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
