import React from 'react'
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerOverlay, Text, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import PoolInfo from './PoolInfo'
import PositionBalance from './PositionBalance'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { AprData } from '@/features/Clmm/utils/calApr'

export default function PoolDetailMobileDrawer({
  isOpen,
  onClose,
  pool,
  aprData,
  myPosition = '0',
  staked = '0',
  unstaked = '0'
}: {
  isOpen: boolean
  onClose: () => void
  pool?: FormattedPoolInfoStandardItem
  aprData: AprData
  myPosition: string | number
  staked: string | number
  unstaked: string | number
}) {
  const { t } = useTranslation()
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody p="20px">
          <Flex flexDirection="column" gap={3}>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              {t('liquidity.pool_detail')}
            </Text>
            <PoolInfo pool={pool} aprData={aprData} />
            <PositionBalance myPosition={myPosition} staked={staked} unstaked={unstaked} />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
