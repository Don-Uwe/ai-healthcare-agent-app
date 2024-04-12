import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Badge,
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  HStack
} from '@chakra-ui/react'
import { solToWSol } from '@raydium-io/raydium-sdk-v2'
import shallow from 'zustand/shallow'

import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { debounce } from '@/utils/functionMethods'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { useAppStore, useClmmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import Button from '@/components/Button'
import { wSolToSol } from '@/utils/token'
import CLMMTokenInputGroup, { InputSide } from '../components/TokenInputGroup'
import { liquidityValidateSchema } from './validateSchema'
import TokenAvatar from '@/components/TokenAvatar'
import toPercentString from '@/utils/numberish/toPercentString'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { calRatio } from '../utils/math'
import Decimal from 'decimal.js'
import BN from 'bn.js'

export default function AddLiquidityModal({
  isOpen,
  baseIn,
  onClose,
  onSyncSending,
  poolInfo,
  position
}: {
  isOpen: boolean
  baseIn: boolean
  onClose: () => void
  onSyncSending: (val: boolean) => void
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
}) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.addConcentratedPosition)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { getPriceAndAmount } = useClmmBalance({})
  const { priceLower, priceUpper, amountA, amountB } = getPriceAndAmount({ poolInfo, position })

  const currentPrice = baseIn ? new Decimal(poolInfo.price) : new Decimal(1).div(poolInfo.price)
  const [priceLowerDecimal, priceUpperDecimal] = baseIn
    ? [priceLower.price, priceUpper.price]
    : [new Decimal(1).div(priceUpper.price), new Decimal(1).div(priceLower.price)]

  const inRange = new Decimal(currentPrice).gte(priceLowerDecimal) && new Decimal(currentPrice).lte(priceUpperDecimal)
  const [sending, setIsSending] = useState(false)

  const [computePairAmount, increaseLiquidityAct] = useClmmStore((s) => [s.computePairAmount, s.increaseLiquidityAct], shallow)
  const [tokenAmount, setTokenAmount] = useState(['', ''])

  const computeRef = useRef(false)
  const focusPoolARef = useRef(true)
  const tickPriceRef = useRef<{ tickLower?: number; tickUpper?: number; priceLower?: string; priceUpper?: string; liquidity?: BN }>({
    tickLower: priceLower.tick,
    tickUpper: priceUpper.tick,
    priceLower: priceLowerDecimal.toString(),
    priceUpper: priceUpperDecimal.toString()
  })

  const disabledInput = inRange
    ? [false, false]
    : [new Decimal(poolInfo.price).gt(priceUpper.price), new Decimal(poolInfo.price).lt(priceLower.price)]

  const handleAmountChange = useCallback((val: string, side: string) => {
    setTokenAmount((preValue) => (side === InputSide.TokenA ? [val, preValue[1]] : [preValue[0], val]))
  }, [])

  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })

  const positionTotalVolume = amountA
    .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
    .add(amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0))

  const mintAVolume = new Decimal(tokenPrices[poolInfo.mintA.address!]?.value || 0).mul(tokenAmount[0] || 0)
  const mintBVolume = new Decimal(tokenPrices[poolInfo.mintB.address!]?.value || 0).mul(tokenAmount[1] || 0)
  const totalDeposited = mintAVolume.add(mintBVolume)

  const { ratioA, ratioB } = calRatio({
    price: poolInfo.price,
    amountA: tokenAmount[0],
    amountB: tokenAmount[1]
  })

  let error = undefined
  try {
    liquidityValidateSchema(t).validateSync({
      tokenAmount,
      balanceA: getTokenBalanceUiAmount({ mint: wSolToSol(poolInfo.mintA.address)!, decimals: poolInfo.mintA.decimals }).text,
      balanceB: getTokenBalanceUiAmount({ mint: wSolToSol(poolInfo.mintB.address)!, decimals: poolInfo.mintB.decimals }).text
    })

    error = undefined
  } catch (e: any) {
    error = e.message as string
  }

  const debounceCompute = useCallback(
    debounce((props: Parameters<typeof computePairAmount>[0]) => {
      computePairAmount(props).then((res) => {
        computeRef.current = !!res
        if (res) {
          tickPriceRef.current.liquidity = res.liquidity
          setTokenAmount((preValue) => {
            return focusPoolARef.current
              ? [preValue[0], props.amount ? res.amountSlippageB.toString() : '']
              : [props.amount ? res.amountSlippageA.toString() : '', preValue[1]]
          })
        }
      })
    }, 100),
    [baseIn]
  )

  const handleFocusChange = useCallback(
    (tokenMint?: string) =>
      (focusPoolARef.current = solToWSol(tokenMint || '').toBase58() === solToWSol(poolInfo.mintA.address || '').toBase58()),
    [poolInfo.mintA.address]
  )

  useEffect(() => {
    if (computeRef.current) {
      computeRef.current = false
      return
    }
    const amount = focusPoolARef.current ? tokenAmount[0] : tokenAmount[1]

    debounceCompute({
      ...tickPriceRef.current,
      pool: poolInfo,
      inputA: focusPoolARef.current,
      amount
    })
  }, [poolInfo, tokenAmount, debounceCompute])

  useEffect(() => {
    setTokenAmount(['', ''])
    setIsSending(false)
  }, [isOpen])

  useEffect(() => {
    onSyncSending(sending)
    return () => onSyncSending(false)
  }, [sending, onSyncSending])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" gap={[1, 2]} alignItems={'center'}>
          <Text>{t('clmm.modal_header_add_liquidity_to')}</Text>
          <TokenAvatarPair size={['smi', 'md']} token1={poolInfo.mintA} token2={poolInfo.mintB} />
          <Text>{poolInfo.poolName}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text variant="title">{t('clmm.current_position')}</Text>
          <Box
            rounded={'xl'}
            border={`1px solid ${colors.backgroundTransparent10}`}
            bg={colors.backgroundTransparent07}
            px={[3, 6]}
            py={[3, 4]}
            mt="2"
            mb="5"
          >
            <Flex alignItems="center">
              <Text fontSize={['md', 'xl']} fontWeight="500">
                {formatCurrency(priceLowerDecimal.toString(), {
                  decimalPlaces: poolInfo.recommendDecimal(priceLowerDecimal)
                })}{' '}
                -{' '}
                {formatCurrency(priceUpperDecimal.toString(), {
                  decimalPlaces: poolInfo.recommendDecimal(priceUpperDecimal)
                })}
              </Text>
              <Badge ml="4" variant={inRange ? 'ok' : 'error'}>
                {inRange ? t('clmm.in_range') : t('clmm.out_of_range')}
              </Badge>
            </Flex>
            <Text variant="label">
              {t('common.per_unit', {
                subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
                subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
              })}
            </Text>
            <Flex gap="4" mt="2" justify={'space-between'}>
              <Box>
                <Text color={colors.textSecondary} fontSize="sm">
                  {t('liquidity.title')}
                </Text>
                <Text fontSize={['md', 'xl']} fontWeight="500">
                  {formatCurrency(positionTotalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Box>

              <Box>
                <Text color={colors.textSecondary} fontSize="sm">
                  {t('field.current_price')}
                </Text>
                <Text fontSize={['md', 'xl']} fontWeight="500">
                  {formatCurrency(currentPrice.toString(), { symbol: '$', maximumDecimalTrailingZeroes: 5 })}
                </Text>
              </Box>

              <Box>
                <Text color={colors.textSecondary} fontSize="sm">
                  {t('clmm.deposit_ratio')}
                </Text>
                <HStack fontSize={['md', 'xl']} fontWeight="500">
                  <Desktop>
                    <TokenAvatar token={poolInfo.mintA} size="sm" />
                    <Text>{formatToRawLocaleStr(toPercentString(ratioA, { decimalMode: 'trim' }))}</Text>
                    <Text>/</Text>
                    <TokenAvatar token={poolInfo.mintB} size="sm" />
                    <Text>{formatToRawLocaleStr(toPercentString(ratioB, { decimalMode: 'trim' }))}</Text>
                  </Desktop>
                  <Mobile>
                    <Box>
                      <HStack>
                        <TokenAvatar token={poolInfo.mintA} size="sm" />
                        <Text>{formatToRawLocaleStr(toPercentString(ratioA, { decimalMode: 'trim' }))}</Text>
                      </HStack>
                      <HStack>
                        <TokenAvatar token={poolInfo.mintB} size="sm" />
                        <Text>{formatToRawLocaleStr(toPercentString(ratioB, { decimalMode: 'trim' }))}</Text>
                      </HStack>
                    </Box>
                  </Mobile>
                </HStack>
              </Box>
            </Flex>
          </Box>

          <HStack mb="2" gap={2} justify="space-between" flexWrap={'wrap'}>
            <Text variant="title" fontSize="md">
              {t('liquidity.add_liquidity')}
            </Text>
            {/* TODO not need now */}
            {/* <HStack justifySelf={'end'} fontSize="sm" color={colors.textTertiary}>
              <HStack>
                <Text>{t('clmm.match_deposit_ratio')}</Text>
                <QuestionToolTip iconType="info" label={t('clmm.match_deposit_ratio_tooltip')} />
              </HStack>
              <Switch name="matchDepositRatio" defaultChecked={true} />
            </HStack> */}
          </HStack>
          <CLMMTokenInputGroup
            disableSelectToken
            pool={poolInfo}
            readonly={!poolInfo || featureDisabled}
            tokenAmount={tokenAmount}
            onFocusChange={handleFocusChange}
            onAmountChange={handleAmountChange}
            token1Disable={disabledInput[0]}
            token2Disable={disabledInput[1]}
          />
          <Box mt="4">
            <Box
              rounded={'xl'}
              border={`1px solid ${colors.backgroundTransparent10}`}
              bg={colors.backgroundTransparent07}
              px={[3, 4]}
              py="2"
              borderRadius="lg"
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text variant="title">{t('liquidity.total_deposit')}</Text>
              <Text variant="title" color={colors.textPrimary} fontSize={['lg', 'xl']}>
                {formatCurrency(totalDeposited, { symbol: '$', decimalPlaces: 2 })}
              </Text>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter mt="8" flexDirection="column" gap="2">
          <Button
            w="full"
            isLoading={sending}
            loadingText={t('liquidity.add_liquidity') + '...'}
            isDisabled={!!error || featureDisabled}
            onClick={() => {
              setIsSending(true)
              increaseLiquidityAct({
                poolInfo,
                position,
                liquidity: tickPriceRef.current.liquidity!,
                amountMaxA: new Decimal(tokenAmount[baseIn ? 0 : 1]!).mul(10 ** poolInfo.mintA.decimals).toFixed(0),
                amountMaxB: new Decimal(tokenAmount[baseIn ? 1 : 0]!).mul(10 ** poolInfo.mintB.decimals).toFixed(0),
                onFinally: () => {
                  setIsSending(false)
                  onClose()
                }
              })
            }}
          >
            {featureDisabled ? t('common.disabled') : error || t('button.confirm')}
          </Button>
          <Button w="full" variant="ghost" fontSize="sm" color={colors.textSecondary} onClick={onClose}>
            {t('button.cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
