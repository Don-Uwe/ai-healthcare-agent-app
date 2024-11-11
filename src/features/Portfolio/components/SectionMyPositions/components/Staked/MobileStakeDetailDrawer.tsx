import { colors } from '@/theme/cssVariables'
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, HStack, Spacer, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import TokenAvatar from '@/components/TokenAvatar'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { routeToPage } from '@/utils/routeTools'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'

export default function MobileStakeDetailDrawer({
  isOpen,
  onClose,
  id,
  token,
  amount,
  positionUsd,
  pendingReward,
  apr,
  isLoading,
  harvestable,
  onHarvest
}: {
  isOpen: boolean
  onClose: () => void
  id: string
  token: ApiV3Token | undefined
  amount: string
  positionUsd: string
  pendingReward: string
  apr: string
  isLoading: boolean
  harvestable: boolean
  onHarvest: () => void
}) {
  const { t } = useTranslation()
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody>
          <Flex direction="column" alignItems="center" gap={2} mb={6}>
            <TokenAvatar size="lg" token={token} />
            <HStack spacing={2}>
              <Text color={colors.textPrimary} fontWeight="500" fontSize="20px" whiteSpace={'nowrap'}>
                {t('portfolio.section_positions_tab_staking')}
              </Text>
            </HStack>
          </Flex>
          <Flex justify={'space-between'} bg={colors.backgroundDark} rounded="xl" py={4} px={6} pr={16} mb={3} fontSize="sm">
            <Flex flex={1} direction="column" justify={'space-between'} gap={1}>
              <Text color={colors.textSecondary} opacity={0.5}>
                {t('staking.my_staked_ray')}
              </Text>
              <Text color={colors.textPrimary}>{formatCurrency(positionUsd, { symbol: '$', decimalPlaces: 2 })}</Text>
              <Text fontSize="xs" color={colors.lightPurple} opacity={0.5}>
                {formatCurrency(amount)} {token?.symbol}
              </Text>
            </Flex>
            <Flex flex={1} direction="column" justify={'space-between'} gap={1}>
              <Text color={colors.textSecondary} opacity={0.5}>
                {t('field.apr')}
              </Text>
              <Text color={colors.textPrimary}>{formatToRawLocaleStr(apr)}</Text>
              <Spacer />
            </Flex>
          </Flex>
          <Flex bg={colors.backgroundDark} rounded="lg" direction="column" py={3} px={4} gap={4}>
            <Text fontSize="sm" color={colors.textSecondary} opacity={0.5}>
              {t('staking.pending_rewards')}
            </Text>
            <Flex justify={'space-between'} align="center">
              <HStack fontSize="sm" color={colors.textSecondary} fontWeight="500" spacing={1}>
                <Text>{formatCurrency(pendingReward, { symbol: '$', decimalPlaces: 6 })}</Text>
                <QuestionToolTip label={t('staking.pending_rewards_tooltip')} iconType="info" />
              </HStack>
              <Button variant="outline" size="sm" isDisabled={!harvestable} isLoading={isLoading} onClick={onHarvest}>
                {t('staking.pending_rewards_button')}
              </Button>
            </Flex>
          </Flex>
        </DrawerBody>
        <DrawerFooter bg="transparent" flexDirection="column" gap={2} mt={14}>
          <Flex width="100%" justifyContent="space-between" gap={2}>
            <Button
              variant="outline"
              size="sm"
              width="100%"
              onClick={() => {
                routeToPage('staking', { queryProps: { dialog: 'unstake', open: id } })
              }}
            >
              <MinusIcon color={colors.secondary} />
            </Button>
            <Button
              size="sm"
              width="100%"
              onClick={() => {
                routeToPage('staking', { queryProps: { dialog: 'stake', open: id } })
              }}
            >
              <PlusIcon />
            </Button>
          </Flex>
          <Button variant="ghost" width="100%" size={'sm'} onClick={onClose}>
            {t('button.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
