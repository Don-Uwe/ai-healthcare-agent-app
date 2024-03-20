import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'

import { useTranslation } from 'react-i18next'
import TokenAvatar from '@/components/TokenAvatar'
import CLMMTokenInputGroup, { InputSide } from '@/features/Clmm/components/TokenInputGroup'
import { useClmmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'
import toPercentString from '@/utils/numberish/toPercentString'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { getMintSymbol, wSolToSol, wsolToSolToken } from '@/utils/token'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { calRatio } from '@/features/Clmm/utils/math'
import BN from 'bn.js'
import Decimal from 'decimal.js'

import { TickData } from './type'
interface Props extends Required<TickData> {
  baseIn: boolean
  tempCreatedPool: ApiV3PoolInfoConcentratedItem
  onConfirm: (props: { inputA: boolean; amount1: string; amount2: string; liquidity: BN }) => void
}

export default function TokenAmountPairInputs({ tempCreatedPool, baseIn, onConfirm, ...tickData }: Props) {
  const computePairAmount = useClmmStore((s) => s.computePairAmount)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { t } = useTranslation()
  const [tokenAmount, setTokenAmount] = useState(['', ''])
  const focusPoolARef = useRef(true)
  const computeRef = useRef(false)
  const computeDataRef = useRef<Awaited<ReturnType<typeof computePairAmount>> | undefined>(undefined)

  const [mintA, mintB] = [tempCreatedPool![baseIn ? 'mintA' : 'mintB'], tempCreatedPool![baseIn ? 'mintB' : 'mintA']]
  const { data: tokenPrices } = useTokenPrice({
    mintList: [mintA.address, mintB.address]
  })

  const [priceLower, priceUpper] = baseIn
    ? [tickData.priceLower, tickData.priceUpper]
    : [new Decimal(1).div(tickData.priceUpper).toString(), new Decimal(1).div(tickData.priceLower).toString()]

  const disabledInput = tempCreatedPool
    ? [new Decimal(tempCreatedPool.price || 0).gt(priceUpper || 0), new Decimal(tempCreatedPool.price || 0).lt(priceLower || 0)]
    : [false, false]
  if (!baseIn) disabledInput.reverse()

  const debounceCompute = useCallback(
    debounce((props: Parameters<typeof computePairAmount>[0]) => {
      computePairAmount(props).then((res) => {
        computeRef.current = !!res
        computeDataRef.current = res
        if (res) {
          setTokenAmount((preValue) => {
            if (baseIn)
              return focusPoolARef.current
                ? [preValue[0], props.amount ? res.amountSlippageB.toString() : '']
                : [props.amount ? res.amountSlippageA.toString() : '', preValue[1]]
            return focusPoolARef.current
              ? [props.amount ? res.amountSlippageB.toString() : '', preValue[1]]
              : [preValue[0], props.amount ? res.amountSlippageA.toString() : '']
          })
        }
      })
    }, 100),
    [baseIn]
  )

  useEffect(() => {
    if (!tempCreatedPool.id) return
    if (computeRef.current) {
      computeRef.current = false
      return
    }
    const amount = (focusPoolARef.current && baseIn) || (!focusPoolARef.current && !baseIn) ? tokenAmount[0] : tokenAmount[1]

    debounceCompute({
      ...tickData,
      pool: tempCreatedPool,
      inputA: focusPoolARef.current,
      amount
    })
  }, [tempCreatedPool, baseIn, tokenAmount, debounceCompute, tickData])

  const handleAmountChange = useCallback(
    (val: string, side: string) => setTokenAmount((prevVal) => (side === InputSide.TokenA ? [val, prevVal[1]] : [prevVal[0], val])),
    []
  )
  const handleFocusChange = useCallback(
    (mint?: string) => (focusPoolARef.current = wSolToSol(mint) === wSolToSol(tempCreatedPool.mintA.address)),
    [tempCreatedPool.mintA.address]
  )

  const [balanceA, balanceB] = [
    getTokenBalanceUiAmount({ mint: wSolToSol(mintA.address)!, decimals: mintA.decimals }).text,
    getTokenBalanceUiAmount({ mint: wSolToSol(mintB.address)!, decimals: mintB.decimals }).text
  ]

  let error = undefined
  function checkError() {
    if (!disabledInput[0]) {
      if (!tokenAmount[0] || new Decimal(tokenAmount[0] || 0).isZero()) return { key: 'error.enter_token_amount' }
      if (new Decimal(tokenAmount[0]).gt(balanceA))
        return { key: 'error.insufficient_sub_balance', props: { token: getMintSymbol({ mint: mintA, transformSol: true }) } }
    }
    if (!disabledInput[1] || new Decimal(tokenAmount[1] || 0).isZero()) {
      if (!tokenAmount[1]) return { key: 'error.enter_token_amount' }
      if (new Decimal(tokenAmount[1]).gt(balanceB))
        return { key: 'error.insufficient_sub_balance', props: { token: getMintSymbol({ mint: mintB, transformSol: true }) } }
    }
    return undefined
  }
  error = checkError()

  const [mintAVolume, mintBVolume] = [
    new Decimal(tokenAmount[0] || 0).mul(tokenPrices[mintA.address]?.value || 0),
    new Decimal(tokenAmount[1] || 0).mul(tokenPrices[mintB.address]?.value || 0)
  ]
  const totalVolume = mintAVolume.add(mintBVolume)
  const { ratioA, ratioB } = calRatio({
    price: baseIn ? tempCreatedPool.price : 1 / tempCreatedPool.price,
    amountA: tokenAmount[0],
    amountB: tokenAmount[1]
  })
  return (
    <>
      <CLMMTokenInputGroup
        pool={tempCreatedPool}
        baseIn={baseIn}
        tokenAmount={tokenAmount}
        disableSelectToken
        onAmountChange={handleAmountChange}
        onFocusChange={handleFocusChange}
        token1Disable={disabledInput[0]}
        token2Disable={disabledInput[1]}
      />
      <VStack
        mt={4}
        align="stretch"
        bg={colors.backgroundTransparent07}
        rounded={'xl'}
        border={`1px solid ${colors.backgroundTransparent10}`}
        color={colors.textPrimary}
        p={3}
        gap={1}
      >
        <HStack justify={'space-between'}>
          <Text color={colors.textSecondary} fontSize="sm">
            {t('clmm.total_deposit')}
          </Text>
          <Text fontSize={['md', 'xl']} fontWeight="500">
            {toUsdVolume(totalVolume.toString())}
          </Text>
        </HStack>

        <HStack justify={'space-between'}>
          <Text color={colors.textSecondary} fontSize="sm">
            {t('clmm.deposit_ratio')}
          </Text>
          <HStack fontWeight="500">
            <TokenAvatar token={wsolToSolToken(tempCreatedPool![baseIn ? 'mintA' : 'mintB'])} size="sm" />
            <Text>{toPercentString(ratioA, { decimals: 1 })}</Text>
            <Text>/</Text>
            <TokenAvatar token={wsolToSolToken(tempCreatedPool![baseIn ? 'mintB' : 'mintA'])} size="sm" />
            <Text>{toPercentString(ratioB, { decimals: 1 })}</Text>
          </HStack>
        </HStack>
      </VStack>
      <Button
        mt="4"
        isDisabled={!!error}
        onClick={() => {
          onConfirm({
            inputA: focusPoolARef.current,
            amount1: tokenAmount[baseIn ? 0 : 1],
            amount2: tokenAmount[baseIn ? 1 : 0],
            liquidity: computeDataRef.current!.liquidity
          })
        }}
      >
        {error ? t(error.key, error.props || {}) : t('liquidity.preview_pool')}
      </Button>
    </>
  )
}
