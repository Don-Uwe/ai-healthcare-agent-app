import { colors } from '@/theme/cssVariables'
import { Badge, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { RewardInfo } from './FarmItem'
import { FarmCategory } from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenAvatar from '@/components/TokenAvatar'
import AddressChip from '@/components/AddressChip'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toApr from '@/utils/numberish/toApr'
import { wSolToSolString } from '@/utils/token'
import { routeToPage } from '@/utils/routeTools'

export default function MobileFarmDetailDrawer({
  isOpen,
  onClose,
  name,
  baseToken,
  quoteToken,
  id,
  type,
  tvl,
  apr,
  decimals,
  rewardsInfo
}: {
  isOpen: boolean
  onClose: () => void
  name: string
  baseToken: ApiV3Token
  quoteToken: ApiV3Token
  id: string
  type: FarmCategory
  tvl: number
  apr: number
  decimals: number
  rewardsInfo: RewardInfo[]
}) {
  const { t } = useTranslation()
  const isStandard = type === FarmCategory.Standard
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody>
          <Flex direction="column" alignItems="center" gap={2} mb={6}>
            <TokenAvatarPair size="40px" token1={baseToken} token2={quoteToken} />
            <HStack spacing={2}>
              <Text color={colors.textPrimary} fontWeight="500" fontSize="20px" whiteSpace={'nowrap'}>
                {name?.replace(' - ', '/')}
              </Text>
              {type && <Badge variant="crooked">{type.slice(0, 1)}</Badge>}
            </HStack>
            <AddressChip
              textProps={{ color: colors.textSecondary, fontSize: 'xs' }}
              showDigitCount={8}
              address={id}
              canExternalLink
              iconProps={{ color: colors.textSecondary }}
            />
          </Flex>
          <Flex justify={'space-between'} bg={colors.backgroundDark} rounded="xl" py={4} px={6} pr={16} mb={3} fontSize="sm">
            <Flex direction="column" justify="flex-start" align="flex-start" gap={1}>
              <Text color={colors.textTertiary}>{t('common.tvl')}</Text>
              <Text color={colors.textPrimary}>~{formatCurrency(tvl, { symbol: '$', decimalPlaces: decimals })}</Text>
            </Flex>
            <Flex direction="column" justify="flex-start" align={'flex-start'} gap={1}>
              <Text color={colors.textTertiary}>{t('field.apr')}</Text>
              <Text color={colors.textPrimary}>{formatToRawLocaleStr(toApr({ val: apr }))}</Text>
            </Flex>
          </Flex>
          <Flex
            bg={colors.backgroundDark}
            color={colors.textPrimary}
            direction="column"
            justify={'flex-start'}
            align={'flex-start'}
            rounded="xl"
            py={4}
            px={6}
            mb={3}
            gap={1}
          >
            <Text fontSize="sm" color={colors.textTertiary}>
              {t('create_farm.weekly_rewards')}
            </Text>
            <Flex direction="column" fontSize="sm" color={colors.textPrimary} gap={2} width="100%">
              {rewardsInfo.length
                ? rewardsInfo.map((reward) => (
                    <Flex key={reward.mint.address} justifyContent="space-between">
                      <Flex justify={'flex-start'} align="center">
                        <TokenAvatar size="xs" token={reward.mint} mr={1} />
                        <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary} mr={1}>
                          {formatCurrency(reward.weekly, { decimalPlaces: reward.mint.decimals })}
                        </Text>
                        <Text fontSize="sm" fontWeight="medium" color={colors.textTertiary}>
                          {wSolToSolString(reward.mint.symbol)}
                        </Text>
                      </Flex>
                      <Text fontSize="xs" color={colors.lightPurple}>
                        {reward.periodString}
                      </Text>
                    </Flex>
                  ))
                : '--'}
            </Flex>
          </Flex>
          <Flex
            bg={colors.backgroundDark}
            color={colors.textPrimary}
            direction="column"
            justify={'flex-start'}
            align={'flex-start'}
            rounded="xl"
            py={4}
            px={6}
            mb={16}
            gap={1}
          >
            <Text fontSize="sm" color={colors.textTertiary}>
              {t('create_farm.unemmitted_rewards')}
            </Text>
            <Flex direction="column" fontSize="sm" color={colors.textPrimary} gap={2}>
              {rewardsInfo.length
                ? rewardsInfo.map((reward) => (
                    <Flex key={reward.mint.address} justify={'flex-start'} align="center">
                      <TokenAvatar size="xs" token={reward.mint} mr={1} />
                      <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary} mr={1}>
                        {formatToRawLocaleStr(reward.unEmit)}
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color={colors.textTertiary}>
                        {wSolToSolString(reward.mint.symbol)}
                      </Text>
                    </Flex>
                  ))
                : '--'}
            </Flex>
          </Flex>
        </DrawerBody>
        <DrawerFooter bg="transparent" flexDirection="column">
          <Button
            width="100%"
            size={'sm'}
            onClick={() => {
              routeToPage('edit-farm', { queryProps: isStandard ? { farmId: id } : { clmmId: id } })
            }}
          >
            {t('portfolio.section_my_created_farms_item_edit_farm_button')}
          </Button>
          <Button variant="ghost" width="100%" size={'sm'} onClick={onClose}>
            {t('button.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
