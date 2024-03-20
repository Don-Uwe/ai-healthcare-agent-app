import { Flex, FlexProps, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { RewardInfo } from './FarmItem'
import { useTranslation } from 'react-i18next'

type PeriodProps = FlexProps & {
  rewardsInfo: RewardInfo[]
}

export default function Period({ rewardsInfo, ...rest }: PeriodProps) {
  const { t } = useTranslation()
  return (
    <Flex color={colors.textPrimary} direction="column" justify={'flex-start'} align={'flex-start'} gap={1} {...rest}>
      <Text fontSize="sm" color={colors.textTertiary}>
        {t('create_farm.period')}
      </Text>
      <Flex direction="column" fontSize="sm" color={colors.textPrimary} gap="6px">
        {rewardsInfo.length
          ? rewardsInfo.map((reward) => (
              <Flex key={reward.mint.address} justify="flex-start" align="center">
                <Flex minW="190px" fontSize="sm" fontWeight="medium" color={colors.textPrimary}>
                  {reward.periodString}
                </Flex>
                <Text fontSize="sm" color={colors.textSecondary}>
                  {reward.periodDays}
                </Text>
              </Flex>
            ))
          : '--'}
      </Flex>
    </Flex>
  )
}
