import { Box, Skeleton } from '@chakra-ui/react'

import PageHeroTitle from '@/components/PageHeroTitle'
import useFetchStakePools from '@/hooks/pool/useFetchStakePools'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import { useTranslation } from 'react-i18next'
import StakingPoolItem from './components/StakingPoolItem'

export type StakingPageQuery = {
  dialog?: 'unstake' | 'stake'
  open?: string // token mint
}

export default function Staking() {
  const { t } = useTranslation()
  const { activeStakePools, isLoading } = useFetchStakePools({})
  const { lpBasedData } = useFarmPositions({})

  return (
    <Box>
      <Box mb={[4, 8]}>
        <PageHeroTitle title={t('staking.title')} description={t('staking.staking_desc') || ''} />
      </Box>
      {isLoading ? (
        <Skeleton width="80%" height="20px" />
      ) : (
        activeStakePools.map((pool) => (
          <StakingPoolItem key={pool.id} pool={pool} apiVaultData={lpBasedData.get(pool?.lpMint.address || '')} />
        ))
      )}
    </Box>
  )
}
