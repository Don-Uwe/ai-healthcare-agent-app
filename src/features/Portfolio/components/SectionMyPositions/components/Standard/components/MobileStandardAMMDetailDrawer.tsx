import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { FarmPositionInfo } from '@/hooks/portfolio/farm/useFarmPositions'
import { colors } from '@/theme/cssVariables'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  Text,
  VStack
} from '@chakra-ui/react'
import ActionButtons from '../ItemDetail/ActionButtons'
import ItemName from '../ItemDetail/ItemName'
import PendingRewards from '../ItemDetail/PendingRewards'
import StandardMyPosition from '../ItemDetail/StandardMyPosition'
import StandardPoolAPR from '../ItemDetail/StandardPoolAPR'
import TokenPooledInfo from '../ItemDetail/TokenInfo'
import StandardPoolRowStakeFarmHoldItem from './StandardPoolRowStakeFarmHoldItem'
import StandardPoolRowStakeFarmItem from './StandardPoolRowStakeFarmItem'
import { FarmBalanceInfo } from '@/hooks/farm/type'
import { useTranslation } from 'react-i18next'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

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
        <DrawerCloseButton />
        <DrawerHeader visibility="hidden">{t('liquidity_pools.modal_header_standard_position_detail')}</DrawerHeader>
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
            rowGap={[2, 3]}
          >
            <GridItem flexGrow={1} area="name" maxW={['unset', '200px']}>
              <ItemName
                variant="item-face"
                baseToken={pool.mintA}
                quoteToken={pool.mintB}
                poolName={pool.poolName}
                hasStakeFarm={hasStakeFarm}
                stakeFarmCount={stakeFarmCount}
              />
            </GridItem>

            <GridItem flexGrow={1} area="i1" justifySelf="center" w={['unset', '92px']} maxW={['unset', '150px']}>
              <StandardMyPosition center positionUsd={lpAmountUSD} />
            </GridItem>

            <GridItem flexGrow={1} area="i2" justifySelf="center" w={['unset', '92px']} maxW={['unset', '150px']}>
              <StandardPoolAPR center positionAPR={0} />
            </GridItem>

            <GridItem
              area="d"
              flexGrow={3}
              display="grid"
              maxW={['unset', '700px']}
              gridTemplateColumns={['unset', '1fr 1fr']}
              gridTemplateRows={['auto auto', 'unset']}
              columnGap={4}
              rowGap={3}
              justifyItems="stretch"
            >
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
              <Text fontSize="sm" mt={1} mb={2} color={colors.textSecondary}>
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

            <GridItem area="acts" ml={['unset', 'auto']}>
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
          <Button variant="ghost" w="full" h="20px">
            {t('button.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
