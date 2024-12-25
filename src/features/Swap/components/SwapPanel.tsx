import ConnectedButton from '@/components/ConnectedButton'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenInput, { DEFAULT_SOL_RESERVER, InputActionRef } from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { useHover } from '@/hooks/useHover'
import { useAppStore, useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
  CircularProgress,
  Tooltip as ChakraTip
} from '@chakra-ui/react'
import { ApiV3Token, RAYMint, SOL_INFO, TokenInfo, TransferFeeDataBaseType } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import shallow from 'zustand/shallow'
import CircleInfo from '@/icons/misc/CircleInfo'
import { getSwapPairCache, setSwapPairCache } from '../util'
import { urlToMint, mintToUrl, isSolWSol, getMintPriority, getMintSymbol } from '@/utils/token'
import { SwapInfoBoard } from './SwapInfoBoard'
import SwapButtonTwoTurnIcon from '@/icons/misc/SwapButtonTwoTurnIcon'
import SwapButtonOneTurnIcon from '@/icons/misc/SwapButtonOneTurnIcon'
import useSwap from '../useSwap'
import { ApiSwapV1OutSuccess } from '../type'
import { useSwapStore } from '../useSwapStore'
import Decimal from 'decimal.js'
import HighRiskAlert from './HighRiskAlert'
import { useRouteQuery, setUrlQuery } from '@/utils/routeTools'
import WarningIcon from '@/icons/misc/WarningIcon'
import dayjs from 'dayjs'
import { NATIVE_MINT } from '@solana/spl-token'
import { Trans } from 'react-i18next'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import ToPublicKey, { isValidPublicKey } from '@/utils/publicKey'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import { debounce } from '@/utils/functionMethods'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import Tooltip from '@/components/Tooltip'

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

  const [inputMint, setInputMint] = useState<string>(PublicKey.default.toBase58())
  const [swapType, setSwapType] = useState<'BaseIn' | 'BaseOut'>('BaseIn')

  const [outputMint, setOutputMint] = useState<string>(RAYMint.toBase58())
  const [tokenInput, tokenOutput] = [tokenMap.get(inputMint), tokenMap.get(outputMint)]
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const isTokenLoaded = tokenMap.size > 0
  const { tokenInfo: unknownTokenA } = useTokenInfo({
    mint: isTokenLoaded && !tokenInput && inputMint ? inputMint : undefined
  })
  const tokenAActionRef = useRef<InputActionRef>({ refreshPrice: () => {} })
  const { tokenInfo: unknownTokenB } = useTokenInfo({
    mint: isTokenLoaded && !tokenOutput && outputMint ? outputMint : undefined
  })
  const tokenBActionRef = useRef<InputActionRef>({ refreshPrice: () => {} })

  const { tokenInfo: inputInfo } = useTokenInfo(
    tokenInput?.type === 'jupiter'
      ? {
          mint: tokenInput.address,
          programId: ToPublicKey(tokenInput.programId),
          skipTokenMap: true
        }
      : {}
  )

  const { tokenInfo: outputInfo } = useTokenInfo(
    tokenOutput?.type === 'jupiter'
      ? {
          mint: tokenOutput.address,
          programId: ToPublicKey(tokenOutput.programId),
          skipTokenMap: true
        }
      : {}
  )
  const [inputFeeConfig, outputFeeConfig] = [
    tokenInput?.extensions.feeConfig || inputInfo?.extensions.feeConfig,
    tokenOutput?.extensions.feeConfig || outputInfo?.extensions.feeConfig
  ]

  useEffect(() => {
    if (defaultInput) setInputMint(defaultInput)
    if (defaultOutput && defaultOutput !== defaultInput) setOutputMint(defaultOutput)
    setCacheLoaded(true)
  }, [defaultInput, defaultOutput])

  useEffect(() => {
    if (!cacheLoaded) return
    onInputMintChange?.(inputMint)
    onOutputMintChange?.(outputMint)
    const validInputMint = isValidPublicKey(inputMint) ? inputMint : '',
      validOutputMint = isValidPublicKey(outputMint) ? outputMint : ''
    setUrlQuery({ inputMint: mintToUrl(validInputMint), outputMint: mintToUrl(validOutputMint) })
  }, [inputMint, outputMint, cacheLoaded])

  const [amountIn, setAmountIn] = useState<string>('')
  const [needPriceUpdatedAlert, setNeedPriceUpdatedAlert] = useState(false)
  const [hasValidAmountOut, setHasValidAmountOut] = useState(false)

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
    if (!cacheLoaded) return
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
  }, [tokenMap, cacheLoaded])

  useEffect(() => {
    if (isSending && response && response.data?.outputAmount !== sendingResult.current?.data.outputAmount) {
      setNeedPriceUpdatedAlert(true)
    }
  }, [response?.id, isSending])

  const debounceUpdate = useCallback(
    debounce(({ outputAmount, isComputing }) => {
      setHasValidAmountOut(Number(outputAmount) !== 0 || isComputing)
    }, 150),
    []
  )

  useEffect(() => {
    debounceUpdate({ outputAmount, isComputing })
  }, [outputAmount, isComputing])

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
      if (side === 'input') {
        if (getMintPriority(token.address) > getMintPriority(outputMint)) {
          onDirectionNeedReverse?.()
        }
        setInputMint(token.address)
        setOutputMint((mint) => (token.address === mint ? '' : mint))
      }
      if (side === 'output') {
        if (getMintPriority(inputMint) > getMintPriority(token.address)) {
          onDirectionNeedReverse?.()
        }
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
        // setAmountIn('')
        // setNeedPriceUpdatedAlert(false)
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
    tokenAActionRef.current?.refreshPrice()
    tokenBActionRef.current?.refreshPrice()
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
          actionRef={tokenAActionRef}
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
          actionRef={tokenBActionRef}
        />
      </Flex>
      {/* swap info */}
      <Collapse in={hasValidAmountOut} animateOpacity>
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
      </Collapse>

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
      {inputFeeConfig || outputFeeConfig ? (
        <Flex mt="-1" mb="4">
          {inputFeeConfig && tokenInput ? (
            <Tooltip
              contentBoxProps={{ sx: { width: 'fit-content' } }}
              label={<TransferFeeTip feeConfig={inputFeeConfig} token={tokenInput!} />}
            >
              <Box
                fontSize="xs"
                bg={colors.backgroundTransparent10}
                borderColor={colors.primary}
                color={colors.primary}
                borderWidth="1px"
                px="1"
                borderRadius="4px"
              >
                {getMintSymbol({ mint: tokenInput })} ({inputFeeConfig.newerTransferFee.transferFeeBasisPoints / 100}% {t('common.tax')})
              </Box>
            </Tooltip>
          ) : null}

          {outputFeeConfig && tokenOutput ? (
            <Tooltip
              contentBoxProps={{ sx: { width: 'fit-content' } }}
              label={<TransferFeeTip feeConfig={outputFeeConfig} token={tokenOutput!} />}
            >
              <Box
                fontSize="xs"
                bg={colors.backgroundTransparent10}
                borderColor={colors.primary}
                color={colors.primary}
                borderWidth="1px"
                px="1"
                borderRadius="4px"
              >
                {getMintSymbol({ mint: tokenOutput })} ({outputFeeConfig.newerTransferFee.transferFeeBasisPoints / 100}% {t('common.tax')})
              </Box>
            </Tooltip>
          ) : null}
        </Flex>
      ) : null}
      <ConnectedButton
        isDisabled={new Decimal(amountIn || 0).isZero() || !!swapError || needPriceUpdatedAlert || swapDisabled}
        isLoading={isComputing || isSending}
        loadingText={<div>{isSending ? t('transaction.transaction_initiating') : isComputing ? t('swap.computing') : ''}</div>}
        onClick={isHighRiskTx ? onHightRiskOpen : handleClickSwap}
      >
        <Text>
          {swapDisabled ? t('common.disabled') : swapError || t('swap.title')}
          {isPoolNotOpenError ? ` ${dayjs(Number(openTime) * 1000).format('YYYY/M/D HH:mm:ss')}` : null}
        </Text>
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

function TransferFeeTip({ feeConfig, token }: { feeConfig: TransferFeeDataBaseType; token: TokenInfo }) {
  const { t } = useTranslation()
  return (
    <>
      <Text color={colors.text02} fontWeight="500" mb="1">
        {t('common.token_2022_assets')}
      </Text>
      <Text color={colors.primary}>{t('common.token_2022_assets_desc')}</Text>
      <Text color={colors.semanticWarning} fontWeight="500">
        {t('common.trade_with_caution')}
      </Text>
      <Box
        mt="2"
        position="relative"
        bg={colors.backgroundTransparent07}
        borderWidth="1px"
        borderStyle="solid"
        borderColor={colors.backgroundTransparent12}
        rounded="md"
        px={4}
        pt={1.5}
        pb={2}
      >
        <Flex flexDir={['column', 'row']} justifyContent="space-between" gap={[0, 2]}>
          <Flex alignItems="center" gap="0.5">
            <Text whiteSpace="nowrap" wordBreak={'keep-all'}>
              {t('common.transfer_fee')}
            </Text>
            <ChakraTip label="A transfer fee derived from the amount of the token being transferred.">
              <QuestionCircleIcon />
            </ChakraTip>
          </Flex>
          <Text color={colors.text02}>{feeConfig.newerTransferFee.transferFeeBasisPoints / 100}%</Text>
        </Flex>
        <Flex flexDir={['column', 'row']} justifyContent="space-between" gap={[0, 2]}>
          <Flex alignItems="center" gap="0.5">
            <Text whiteSpace="nowrap" wordBreak={'keep-all'}>
              {t('common.max_transfer_fee')}
            </Text>
            <ChakraTip label="Maximum amount for the transfer fee, set by the authority mint.">
              <QuestionCircleIcon />
            </ChakraTip>
          </Flex>
          <Text color={colors.text02}>
            {formatCurrency(
              new Decimal(feeConfig.newerTransferFee.maximumFee)
                .div(10 ** token.decimals)
                .toDecimalPlaces(token.decimals)
                .toString(),
              { decimalPlaces: token.decimals }
            )}
            &nbsp;
            {token.symbol}
          </Text>
        </Flex>
      </Box>
    </>
  )
}
