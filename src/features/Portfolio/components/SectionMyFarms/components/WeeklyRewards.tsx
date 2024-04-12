import { Flex, FlexProps, Text } from '@chakra-ui/react'

import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { wSolToSolString } from '@/utils/token'
import { useTranslation } from 'react-i18next'
import { RewardInfo } from './FarmItem'

type WeeklyRewardsProps = FlexProps & {
  rewardsInfo: RewardInfo[]
}

export default function WeeklyRewards({ rewardsInfo, ...rest }: WeeklyRewardsProps) {
  const { t } = useTranslation()
  return (
    <Flex color={colors.textPrimary} direction="column" justify={'flex-start'} align={'flex-start'} gap={1} {...rest}>
      <Text fontSize="sm" color={colors.textTertiary}>
        {t('create_farm.weekly_rewards')}
      </Text>
      <Flex direction="column" fontSize="sm" color={colors.textPrimary} gap="6px">
        {rewardsInfo.length
          ? rewardsInfo.map((reward) => (
              <Flex key={reward.mint.address} justify={'flex-start'} align="center">
                <TokenAvatar size="xs" token={reward.mint} mr={2} />
                <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary} mr={2}>
                  {formatCurrency(reward.weekly, { decimalPlaces: reward.mint.decimals })}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color={colors.textTertiary}>
                  {wSolToSolString(reward.mint.symbol)}
                </Text>
              </Flex>
            ))
          : '--'}
      </Flex>
    </Flex>
  )
}
