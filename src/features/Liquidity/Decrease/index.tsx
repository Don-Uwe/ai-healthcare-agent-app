import { Box, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoStandardItem } from '@raydium-io/raydium-sdk-v2'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Tabs from '@/components/Tabs'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { routeBack, setUrlQuery, useRouteQuery } from '@/utils/routeTools'

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

  const [tabValue, setTabValue] = useState<DecreaseTabOptionType['value'] | undefined>(undefined)
  const [stakedLiquidity, setStakedLiquidity] = useState('0')

  const { formattedData } = useFetchPoolById<ApiV3PoolInfoStandardItem>({
    idList: [poolId]
  })
  const poolInfo = formattedData?.[0]

  const handleStakedChange = useCallback((val: string) => setStakedLiquidity(val), [])

  useEffect(() => {
    setTabValue(queryMode === 'remove' ? 'Remove Liquidity' : 'Unstake Liquidity')
  }, [queryMode])

  const handleTabChange = useEvent((value: DecreaseTabOptionType['value']) => {
    setTabValue(value)
    setUrlQuery({ mode: tabValueModeMapping[value] })
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
                  getTokenBalanceUiAmount({ mint: poolInfo?.lpMint.address || '', decimals: poolInfo?.lpMint.decimals }).localeText
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
              <RemoveLiquidity poolInfo={poolInfo} />
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
