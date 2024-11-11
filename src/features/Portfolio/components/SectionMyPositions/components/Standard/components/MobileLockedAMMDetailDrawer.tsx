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
  Text
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import PendingFees from '../ItemDetail/PendingFees'
import TokenPooledInfo from '../ItemDetail/TokenInfo'
import { FarmTitleBadge } from '../ItemDetail/FarmTitleBadge'
import StandardPoolAPR from '../ItemDetail/StandardPoolAPR'
import { formatCurrency } from '@/utils/numberish/formatter'
import LockIcon from '@/icons/misc/LockIcon'
import { CpmmLockData } from '@/hooks/portfolio/cpmm/useLockCpmmBalance'

export default function MobileLockedAMMDetailDrawer({
  isOpen,
  onClose,
  pool,
  lockInfo,
  hasStakeFarm,
  stakeFarmCount,
  onHarvest
}: {
  isOpen: boolean
  onClose: () => void
  pool: FormattedPoolInfoStandardItem
  lockInfo: CpmmLockData
  hasStakeFarm: boolean
  stakeFarmCount: number
  onHarvest: () => void
}) {
  const { t } = useTranslation()
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody>
          <Grid
            gridTemplate={`
              "name  name" auto
              "i1    i2  " auto
              "d     d   " auto / 1fr 1fr
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
              <Flex direction="column" justify={'space-between'} py={1}>
                <HStack gap={1} color={colors.textSecondary} mb={[2, '18px']}>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t('liquidity.locked_position')}
                  </Text>
                  <LockIcon color={colors.lightPurple} />
                </HStack>
                <Text fontSize="lg" color={colors.textPrimary} fontWeight="medium">
                  {formatCurrency(lockInfo.positionInfo.usdValue, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                </Text>
              </Flex>
            </GridItem>

            <GridItem flexGrow={1} area="i2" justifySelf="center">
              <StandardPoolAPR center positionAPR={pool.day.apr} />
            </GridItem>

            <GridItem area="d" display="grid" gridTemplateRows="auto auto" columnGap={4} rowGap={3} justifyItems="stretch">
              <TokenPooledInfo
                base={{ token: pool.mintA, amount: lockInfo.positionInfo.amountA }}
                quote={{ token: pool.mintB, amount: lockInfo.positionInfo.amountB }}
              />
              <PendingFees
                pendingFee={lockInfo.positionInfo.unclaimedFee.usdValue}
                poolInfo={pool}
                lockData={lockInfo}
                onHarvest={onHarvest}
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
