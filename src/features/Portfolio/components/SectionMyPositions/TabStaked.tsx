import { Flex, Text, Button, Skeleton } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { routeToPage } from '@/utils/routeTools'
import useFetchStakePools from '@/hooks/pool/useFetchStakePools'
import StakingPositionRawItem from './components/Staked/StakingPositionRawItem'
import Decimal from 'decimal.js'
import toApr from '@/utils/numberish/toApr'
import { colors } from '@/theme/cssVariables/colors'
import { panelCard } from '@/theme/cssBlocks'

import { FarmBalanceInfo } from '@/hooks/farm/type'

export default function MyPositionTabStaked({ allFarmBalances }: { allFarmBalances: FarmBalanceInfo[] }) {
  const { t } = useTranslation()
  const { activeStakePools, isLoading } = useFetchStakePools({})

  const pool = activeStakePools[0]
  const res = allFarmBalances.find((f) => f.id === pool?.id)

  return (
    <Flex direction="column" gap={4}>
      {pool && res && new Decimal(res.deposited).gt(0) ? (
        <StakingPositionRawItem
          key={`user-position-staked-pool-${pool.id}-row`}
          pool={pool}
          staked={{ token: pool.lpMint, amount: res.deposited, pendingReward: res.pendingRewards[0] || '0' }}
          apr={toApr({ val: pool.apr || 0 })}
        />
      ) : (
        <Flex
          {...panelCard}
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
          {isLoading ? (
            <Skeleton height="100px" w="full" borderRadius="xl" />
          ) : (
            <>
              <Text variant="title" fontSize="sm">
                {t('portfolio.no_staked_farm')}
              </Text>
              <Button onClick={() => routeToPage('staking')}>{t('common.go_to_staking')}</Button>
            </>
          )}
        </Flex>
      )}
    </Flex>
  )
}
