import { Flex, HStack, Text, useDisclosure } from '@chakra-ui/react'
import {
  ApiV3PoolInfoStandardItem,
  ApiV3Token,
  TokenInfo,
  ApiV3PoolInfoStandardItemCpmm,
  CREATE_CPMM_POOL_PROGRAM
} from '@raydium-io/raydium-sdk-v2'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import TokenInput from '@/components/TokenInput'
import HorizontalSwitchSmallIcon from '@/icons/misc/HorizontalSwitchSmallIcon'
import { useAppStore, useLiquidityStore, useTokenAccountStore } from '@/store'
import useFetchRpcPoolData from '@/hooks/pool/amm/useFetchRpcPoolData'
import useFetchCpmmRpcPoolData from '@/hooks/pool/amm/useFetchCpmmRpcPoolData'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol, wSolToSolString } from '@/utils/token'
// import AutoSwapModal from './components/AutoSwapModal'
import StakeLpModal from './components/StakeLpModal'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'

import Decimal from 'decimal.js'
import shallow from 'zustand/shallow'
// import { QuestionToolTip } from '@/components/QuestionToolTip'
import { useEvent } from '@/hooks/useEvent'
import { throttle } from '@/utils/functionMethods'
import useRefreshEpochInfo from '@/hooks/app/useRefreshEpochInfo'
import BN from 'bn.js'

