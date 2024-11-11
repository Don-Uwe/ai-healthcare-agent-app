import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { FarmPositionInfo } from '@/hooks/portfolio/farm/useFarmPositions'
import { colors } from '@/theme/cssVariables'
import ActionButtons from '../ItemDetail/ActionButtons'
import PendingRewards from '../ItemDetail/PendingRewards'
import StandardMyPosition from '../ItemDetail/StandardMyPosition'
import TokenPooledInfo from '../ItemDetail/TokenInfo'
import { FarmTitleBadge } from '../ItemDetail/FarmTitleBadge'
import StandardPoolAPR from '../ItemDetail/StandardPoolAPR'
import StandardPoolRowStakeFarmHoldItem from './StandardPoolRowStakeFarmHoldItem'
import StandardPoolRowStakeFarmItem from './StandardPoolRowStakeFarmItem'
import { FarmBalanceInfo } from '@/hooks/farm/type'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import TokenAvatarPair from '@/components/TokenAvatarPair'

export default function MobileStandardAMMDetailDrawer({
  isOpen,
  onClose,
  pool,
  hasStakeFarm,
  stakeFarmCount,
  lpAmountUSD,
  stakedFarms,
  pendingReward,
  positionStatus,
  pooledAmountA,
  pooledAmountB,
  isLoading,
  canStake,
  rewardInfo,
  allFarmBalances,
  onUpdatePendingReward,
  onHarvest
}: {
  isOpen: boolean
  onClose: () => void
  pool: FormattedPoolInfoStandardItem
  hasStakeFarm: boolean
  stakeFarmCount: number
  lpAmountUSD: string
  stakedFarms: FarmPositionInfo['data']
  pendingReward: string
  positionStatus: string
  pooledAmountA: string
  pooledAmountB: string
  isLoading: boolean
  canStake: boolean
  rewardInfo: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  allFarmBalances: FarmBalanceInfo[]
  onUpdatePendingReward: (params: {
    farmId: string
    reward: { mint: ApiV3Token[]; usd: string; amount: string[]; rewardTokenUsd: string[] }
  }) => void
  onHarvest: () => void
}) {
  const { t } = useTranslation()
  const canMigrate = false
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody>
          <Grid
            gridTemplate={`
              "name  name" auto
              "i1    i2  " auto
              "d     d   " auto
              "subs  subs" auto
              "acts  acts" auto / 1fr 1fr
            `}
            columnGap={8}
            rowGap={2}
          >
            <GridItem flexGrow={1} area="name">
              <Flex flexWrap={'wrap'} direction="column" alignItems="center" rowGap={1} columnGap={1}>
                <TokenAvatarPair size="40px" token1={pool.mintA} token2={pool.mintB} />
                <HStack spacing={2}>
                  <Box color={colors.textPrimary} fontWeight="500" fontSize="20px" whiteSpace={'nowrap'}>
                    {pool.poolName.replace(' - ', '/')}
                  </Box>
                  {hasStakeFarm && stakeFarmCount !== 0 && <FarmTitleBadge stakeFarmCount={stakeFarmCount} />}
                </HStack>
              </Flex>
            </GridItem>

            <GridItem flexGrow={1} area="i1" justifySelf="center">
              <StandardMyPosition positionUsd={lpAmountUSD} />
            </GridItem>

            <GridItem flexGrow={1} area="i2" justifySelf="center">
              <StandardPoolAPR center positionAPR={pool.day.apr} />
            </GridItem>

            <GridItem area="d" display="grid" gridTemplateRows="auto auto" columnGap={4} rowGap={3} justifyItems="stretch">
              <TokenPooledInfo base={{ token: pool.mintA, amount: pooledAmountA }} quote={{ token: pool.mintB, amount: pooledAmountB }} />
              <PendingRewards
                pendingReward={pendingReward}
                rewardInfo={rewardInfo}
                positionStatus={positionStatus}
                isLoading={isLoading}
                onHarvest={onHarvest}
              />
            </GridItem>

            <GridItem area="subs">
              <Text fontSize="sm" mt={1} mb={3} color={colors.textSecondary}>
                {t('liquidity_pools.farms')}
              </Text>
              {hasStakeFarm && (
                <Box>
                  <VStack gap={3}>
                    {stakedFarms.map((stakeFarm) => (
                      <StandardPoolRowStakeFarmItem
                        key={stakeFarm.farmId}
                        farmId={stakeFarm.farmId}
                        poolId={pool.id}
                        lpPrice={pool.lpPrice}
                        onUpdatePendingReward={onUpdatePendingReward}
                        balanceInfo={allFarmBalances.find((f) => f.id === stakeFarm.farmId)}
                      />
                    ))}
                  </VStack>

                  <Box mt={3}>
                    <StandardPoolRowStakeFarmHoldItem apr={pool.day.apr} lpMint={pool.lpMint} lpPrice={pool.lpPrice} />
                  </Box>
                </Box>
              )}
            </GridItem>

            <GridItem area="acts">
              <ActionButtons
                variant="drawer-face"
                poolId={pool.id}
                hasFarmLp={hasStakeFarm}
                canStake={canStake}
                canMigrate={Boolean(canMigrate)}
                canViewMore={Boolean(stakeFarmCount) && !isOpen}
              />
            </GridItem>
          </Grid>
        </DrawerBody>
        <DrawerFooter bg="transparent">
          <Button variant="ghost" w="full" h="20px" onClick={onClose}>
            {t('button.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
