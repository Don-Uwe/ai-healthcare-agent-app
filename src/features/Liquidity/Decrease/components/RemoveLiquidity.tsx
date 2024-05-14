import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import AmountSlider from '@/components/AmountSlider'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { useAppStore, useTokenAccountStore } from '@/store'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { formatCurrency } from '@/utils/numberish/formatter'
import { useLiquidityStore } from '@/store/useLiquidityStore'

import { colors } from '@/theme/cssVariables'
import Decimal from 'decimal.js'
import { RpcAmmPool } from '@/hooks/pool/amm/useFetchRpcPoolData'
import { useEvent } from '@/hooks/useEvent'

export default function UnStakeLiquidity({
  poolInfo,
  rpcPoolData,
  onRefresh
}: {
  poolInfo?: FormattedPoolInfoStandardItem
  rpcPoolData?: RpcAmmPool
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.removeStandardPosition)
  const removeLiquidityAct = useLiquidityStore((s) => s.removeLiquidityAct)
  const removeCpmmLiquidityAct = useLiquidityStore((s) => s.removeCpmmLiquidityAct)
  const [removePercent, setRemovePercent] = useState(0)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const liquidity = getTokenBalanceUiAmount({ mint: poolInfo?.lpMint.address || '', decimals: poolInfo?.lpMint.decimals }).amount
  const [isTxSending, setIsTxSending] = useState(false)
  const circleRef = useRef<IntervalCircleHandler>(null)
  const amountA = rpcPoolData
    ? new Decimal(rpcPoolData.baseReserve.toString()).div(10 ** rpcPoolData.baseDecimals)
    : new Decimal(poolInfo?.mintAmountA || 0)
  const amountB = rpcPoolData
    ? new Decimal(rpcPoolData.quoteReserve.toString()).div(10 ** rpcPoolData.quoteDecimals)
    : new Decimal(poolInfo?.mintAmountB || 0)
  const lpAmount = rpcPoolData
    ? new Decimal(rpcPoolData.lpSupply.toString()).div(10 ** rpcPoolData.lpDecimals)
    : new Decimal(poolInfo?.lpAmount || 1)

  const baseRatio = amountA.div(lpAmount)
  const quoteRatio = amountB.div(lpAmount)

  const removeAmount = new Decimal(liquidity).mul(removePercent).div(100)
  const handleRemove = () => {
    if (!poolInfo) return
    setIsTxSending(true)

    const callBacks = {
      onSent: () => {
        setRemovePercent(0)
      },
      onFinally: () => setIsTxSending(false)
    }

    const isCpmm = useAppStore.getState().programIdConfig.CREATE_CPMM_POOL_PROGRAM.toBase58() === poolInfo.programId
    if (isCpmm) {
      removeCpmmLiquidityAct({
        poolInfo,
        lpAmount: removeAmount.mul(10 ** poolInfo.lpMint.decimals).toFixed(0),
        ...callBacks
      })
      return
    }
    removeLiquidityAct({
      poolInfo,
      amount: removeAmount.mul(10 ** poolInfo.lpMint.decimals).toFixed(0),
      ...callBacks
    })
  }

  const handleEnd = useEvent(() => {
    circleRef.current?.restart()
    onRefresh()
  })

  return (
    <Flex borderRadius="24px" direction="column" w="full" px="24px" py="32px" bg={colors.backgroundLight}>
      <Flex justifyContent="flex-end" mb="3">
        <IntervalCircle
          componentRef={circleRef}
          svgWidth={18}
          strokeWidth={2}
          trackStrokeColor={colors.secondary}
          trackStrokeOpacity={0.5}
          filledTrackStrokeColor={colors.secondary}
          onClick={handleEnd}
          onEnd={onRefresh}
        />
      </Flex>
      <Flex justifyContent="space-between" align="center" py="6" px="4" bg={colors.backgroundDark} borderRadius="12px">
        <Flex gap="2" alignItems="center">
          <TokenAvatarPair token1={poolInfo?.mintA} token2={poolInfo?.mintB} />
          <Text variant="title" fontSize="xl" color={colors.textSecondary}>
            {poolInfo?.poolName.replace(' - ', '/')}
          </Text>
        </Flex>
        <Box textAlign="right">
          <Text fontSize="28px">
            {formatCurrency(removeAmount.mul(poolInfo?.lpPrice || '0').toString(), { symbol: '$', decimalPlaces: 2 })}
          </Text>
          <Text variant="label">{formatCurrency(removeAmount.toString(), { decimalPlaces: poolInfo?.lpMint.decimals })} LP</Text>
        </Box>
      </Flex>
      <AmountSlider isDisabled={featureDisabled || liquidity.isZero()} percent={removePercent} onChange={setRemovePercent} mt={4} />
      <Box bg={colors.backgroundDark} borderRadius="12px" py={3} px={6}>
        <Text fontSize="md" fontWeight="medium" mb="2" color={colors.textSecondary}>
          {t('liquidity.assets_to_received')}:
        </Text>
        <Flex alignItems="center" gap="1" fontSize="sm">
          <TokenAvatarPair mr="1" token1={poolInfo?.mintA} token2={poolInfo?.mintB} />
          {formatCurrency(removeAmount.mul(baseRatio).toString(), { decimalPlaces: poolInfo?.mintA.decimals })}{' '}
          <Text fontSize="sm" variant="label">
            {poolInfo?.mintA.symbol}
          </Text>
          <Box>/</Box>
          {formatCurrency(removeAmount.mul(quoteRatio).toString(), { decimalPlaces: poolInfo?.mintB.decimals })}{' '}
          <Text fontSize="sm" variant="label">
            {poolInfo?.mintB.symbol}
          </Text>
        </Flex>
        <SimpleGrid columns={2} rowGap="6px" columnGap="44px"></SimpleGrid>
      </Box>
      <Button mt={10} isLoading={isTxSending} isDisabled={featureDisabled || !poolInfo || removeAmount.isZero()} onClick={handleRemove}>
        {featureDisabled ? t('common.disabled') : t('liquidity.remove_liquidity')}
      </Button>
    </Flex>
  )
}
