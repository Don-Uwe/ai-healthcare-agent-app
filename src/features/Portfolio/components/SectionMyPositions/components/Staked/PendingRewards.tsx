import { Flex, HStack, Text } from '@chakra-ui/react'

import Button from '@/components/Button'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { useTranslation } from 'react-i18next'

type PendingRewardsProps = {
  pendingReward: string
  isLoading: boolean
  onHarvest: () => void
}

export default function PendingRewards({ pendingReward, isLoading, onHarvest }: PendingRewardsProps) {
  const { t } = useTranslation()
  return (
    <Flex flexBasis="300px" minH="72px" bg={colors.backgroundDark} rounded="lg" justify={'space-between'} py={3} px={4}>
      <Flex direction="column" justify={'space-between'}>
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('staking.pending_rewards')}
        </Text>
        <HStack fontSize="sm" color={colors.textSecondary} fontWeight="500" spacing={1}>
          <Text>{toUsdVolume(pendingReward, { decimals: 6, decimalMode: 'trim' })}</Text>
          <QuestionToolTip label={t('staking.pending_rewards_tooltip')} iconType="info" />
        </HStack>
      </Flex>
      <Flex justify={'flex-end'} align="center">
        <Button variant="outline" isDisabled={Number(pendingReward) <= 0} isLoading={isLoading} onClick={onHarvest}>
          {t('staking.pending_rewards_button')}
        </Button>
      </Flex>
    </Flex>
  )
}
