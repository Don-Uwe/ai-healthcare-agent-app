import ExclaimationTriangle from '@/icons/misc/ExclaimationTriangle'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { Badge, Box, Button, Flex, HStack, Text, Tooltip, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

type PendingRewardsProps = {
  pendingReward: number | string
  positionStatus?: string
  isLoading: boolean
  onHarvest: () => void
}

export default function PendingRewards({ pendingReward, positionStatus, isLoading, onHarvest }: PendingRewardsProps) {
  const { t } = useTranslation()
  const positionStandardPoolsStatusTags = {
    unstaked: t('amm.farm_unstaked'),
    ended: t('amm.farm_ended')
  }
  return (
    <Flex justify={'space-between'} bg={colors.backgroundDark} rounded="lg" py={2.5} px={4} gap={8}>
      <VStack align="flex-start" justifyContent={'space-between'}>
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('amm.pending_reward')}
        </Text>
        <HStack color={colors.textSecondary}>
          <Text fontSize="sm" fontWeight="medium">
            {toUsdVolume(pendingReward, { useShorterExpression: true })}
          </Text>
          <Tooltip label={t('amm.pending_reward_tooltip')}>
            <InfoCircleIcon />
          </Tooltip>
        </HStack>
      </VStack>

      <VStack justifyContent={'flex-end'}>
        {positionStatus && (
          <Tooltip
            isDisabled={positionStatus !== 'unstaked'}
            label={
              <Box>
                <Text fontSize="sm" color={colors.textSecondary}>
                  {t('amm.pending_alert')}
                </Text>
              </Box>
            }
          >
            <Badge variant="rounded" fontSize="xs" color={colors.semanticWarning}>
              <Box mr={1.5}>
                <ExclaimationTriangle width="12px" height="12px" />
              </Box>
              <Text whiteSpace={'break-spaces'} textAlign={'center'}>
                {positionStandardPoolsStatusTags[positionStatus as keyof typeof positionStandardPoolsStatusTags]}
              </Text>
            </Badge>
          </Tooltip>
        )}
        <Button
          isLoading={isLoading}
          isDisabled={new Decimal(pendingReward).isZero()}
          variant="outline"
          size="sm"
          px={5}
          py={0}
          lineHeight={0}
          height={'24px'}
          rounded={'8px'}
          onClick={onHarvest}
        >
          {t('amm.pending_reward_button')}
        </Button>
      </VStack>
    </Flex>
  )
}
