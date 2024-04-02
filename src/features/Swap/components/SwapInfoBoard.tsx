import AddressChip from '@/components/AddressChip'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatar from '@/components/TokenAvatar'
import Tooltip from '@/components/Tooltip'
import CircleCheckBreaker from '@/icons/misc/CircleCheckBreaker'
import HorizontalSwitchIcon from '@/icons/misc/HorizontalSwitchIcon'
import WarningIcon from '@/icons/misc/WarningIcon'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { Box, Collapse, Flex, HStack, Text, Skeleton } from '@chakra-ui/react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { Fragment, useState, useRef, RefObject, useEffect } from 'react'
import { ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { ApiSwapV1OutSuccess } from '../type'
import Decimal from 'decimal.js'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import { getMintSymbol } from '@/utils/token'
import { useEvent } from '@/hooks/useEvent'
import { trimTrailZero } from '@/utils/numberish/formatter'

export function SwapInfoBoard({
  amountIn,
  tokenInput,
  tokenOutput,
  isComputing,
  computedSwapResult,
  onRefresh
}: {
  amountIn: string
  tokenInput?: TokenInfo
  tokenOutput?: TokenInfo
  isComputing: boolean
  computedSwapResult?: ApiSwapV1OutSuccess['data']
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const [showMoreSwapInfo, setShowMoreSwapInfo] = useState(false)
  const refreshCircleRef = useRef<IntervalCircleHandler>(null)
  const routeTokens = tokenInput && tokenOutput ? [tokenInput, tokenOutput] : undefined
  const isBaseOut = computedSwapResult?.swapType === 'BaseOut'
  const priceImpact = computedSwapResult?.priceImpactPct || 0
  const isHighRiskPrice = priceImpact > 5

  useEffect(() => {
    refreshCircleRef.current?.restart()
  }, [tokenInput?.address, tokenOutput?.address, amountIn])

  return (
    <Box
      position="relative"
      boxShadow={isHighRiskPrice ? `0px 0px 12px 6px rgba(255, 78, 163, 0.15)` : 'none'}
      bg={isHighRiskPrice ? 'rgba(255, 78, 163,0.1)' : colors.backgroundTransparent07}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={isHighRiskPrice ? colors.semanticError : colors.backgroundTransparent12}
      rounded="md"
      px={4}
      pt={1.5}
      pb={2}
    >
      {/* Top utils */}
      <HStack gap={4} py={2} justifyContent="space-between">
        <PriceDetector
          computedSwapResult={computedSwapResult}
          isComputing={isComputing}
          tokenInput={tokenInput}
          tokenOutput={tokenOutput}
        />
        <OtherMiscUtils refreshCircleRef={refreshCircleRef} onClick={onRefresh} onEnd={onRefresh} />
      </HStack>

      <HStack gap={4} py={1} justifyContent="space-between">
        <ItemLabel
          name={isBaseOut ? t('swap.info_maximum_input') : t('swap.info_minimum_received')}
          tooltip={isBaseOut ? t('swap.info_maximum_input_tooltip') : t('swap.info_minimum_received_tooltip')}
        />
        <MinimumReceiveValue tokenOutput={isBaseOut ? tokenInput : tokenOutput} amount={computedSwapResult?.otherAmountThreshold || ''} />
      </HStack>

      <HStack gap={4} py={1} justifyContent="space-between">
        <ItemLabel name={t('swap.info_price_impact')} tooltip={t('swap.info_price_impact_tooltip')} />
        <Text
          fontSize="xs"
          color={isHighRiskPrice ? colors.semanticError : priceImpact > 1 ? colors.semanticWarning : colors.textSecondary}
          fontWeight={500}
        >
          {computedSwapResult ? `${toPercentString(computedSwapResult.priceImpactPct, { notShowZero: true })}` : '-'}
        </Text>
      </HStack>

      <Collapse in={showMoreSwapInfo} animateOpacity>
        <HStack gap={4} py={1} justifyContent="space-between">
          <ItemLabel name={t('swap.info_order_routing')} tooltip={t('swap.info_order_routing_tooltip')} />
          {routeTokens && <RoutingValue routePlan={computedSwapResult?.routePlan || []} />}
        </HStack>

        <HStack gap={4} py={1} justifyContent="space-between">
          <ItemLabel name={t('swap.info_estimated_fees')} tooltip={t('swap.info_estimated_fees_tooltip')} />
          <Text align="end" fontSize="xs" color={colors.textPrimary}>
            {computedSwapResult?.routePlan.map((route) => (
              <FeeItem key={route.poolId} route={route} />
            ))}
          </Text>
        </HStack>
      </Collapse>

      <HStack
        color={colors.textSecondary}
        fontSize="xs"
        fontWeight={500}
        spacing={0.5}
        justify="center"
        onClick={() => setShowMoreSwapInfo((b) => !b)}
      >
        <Text align="center" cursor="pointer">
          {showMoreSwapInfo ? t('common.less_info') : t('common.more_info')}
        </Text>
        {/* arrow */}
        <Box transform={`rotate(${showMoreSwapInfo ? `${180}deg` : 0})`} transition="300ms">
          <ChevronDown size={12} />
        </Box>
      </HStack>
    </Box>
  )
}

function PriceDetector({
  isComputing,
  tokenInput,
  tokenOutput,
  computedSwapResult
}: {
  isComputing: boolean
  tokenInput?: TokenInfo
  tokenOutput?: TokenInfo
  computedSwapResult?: ApiSwapV1OutSuccess['data']
}) {
  const [reverse, setReverse] = useState(false)
  const { t } = useTranslation()

  const priceImpact = computedSwapResult
    ? computedSwapResult.priceImpactPct > 5
      ? 'high'
      : computedSwapResult.priceImpactPct > 1
      ? 'warning'
      : 'low'
    : undefined

  let price = computedSwapResult
    ? trimTrailZero(
        new Decimal(computedSwapResult.outputAmount)
          .div(10 ** (tokenOutput?.decimals || 0))
          .div(new Decimal(computedSwapResult.inputAmount).div(10 ** (tokenInput?.decimals || 0)))
          .toFixed(tokenOutput?.decimals || 0, Decimal.ROUND_FLOOR)
      )!
    : ''
  if (reverse)
    price =
      price === ''
        ? price
        : new Decimal(1)
            .div(price)
            .toDecimalPlaces(tokenInput?.decimals || 0, Decimal.ROUND_FLOOR)
            .toString()

  return (
    <HStack>
      <Text as="div" color={colors.textPrimary} fontWeight={500}>
        <Flex gap="1" alignItems="center" flexWrap="wrap" maxW="80%">
          <Text as="div">1</Text>
          <Text as="div">{reverse ? tokenOutput?.symbol : tokenInput?.symbol}</Text>≈
          {!isComputing ? (
            <Text as="div">{price}</Text>
          ) : (
            <Skeleton width={`${12 * ((reverse ? tokenInput?.decimals : tokenOutput?.decimals) || 1)}px`} height="24px" />
          )}
          {reverse ? tokenInput?.symbol : tokenOutput?.symbol}
        </Flex>
      </Text>
      <Tooltip label={t(`swap.price_impact_${priceImpact}_tooltip`)}>
        {priceImpact === 'low' ? (
          <CircleCheckBreaker />
        ) : priceImpact === 'warning' ? (
          <WarningIcon />
        ) : priceImpact === 'high' ? (
          <WarningIcon stroke={colors.semanticError} />
        ) : null}
      </Tooltip>
      <Box onClick={() => setReverse((b) => !b)} color={colors.textSecondary} cursor="pointer">
        <HorizontalSwitchIcon />
      </Box>
    </HStack>
  )
}

function ItemLabel({ name, tooltip }: { name: string; tooltip?: string | null }) {
  return (
    <HStack fontSize="xs" color={colors.textSecondary}>
      <Text>{name}</Text>
      {tooltip && <QuestionToolTip label={tooltip} iconProps={{ color: colors.textTertiary }} />}
    </HStack>
  )
}

function OtherMiscUtils({
  refreshCircleRef,
  onClick,
  onEnd
}: {
  refreshCircleRef: RefObject<IntervalCircleHandler>
  onClick?(): void
  onEnd?(): void
}) {
  const handleClick = useEvent(() => {
    refreshCircleRef.current?.restart()
    onClick?.()
  })

  return (
    <Flex>
      {/* <Popover placement="top-end">
        <PopoverTrigger>
          <Text cursor="pointer">🔗</Text>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>Address</PopoverHeader>
          <PopoverBody>
            <AddressPopoverContentBody relativeTokens={relativeTokens} />
          </PopoverBody>
        </PopoverContent>
      </Popover> */}
      <IntervalCircle
        componentRef={refreshCircleRef}
        duration={60 * 1000}
        svgWidth={18}
        strokeWidth={2}
        trackStrokeColor={colors.secondary}
        trackStrokeOpacity={0.5}
        filledTrackStrokeColor={colors.secondary}
        onClick={handleClick}
        onEnd={onEnd}
      />
    </Flex>
  )
}

function MinimumReceiveValue({ tokenOutput, amount }: { tokenOutput?: TokenInfo; amount: string }) {
  return (
    <HStack fontSize="xs" fontWeight={500}>
      <Text color={colors.textPrimary}>
        {amount && tokenOutput
          ? trimTrailZero(new Decimal(amount).div(10 ** tokenOutput.decimals).toFixed(tokenOutput.decimals, Decimal.ROUND_FLOOR))!
          : amount}
      </Text>
      <Text color={colors.textSecondary}>{tokenOutput?.symbol}</Text>
    </HStack>
  )
}

function RoutingValue({ routePlan }: { routePlan: ApiSwapV1OutSuccess['data']['routePlan'] }) {
  return (
    <HStack spacing={0.5} minH="32px">
      {routePlan.map(({ inputMint, outputMint, feeRate, poolId }, idx) => (
        <Fragment key={inputMint}>
          <Tooltip label={<AddressChip address={inputMint} textProps={{ fontSize: 'xs' }} canExternalLink />}>
            <TokenAvatar tokenMint={inputMint} size="sm" />
          </Tooltip>
          <Tooltip label={<AddressChip address={poolId} renderLabel={'AMM ID:'} textProps={{ fontSize: 'xs' }} canExternalLink />}>
            <Text fontSize={'2xs'} color={colors.textSecondary}>
              {toPercentString(feeRate / 100)}
            </Text>
          </Tooltip>

          {idx !== routePlan.length - 1 && <Text color={colors.textTertiary}>▸</Text>}
          {idx === routePlan.length - 1 && (
            <>
              <Text color={colors.textTertiary}>▸</Text>
              <Tooltip label={<AddressChip address={outputMint} textProps={{ fontSize: 'xs' }} canExternalLink />}>
                <TokenAvatar tokenMint={outputMint} size="sm" />
              </Tooltip>
            </>
          )}
        </Fragment>
      ))}
    </HStack>
  )
}

function FeeItem({ route }: { route: ApiSwapV1OutSuccess['data']['routePlan']['0'] }) {
  const { tokenInfo } = useTokenInfo({ mint: route.feeMint })
  if (!tokenInfo) return null
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="1">
      {new Decimal(route.feeAmount)
        .div(10 ** tokenInfo.decimals)
        .toDecimalPlaces(tokenInfo.decimals, Decimal.ROUND_FLOOR)
        .toString()}
      <Text>{getMintSymbol({ mint: tokenInfo, transformSol: true })}</Text>
    </Flex>
  )
}
