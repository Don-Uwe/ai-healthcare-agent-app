import { Box, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoStandardItem, CREATE_CPMM_POOL_PROGRAM } from '@raydium-io/raydium-sdk-v2'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Tabs from '@/components/Tabs'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { routeBack, setUrlQuery, useRouteQuery } from '@/utils/routeTools'
import useFetchRpcPoolData from '@/hooks/pool/amm/useFetchRpcPoolData'
import useFetchCpmmRpcPoolData from '@/hooks/pool/amm/useFetchCpmmRpcPoolData'
import { LiquidityActionModeType, tabValueModeMapping } from '../utils'
import BalanceInfo from './components/BalanceInfo'
import RemoveLiquidity from './components/RemoveLiquidity'
import UnStakeLiquidity from './components/UnStakeLiquidity'

export type DecreaseTabOptionType = {
  value: 'Unstake Liquidity' | 'Remove Liquidity'
  label: string
}

export type DecreaseLiquidityPageQuery = {
  mode?: LiquidityActionModeType
  pool_id?: string
  farm_id?: string
}

/**
 * unstake/remove liquidity
 */
export default function Decrease() {
  const { t } = useTranslation()

  const decreaseTabOptions: DecreaseTabOptionType[] = [
    { value: 'Unstake Liquidity', label: t('liquidity.unstake_liquidity') },
    { value: 'Remove Liquidity', label: t('liquidity.remove_liquidity') }
  ]
  const { pool_id: poolId = '', mode: queryMode = 'unstake', farm_id } = useRouteQuery<DecreaseLiquidityPageQuery>()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const fetchTokenAccountAct = useTokenAccountStore((s) => s.fetchTokenAccountAct)

  const [tabValue, setTabValue] = useState<DecreaseTabOptionType['value'] | undefined>(undefined)
  const [stakedLiquidity, setStakedLiquidity] = useState('0')

  const { formattedData, mutate } = useFetchPoolById<ApiV3PoolInfoStandardItem>({
    idList: [poolId]
  })
  const poolInfo = formattedData?.[0]
  const isCpmm = poolInfo && poolInfo.programId === CREATE_CPMM_POOL_PROGRAM.toBase58()
  const { data: rpcAmmPoolData, mutate: rpcAmmMutate } = useFetchRpcPoolData({
    shouldFetch: !isCpmm,
    poolId: poolInfo?.id,
    refreshInterval: 30 * 1000
  })
  const { data: rpcCpmmPoolData, mutate: rpcCpmmMutate } = useFetchCpmmRpcPoolData({
    shouldFetch: isCpmm,
    poolId: poolInfo?.id,
    refreshInterval: 30 * 1000
  })
  const rpcMutate = isCpmm ? rpcCpmmMutate : rpcAmmMutate
  const rpcPoolData =
    rpcAmmPoolData || rpcCpmmPoolData
      ? {
          baseReserve: isCpmm ? rpcCpmmPoolData!.baseReserve : rpcAmmPoolData!.baseReserve,
          quoteReserve: isCpmm ? rpcCpmmPoolData!.quoteReserve : rpcAmmPoolData!.quoteReserve,
          baseDecimals: isCpmm ? rpcCpmmPoolData!.mintDecimalA : rpcAmmPoolData!.baseDecimals,
          quoteDecimals: isCpmm ? rpcCpmmPoolData!.mintDecimalB : rpcAmmPoolData!.quoteDecimals,
          lpSupply: isCpmm ? rpcCpmmPoolData!.lpAmount : rpcAmmPoolData!.lpSupply,
          lpDecimals: isCpmm ? rpcCpmmPoolData!.lpDecimals : rpcAmmPoolData!.lpDecimals
        }
      : undefined

  const handleStakedChange = useCallback((val: string) => setStakedLiquidity(val), [])

  useEffect(() => {
    setTabValue(queryMode === 'remove' ? 'Remove Liquidity' : 'Unstake Liquidity')
  }, [queryMode])

  const handleTabChange = useEvent((value: DecreaseTabOptionType['value']) => {
    setTabValue(value)
    setUrlQuery({ mode: tabValueModeMapping[value] })
  })

  const handleRefresh = useEvent(() => {
    mutate()
    rpcMutate()
    fetchTokenAccountAct({})
  })

  return (
    <>
      <Grid templateColumns={['unset', '1fr 2fr 1fr']} gap={'clamp(16px, 1.5vw, 64px)'} mt={8}>
        {/* left */}
        <GridItem>
          <HStack
            onClick={() => {
              routeBack()
            }}
            cursor="pointer"
            color={colors.textTertiary}
            _hover={{ color: colors.textSecondary }}
          >
            <ChevronLeftIcon />
            <Text fontWeight="500" fontSize={['md', 'xl']}>
              {t('common.back')}
            </Text>
          </HStack>
        </GridItem>
        {/* main */}
        <GridItem>
          <VStack spacing={4}>
            <Box bg={colors.backgroundLight30} borderRadius="20px" overflow="hidden" w="full">
              <Tabs isFitted items={decreaseTabOptions} size="md" variant="folder" value={tabValue} onChange={handleTabChange} />
              <BalanceInfo
                currentTab={tabValue}
                stakedLiquidity={stakedLiquidity}
                unstakedLiquidity={
                  getTokenBalanceUiAmount({ mint: poolInfo?.lpMint.address || '', decimals: poolInfo?.lpMint.decimals }).text
                }
              />
            </Box>
            {queryMode === 'unstake' ? (
              <UnStakeLiquidity
                poolInfo={poolInfo}
                lpPrice={poolInfo?.lpPrice || 0}
                onStakedChange={handleStakedChange}
                defaultFarm={farm_id}
              />
            ) : (
              <RemoveLiquidity poolInfo={poolInfo} rpcPoolData={rpcPoolData} onRefresh={handleRefresh} />
            )}
          </VStack>
        </GridItem>
        {/* right */}
        <GridItem>
          <VStack maxW="280px" justify="flex-start" align="flex-start" spacing={4}></VStack>
        </GridItem>
      </Grid>
    </>
  )
}