const InputWidth = ['100%']
export default function AddLiquidity({
  pool,
  poolNotFound,
  tokenPair,
  onSelectToken,
  onRefresh
}: {
  pool?: ApiV3PoolInfoStandardItem | ApiV3PoolInfoStandardItemCpmm
  isLoading: boolean
  poolNotFound: boolean
  tokenPair: { base?: ApiV3Token; quote?: ApiV3Token }
  onRefresh: () => void
  onSelectToken: (token: TokenInfo | ApiV3Token, side: 'base' | 'quote') => void
}) {
  const { t } = useTranslation()
  const [addLiquidityAct, computePairAmount, addCpmmLiquidityAct] = useLiquidityStore(
    (s) => [s.addLiquidityAct, s.computePairAmount, s.addCpmmLiquidityAct],
    shallow
  )
  const epochInfo = useAppStore((s) => s.epochInfo)
  useRefreshEpochInfo()

  // const { isOpen: isOpenAutoSwapModal, onOpen: onOpenAutoSwapModal, onClose: onCloseAutoSwapModal } = useDisclosure()
  const { isOpen: isStakeLpOpen, onOpen: onOpenStakeLp, onClose: onCloseStakeLp } = useDisclosure()
  const { isOpen: isReverse, onToggle: onToggleReverse } = useDisclosure()

  const isCpmm = pool && pool.programId === CREATE_CPMM_POOL_PROGRAM.toBase58()

  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { data: rpcAmmData, mutate: mutateAmm } = useFetchRpcPoolData({
    shouldFetch: !isCpmm,
    poolId: pool?.id
  })

  const { data: rpcCpmmData, mutate: mutateCpmm } = useFetchCpmmRpcPoolData({
    shouldFetch: isCpmm,
    poolId: pool?.id
  })

  const rpcData = isCpmm ? rpcCpmmData : rpcAmmData
  const mutate = isCpmm ? mutateCpmm : mutateAmm
  const rpcMintAmountA = rpcData
    ? new Decimal(rpcData.baseReserve.toString()).div(10 ** (pool?.mintA.decimals ?? 0)).toNumber()
    : pool?.mintAmountA
  const rpcMintAmountB = rpcData
    ? new Decimal(rpcData.quoteReserve.toString()).div(10 ** (pool?.mintB.decimals ?? 0)).toNumber()
    : pool?.mintAmountB

  const [computeFlag, setComputeFlag] = useState(Date.now())
  const [isTxSending, setIsTxSending] = useState(false)
  // const [autoSwap, setAutoSwap] = useState(true)
  const [pairAmount, setPairAmount] = useState<{ base: string; quote: string }>({ base: '', quote: '' })
  const computeAmountRef = useRef<{ base: string; quote: string }>({ base: '', quote: '' })
  const computedLpRef = useRef(new Decimal(0))
  const focusRef = useRef<'base' | 'quote'>('base')

  const circleRef = useRef<IntervalCircleHandler>(null)

  const handleCompute = useEvent(() => {
    if (!pool) return
    const isBase = focusRef.current === 'base'
    const updateSide = isBase ? 'quote' : 'base'
    if (computeAmountRef.current[focusRef.current] === '' || poolNotFound) {
      setPairAmount((prev) => {
        computeAmountRef.current = { ...prev, [updateSide]: '' }
        return { ...prev, [updateSide]: '' }
      })
      return
    }

    const rpcLpAmount = isCpmm ? rpcCpmmData?.lpAmount : rpcAmmData?.lpSupply
    computePairAmount({
      pool: {
        ...pool,
        lpAmount: rpcData ? new Decimal(rpcLpAmount!.toString()).div(10 ** rpcData.lpDecimals).toNumber() : pool.lpAmount
      },
      amount: computeAmountRef.current[focusRef.current] || '0',
      baseReserve: rpcData?.baseReserve || new BN(new Decimal(pool.mintAmountA).mul(10 ** pool.mintA.decimals).toString()),
      quoteReserve: rpcData?.quoteReserve || new BN(new Decimal(pool.mintAmountB).mul(10 ** pool.mintB.decimals).toString()),
      baseIn: isBase
    }).then((r) => {
      computeAmountRef.current[updateSide] = r.maxOutput
      computedLpRef.current = new Decimal(r.liquidity.toString())
      setPairAmount((prev) => ({
        ...prev,
        [updateSide]: r.output
      }))
    })
  })

  const handleAmountChange = useEvent((val: string, side: 'base' | 'quote') => {
    computeAmountRef.current[side] = val
    setPairAmount((pair) => ({
      ...pair,
      [side]: val
    }))
    handleCompute()
  })

  useEffect(() => {
    handleCompute()
  }, [pool, computeFlag, poolNotFound, rpcData, epochInfo])

  const [isBalanceAEnough, isBalanceBEnough] = [
    tokenPair.base
      ? new Decimal(getTokenBalanceUiAmount({ mint: tokenPair.base.address, decimals: tokenPair.base.decimals }).text).gte(
          pairAmount.base || '0'
        )
      : true,
    tokenPair.quote
      ? new Decimal(getTokenBalanceUiAmount({ mint: tokenPair.quote.address, decimals: tokenPair.quote.decimals }).text).gte(
          pairAmount.quote || '0'
        )
      : true
  ]

  let error =
    new Decimal(pairAmount.base || '0').lte(0) || new Decimal(pairAmount.quote || '0').lte(0)
      ? {
          key: 'error.enter_token_amount',
          props: {}
        }
      : undefined
  error =
    error ||
    (!isBalanceAEnough || !isBalanceBEnough
      ? {
          key: 'error.insufficient_sub_balance',
          props: {
            token: isBalanceAEnough
              ? getMintSymbol({ mint: tokenPair.quote!, transformSol: true })
              : getMintSymbol({ mint: tokenPair.base!, transformSol: true })
          }
        }
      : undefined)

  const handleEnd = useCallback(
    throttle(() => {
      mutate()
      onRefresh()
      setComputeFlag(Date.now())
    }, 1000),
    [mutate, onRefresh]
  )

  const handleClickCircle = useEvent(() => {
    circleRef.current?.restart()
    handleEnd()
  })

  const handleClickAdd = () => {
    if (!pool) return
    setIsTxSending(true)

    const callBacks = {
      onSent: () => {
        setPairAmount({ base: '', quote: '' })
        computeAmountRef.current = { base: '', quote: '' }
      },
      onConfirmed: () => {
        if (pool.farmOngoingCount > 0) onOpenStakeLp()
      },
      onFinally: () => setIsTxSending(false)
    }

    const isCpmm = pool.programId === useAppStore.getState().programIdConfig.CREATE_CPMM_POOL_PROGRAM.toBase58()
    const baseIn = focusRef.current === 'base'

    if (isCpmm) {
      addCpmmLiquidityAct({
        poolInfo: pool as ApiV3PoolInfoStandardItemCpmm,
        inputAmount: baseIn ? computeAmountRef.current.base : computeAmountRef.current.quote,
        anotherAmount: baseIn ? computeAmountRef.current.quote : computeAmountRef.current.base,
        liquidity: computedLpRef.current.toString(),
        baseIn,
        ...callBacks
      })
      return
    }
    addLiquidityAct({
      poolInfo: pool as ApiV3PoolInfoStandardItem,
      amountA: computeAmountRef.current.base,
      amountB: computeAmountRef.current.quote,
      fixedSide: baseIn ? 'a' : 'b',
      ...callBacks
    })
  }

  return (
    <Flex direction="column" w="full" px="24px" py="40px" bg={colors.backgroundLight}>
      {/* modal */}
      {/* <AutoSwapModal
        isOpen={isOpenAutoSwapModal}
        autoSwap={autoSwap}
        onClose={onCloseAutoSwapModal}
        onConfirm={() => {
          setAutoSwap((p) => !p)
          onCloseAutoSwapModal()
        }}
      /> */}
      {/* header */}
      {/* TODO: currently auto-swap can't enabled */}
      {/* <Flex w="full" flexGrow={1} justify="space-between">
        <HStack spacing={2}>
          <Text color={colors.textTertiary}>{t('liquidity.auto_swap')}</Text>
          <Box onClick={onOpenAutoSwapModal}>
            <Switch isChecked={autoSwap} />
            <Switch isChecked={false} disabled />
          </Box>
          <QuestionToolTip label={<Box>{t('liquidity.auto_swap_hint')}</Box>} iconProps={{ color: colors.textTertiary }} />
        </HStack>
      </Flex> */}
      {/* base token */}
      <Flex mt={5} justify="center" align="center" w={InputWidth} h="118px" borderRadius="12px">
        <TokenInput
          width="100%"
          ctrSx={{ w: '100%' }}
          topBlockSx={{ py: '6px' }}
          token={tokenPair.base}
          value={pairAmount.base}
          disableSelectToken
          onChange={(v) => handleAmountChange(v, 'base')}
          onTokenChange={(token) => onSelectToken(token, 'base')}
          onFocus={() => (focusRef.current = 'base')}
        />
      </Flex>
      {/* quote token */}
      <Flex mt={3} justify="center" align="center" w={InputWidth} h="118px" borderRadius="12px">
        <TokenInput
          width="100%"
          ctrSx={{ w: '100%' }}
          topBlockSx={{ py: '6px' }}
          token={tokenPair.quote}
          value={pairAmount.quote}
          disableSelectToken
          onChange={(v) => handleAmountChange(v, 'quote')}
          onTokenChange={(token) => onSelectToken(token, 'quote')}
          onFocus={() => (focusRef.current = 'quote')}
        />
      </Flex>
      {/* total deposit */}
      <Flex
        mt={4}
        justify="space-between"
        align="center"
        w={InputWidth}
        h="60px"
        bg={colors.backgroundTransparent12}
        borderRadius="12px"
        px={5}
        py={4}
      >
        <Text fontSize="sm" color={colors.textSecondary} opacity={0.6}>
          {t('liquidity.total_deposit')}
        </Text>
        <Text fontSize="xl" color={colors.textPrimary} fontWeight="medium">
          {formatCurrency(new Decimal(pool?.lpPrice ?? 0).mul(computedLpRef.current.div(10 ** (pool?.lpMint.decimals ?? 0))).toString(), {
            symbol: '$'
          })}
        </Text>
      </Flex>
      {/* footer */}
      <Flex mt={5} justify="space-between" align="center" w={InputWidth}>
        <HStack fontSize="sm" color={colors.textSecondary} spacing="6px">
          <Text>
            {pool
              ? `1 ${wSolToSolString(pool[isReverse ? 'mintB' : 'mintA'].symbol)} ≈ ${formatCurrency(
                  new Decimal((isReverse ? rpcMintAmountA! : rpcMintAmountB!) / (isReverse ? rpcMintAmountB! : rpcMintAmountA!)).toFixed(
                    Math.max(pool[isReverse ? 'mintA' : 'mintB'].decimals, 6),
                    Decimal.ROUND_UP
                  )
                )} ${wSolToSolString(pool[isReverse ? 'mintA' : 'mintB'].symbol)}`
              : '-'}
          </Text>
          <HorizontalSwitchSmallIcon cursor="pointer" onClick={onToggleReverse} />
        </HStack>
        <HStack fontSize="xl" color={colors.textPrimary} fontWeight="medium" spacing={3}>
          <SlippageAdjuster />
          <IntervalCircle
            componentRef={circleRef}
            svgWidth={18}
            strokeWidth={2}
            trackStrokeColor={colors.secondary}
            trackStrokeOpacity={0.5}
            filledTrackStrokeColor={colors.secondary}
            onClick={handleClickCircle}
            onEnd={handleEnd}
          />
        </HStack>
      </Flex>
      <Button
        mt={7}
        w="full"
        isDisabled={poolNotFound || !pool || !!error}
        isLoading={isTxSending}
        loadingText={`${t('liquidity.add_liquidity')}...`}
        onClick={handleClickAdd}
      >
        {error ? t(error.key, error.props) : poolNotFound ? t('liquidity.pool_not_found') : t('liquidity.add_liquidity')}
      </Button>

      <StakeLpModal isOpen={isStakeLpOpen} onClose={onCloseStakeLp} />
    </Flex>
  )
}
