import ConnectedButton from '@/components/ConnectedButton'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenInput, { DEFAULT_SOL_RESERVER } from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { useHover } from '@/hooks/useHover'
import { useAppStore, useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { Box, Button, Collapse, Flex, HStack, SimpleGrid, Text, useDisclosure, CircularProgress } from '@chakra-ui/react'
import { ApiV3Token, RAYMint, SOLMint, USDCMint, USDTMint, SOL_INFO, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import shallow from 'zustand/shallow'
import CircleInfo from '@/icons/misc/CircleInfo'
import { getSwapPairCache, setSwapPairCache } from '../util'
import { urlToMint, mintToUrl } from '@/utils/token'
import { SwapInfoBoard } from './SwapInfoBoard'
import SwapButtonTwoTurnIcon from '@/icons/misc/SwapButtonTwoTurnIcon'
import SwapButtonOneTurnIcon from '@/icons/misc/SwapButtonOneTurnIcon'
import useSwap from '../useSwap'
import { ApiSwapV1OutSuccess } from '../type'
import { useSwapStore } from '../useSwapStore'
import Decimal from 'decimal.js'
import HighRiskAlert from './HighRiskAlert'
import { isSolWSol } from '@/utils/token'
import { useRouteQuery, setUrlQuery } from '@/utils/routeTools'
import WarningIcon from '@/icons/misc/WarningIcon'
import dayjs from 'dayjs'
import { NATIVE_MINT } from '@solana/spl-token'
import { Trans } from 'react-i18next'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import useTokenInfo from '@/hooks/token/useTokenInfo'

export function SwapPanel({
  onInputMintChange,
  onOutputMintChange,
  onDirectionNeedReverse
}: {
  onInputMintChange?: (mint: string) => void
  onOutputMintChange?: (mint: string) => void
  onDirectionNeedReverse?(): void
}) {
  const query = useRouteQuery<{ inputMint: string; outputMint: string }>()
  const [urlInputMint, urlOutputMint] = [urlToMint(query.inputMint), urlToMint(query.outputMint)]
  const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [defaultInput, defaultOutput] = [urlInputMint || cacheInput, urlOutputMint || cacheOutput]

  const { t, i18n } = useTranslation()
  const { swap: swapDisabled } = useAppStore().featureDisabled
  const swapTokenAct = useSwapStore((s) => s.swapTokenAct)
  const unWrapSolAct = useSwapStore((s) => s.unWrapSolAct)
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [getTokenBalanceUiAmount, fetchTokenAccountAct, refreshTokenAccTime] = useTokenAccountStore(
    (s) => [s.getTokenBalanceUiAmount, s.fetchTokenAccountAct, s.refreshTokenAccTime],
    shallow
  )
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  const { isOpen: isUnWrapping, onOpen: onUnWrapping, onClose: offUnWrapping } = useDisclosure()
  const { isOpen: isHightRiskOpen, onOpen: onHightRiskOpen, onClose: offHightRiskOpen } = useDisclosure()
  const sendingResult = useRef<ApiSwapV1OutSuccess | undefined>()
  const wsolBalance = getTokenBalanceUiAmount({ mint: NATIVE_MINT.toBase58(), decimals: SOL_INFO.decimals })

  const [inputMint, setInputMint] = useState<string>(defaultInput || PublicKey.default.toBase58())
  const [swapType, setSwapType] = useState<'BaseIn' | 'BaseOut'>('BaseIn')

  const [outputMint, setOutputMint] = useState<string>(
    defaultOutput !== defaultInput ? defaultOutput : defaultInput !== RAYMint.toBase58() ? RAYMint.toBase58() : ''
  )
  const [tokenInput, tokenOutput] = [tokenMap.get(inputMint), tokenMap.get(outputMint)]

  const isTokenLoaded = tokenMap.size > 0
  const { tokenInfo: unknownTokenA } = useTokenInfo({
    mint: isTokenLoaded && !tokenInput && inputMint ? inputMint : undefined
  })
  const { tokenInfo: unknownTokenB } = useTokenInfo({
    mint: isTokenLoaded && !tokenOutput && outputMint ? outputMint : undefined
  })

  useEffect(() => {
    onInputMintChange?.(inputMint)
    onOutputMintChange?.(outputMint)
    setUrlQuery({ inputMint: mintToUrl(inputMint), outputMint: mintToUrl(outputMint) })
  }, [inputMint, outputMint])

  const [amountIn, setAmountIn] = useState<string>('')
  const [needPriceUpdatedAlert, setNeedPriceUpdatedAlert] = useState(false)

  const handleUnwrap = useEvent(() => {
    onUnWrapping()
    unWrapSolAct({
      amount: wsolBalance.rawAmount.toFixed(0),
      onSent: offUnWrapping,
      onClose: offUnWrapping,
      onError: offUnWrapping
    })
  })

  const isSwapBaseIn = swapType === 'BaseIn'
  const { response, data, isLoading, isValidating, error, openTime, mutate } = useSwap({
    inputMint,
    outputMint,
    amount: new Decimal(amountIn || 0)
      .mul(10 ** ((isSwapBaseIn ? tokenInput?.decimals : tokenOutput?.decimals) || 0))
      .toFixed(0, Decimal.ROUND_FLOOR),
    swapType,
    refreshInterval: isSending || isHightRiskOpen ? 3 * 60 * 1000 : 1000 * 30
  })

  const onPriceUpdatedConfirm = useEvent(() => {
    setNeedPriceUpdatedAlert(false)
    sendingResult.current = response as ApiSwapV1OutSuccess
  })

  const computeResult = needPriceUpdatedAlert ? sendingResult.current?.data : data
  const isComputing = isLoading || isValidating
  const isHighRiskTx = (computeResult?.priceImpactPct || 0) > 5

  const inputAmount =
    computeResult && tokenInput
      ? new Decimal(computeResult.inputAmount).div(10 ** tokenInput?.decimals).toFixed(tokenInput?.decimals)
      : computeResult?.inputAmount || ''
  const outputAmount =
    computeResult && tokenOutput
      ? new Decimal(computeResult.outputAmount).div(10 ** tokenOutput?.decimals).toFixed(tokenOutput?.decimals)
      : computeResult?.outputAmount || ''

  useEffect(() => {
    const [inputMint, outputMint] = [urlToMint(query.inputMint), urlToMint(query.outputMint)]
    if (inputMint && tokenMap.get(inputMint)) {
      setInputMint(inputMint)
      setSwapPairCache({
        inputMint
      })
    }
    if (outputMint && tokenMap.get(outputMint)) {
      setOutputMint(outputMint)
      setSwapPairCache({
        outputMint
      })
    }
  }, [tokenMap])

  useEffect(() => {
    if (isSending && response && response.data?.outputAmount !== sendingResult.current?.data.outputAmount) {
      setNeedPriceUpdatedAlert(true)
    }
  }, [response?.id, isSending])

  const handleInputChange = useCallback((val: string) => {
    setSwapType('BaseIn')
    setAmountIn(val)
  }, [])

  const handleInput2Change = useCallback((val: string) => {
    setSwapType('BaseOut')
    setAmountIn(val)
  }, [])

  const handleSelectToken = useCallback(
    (token: TokenInfo | ApiV3Token, side?: 'input' | 'output') => {
      const defaultMints = new Set<string>([SOLMint.toBase58(), USDCMint.toBase58(), USDTMint.toBase58()])
      if (side === 'input') {
        defaultMints.has(token.address) && !defaultMints.has(outputMint) && onDirectionNeedReverse?.()
        setInputMint(token.address)
        setOutputMint((mint) => (token.address === mint ? '' : mint))
      }
      if (side === 'output') {
        defaultMints.has(inputMint) && !defaultMints.has(token.address) && onDirectionNeedReverse?.()
        setOutputMint(token.address)
        setInputMint((mint) => {
          if (token.address === mint) {
            return ''
          }
          return mint
        })
      }
    },
    [inputMint, outputMint]
  )

  const handleChangeSide = useEvent(() => {
    setInputMint(outputMint)
    setOutputMint(inputMint)
    setSwapPairCache({
      inputMint: outputMint,
      outputMint: inputMint
    })
  })

  const balanceAmount = getTokenBalanceUiAmount({ mint: inputMint, decimals: tokenInput?.decimals }).amount
  const balanceNotEnough = balanceAmount.lt(inputAmount || 0) ? t('error.balance_not_enough') : undefined
  const isSolFeeNotEnough = inputAmount && isSolWSol(inputMint || '') && balanceAmount.sub(inputAmount || 0).lt(DEFAULT_SOL_RESERVER)
  const swapError = (error && i18n.exists(`swap.error_${error}`) ? t(`swap.error_${error}`) : error) || balanceNotEnough
  const isPoolNotOpenError = !!swapError && !!openTime

  const handleHighRiskConfirm = useEvent(() => {
    offHightRiskOpen()
    handleClickSwap()
  })

  const handleClickSwap = () => {
    if (!response) return
    sendingResult.current = response as ApiSwapV1OutSuccess
    onSending()
    swapTokenAct({
      swapResponse: response as ApiSwapV1OutSuccess,
      wrapSol: tokenInput?.address === PublicKey.default.toString(),
      unwrapSol: tokenOutput?.address === PublicKey.default.toString(),
      onCloseToast: offSending,
      onConfirmed: () => {
        setAmountIn('')
        setNeedPriceUpdatedAlert(false)
        offSending()
      },
      onError: () => {
        offSending()
        mutate()
      }
    })
  }

  const getCtrSx = (type: 'BaseIn' | 'BaseOut') => {
    if (!new Decimal(amountIn || 0).isZero() && swapType === type) {
      return {
        border: `1px solid ${colors.semanticFocus}`,
        boxShadow: `0px 0px 12px 6px ${colors.semanticFocusShadow}`
      }
    }
    return { border: '1px solid transparent' }
  }

  const handleRefresh = useEvent(() => {
    if (isSending || isHightRiskOpen) return
    mutate()
    if (Date.now() - refreshTokenAccTime < 10 * 1000) return
    fetchTokenAccountAct({})
  })

  const outputFilterFn = useEvent((token: TokenInfo) => {
    if (isSolWSol(tokenInput?.address) && isSolWSol(token.address)) return false
    return true
  })
  const inputFilterFn = useEvent((token: TokenInfo) => {
    if (isSolWSol(tokenOutput?.address) && isSolWSol(token.address)) return false
    return true
  })

  return (
    <>
      <Flex mb={[4, 5]} direction="column">
        {/* input */}
        <TokenInput
          name="swap"
          topLeftLabel={t('swap.from_label')}
          ctrSx={getCtrSx('BaseIn')}
          token={tokenInput}
          value={isSwapBaseIn ? amountIn : inputAmount}
          readonly={swapDisabled || (!isSwapBaseIn && isComputing)}
          disableClickBalance={swapDisabled}
          onChange={(v) => handleInputChange(v)}
          filterFn={inputFilterFn}
          onTokenChange={(token) => handleSelectToken(token, 'input')}
          defaultUnknownToken={unknownTokenA}
        />
        <SwapIcon onClick={handleChangeSide} />
        {/* output */}
        <TokenInput
          name="swap"
          topLeftLabel={t('swap.to_label')}
          ctrSx={getCtrSx('BaseOut')}
          token={tokenOutput}
          value={isSwapBaseIn ? outputAmount : amountIn}
          readonly={swapDisabled || (isSwapBaseIn && isComputing)}
          onChange={handleInput2Change}
          filterFn={outputFilterFn}
          onTokenChange={(token) => handleSelectToken(token, 'output')}
          defaultUnknownToken={unknownTokenB}
        />
      </Flex>
      {/* swap info */}
      <Box mb={[4, 5]}>
        <SwapInfoBoard
          amountIn={amountIn}
          tokenInput={tokenInput}
          tokenOutput={tokenOutput}
          isComputing={isComputing && !isSending}
          computedSwapResult={computeResult}
          onRefresh={handleRefresh}
        />
      </Box>
      <Collapse in={needPriceUpdatedAlert}>
        <Box pb={[4, 5]}>
          <SwapPriceUpdatedAlert onConfirm={onPriceUpdatedConfirm} />
        </Box>
      </Collapse>
      {isSolFeeNotEnough ? (
        <Flex
          rounded="xl"
          p="2"
          mt="-2"
          mb="3"
          fontSize="sm"
          bg={'rgba(255, 78, 163,0.1)'}
          color={colors.semanticError}
          alignItems="start"
          justifyContent="center"
        >
          <WarningIcon style={{ marginTop: '2px', marginRight: '4px' }} stroke={colors.semanticError} />
          <Text>{t('swap.error_sol_fee_not_insufficient', { amount: formatToRawLocaleStr(DEFAULT_SOL_RESERVER) })}</Text>
        </Flex>
      ) : null}
      {wsolBalance.isZero ? null : (
        <Flex
          rounded="md"
          mt="-2"
          mb="3"
          fontSize="xs"
          fontWeight={400}
          bg={colors.backgroundTransparent07}
          alignItems="center"
          px="4"
          py="2"
          gap="1"
          color={colors.textSecondary}
        >
          <CircleInfo />
          <Trans
            i18nKey={'swap.unwrap_wsol_info'}
            values={{
              amount: wsolBalance.text
            }}
            components={{
              sub: isUnWrapping ? <Progress /> : <Text cursor="pointer" color={colors.textLink} onClick={handleUnwrap} />
            }}
          />
        </Flex>
      )}
      <ConnectedButton
        isDisabled={new Decimal(amountIn || 0).isZero() || swapError || needPriceUpdatedAlert || swapDisabled}
        isLoading={isComputing || isSending}
        loadingText={isSending ? t('transaction.transaction_initiating') : isComputing ? t('swap.computing') : ''}
        onClick={isHighRiskTx ? onHightRiskOpen : handleClickSwap}
      >
        {swapDisabled ? t('common.disabled') : swapError || t('swap.title')}
        {isPoolNotOpenError ? ` ${dayjs(Number(openTime) * 1000).format('YYYY/M/D HH:mm:ss')}` : null}
      </ConnectedButton>
      <HighRiskAlert
        isOpen={isHightRiskOpen}
        onClose={offHightRiskOpen}
        onConfirm={handleHighRiskConfirm}
        percent={computeResult?.priceImpactPct ?? 0}
      />
    </>
  )
}

function SwapPriceUpdatedAlert({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation()
  return (
    <HStack bg={colors.backgroundDark} padding={'8px 16px'} rounded={'xl'} justify={'space-between'}>
      <HStack color={colors.textSecondary}>
        <Text fontSize={'sm'}>{t('swap.alert_price_updated')}</Text>
        <QuestionToolTip label={t('swap.alert_price_updated_tooltip')} />
      </HStack>
      <Button size={['sm', 'md']} onClick={onConfirm}>
        {t('swap.alert_price_updated_button')}
      </Button>
    </HStack>
  )
}

function SwapIcon(props: { onClick?: () => void }) {
  const targetElement = useRef<HTMLDivElement | null>(null)
  const isHover = useHover(targetElement)
  return (
    <SimpleGrid
      ref={targetElement}
      bg={isHover ? colors.semanticFocus : undefined}
      width="42px"
      height="42px"
      placeContent="center"
      rounded="full"
      cursor="pointer"
      my={-3}
      mx="auto"
      zIndex={2}
      onClick={props.onClick}
    >
      {isHover ? <SwapButtonTwoTurnIcon /> : <SwapButtonOneTurnIcon />}
    </SimpleGrid>
  )
}

function Progress() {
  return <CircularProgress isIndeterminate size="16px" />
}
