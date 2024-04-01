import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useFetchMultipleRpcClmmInfo from '@/hooks/pool/clmm/useFetchMultipleRpcClmmInfo'
import Button from '@/components/Button'
import { ClmmDataWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, Text } from '@chakra-ui/react'
import { ClmmPositionItemsCard } from './components/Clmm/ClmmPositionItemsCard'
import { ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'
import { deleteOpenCache } from './utils'

export function ClmmMyPositionTabContent({
  isLoading,
  clmmBalanceInfo,
  refreshTag,
  setNoRewardClmmPos
}: {
  isLoading: boolean
  refreshTag: number
  clmmBalanceInfo: ClmmDataWithUpdateFn
  setNoRewardClmmPos: (val: string, isDelete?: boolean) => void
}) {
  const { t } = useTranslation()
  const { formattedDataMap } = useFetchPoolById<ApiV3PoolInfoConcentratedItem>({
    idList: Array.from(clmmBalanceInfo.keys()),
    refreshTag,
    keepPreviousData: true
  })
  const allPositions = useMemo(() => {
    const data = Array.from(clmmBalanceInfo.entries())
    data.forEach((pos) => {
      const noneZeroPos = pos[1].filter((p) => !p.liquidity.isZero())
      const zeroPos = pos[1].filter((p) => p.liquidity.isZero())
      pos[1] = [...noneZeroPos.sort((a, b) => a.tickLower - b.tickLower), ...zeroPos.sort((a, b) => a.tickLower - b.tickLower)]
    })
    data.sort((a, b) => (formattedDataMap[b[0]]?.tvl || 0) - (formattedDataMap[a[0]]?.tvl || 0))
    return data
  }, [clmmBalanceInfo, formattedDataMap])

  const { dataMap } = useFetchMultipleRpcClmmInfo({
    idList: Array.from(clmmBalanceInfo.keys()),
    refreshTag
  })

  useEffect(() => {
    return () => deleteOpenCache()
  }, [])

  return (
    <Box display="flex" flexDir="column" gap={4}>
      {allPositions.length ? (
        allPositions.map((data) => (
          <ClmmPositionItemsCard
            key={data[0]}
            isLoading={isLoading}
            poolId={data[0]}
            positions={data[1]}
            poolInfo={formattedDataMap[data[0]]}
            initRpcPoolData={
              dataMap[data[0]]
                ? {
                    poolId: data[0],
                    currentPrice: dataMap[data[0]].currentPrice.toNumber(),
                    poolInfo: dataMap[data[0]]
                  }
                : undefined
            }
            setNoRewardClmmPos={setNoRewardClmmPos}
          />
        ))
      ) : (
        <Flex
          alignItems="center"
          justifyContent="center"
          minH="200px"
          flexDir="column"
          py={5}
          px={8}
          bg={colors.backgroundLight}
          gap={6}
          borderRadius="xl"
        >
          <Text variant="title" fontSize="sm">
            {t('clmm.no_clmm_positions')}
          </Text>
          <Link href="/liquidity-pools">
            <Button>{t('common.go_to_pools')}</Button>
          </Link>
        </Flex>
      )}
    </Box>
  )
}
