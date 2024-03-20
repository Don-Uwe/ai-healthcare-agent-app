import { Flex, FlexProps, Text } from '@chakra-ui/react'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'

import { RewardInfo } from './FarmItem'
import { useTranslation } from 'react-i18next'
import { wSolToSolString } from '@/utils/token'

type UnemmittedProps = FlexProps & {
  rewardsInfo: RewardInfo[]
}

export default function Unemmitted({ rewardsInfo, ...rest }: UnemmittedProps) {
  const { t } = useTranslation()
  return (
    <Flex color={colors.textPrimary} direction="column" justify={'flex-start'} align={'flex-start'} gap={1} {...rest}>
      <Text fontSize="sm" color={colors.textTertiary}>
        {t('create_farm.unemmitted_rewards')}
      </Text>
      <Flex direction="column" fontSize="sm" color={colors.textPrimary} gap="6px">
        {rewardsInfo.length
          ? rewardsInfo.map((reward) => (
              <Flex key={reward.mint.address} justify={'flex-start'} align="center">
                <TokenAvatar size="xs" token={reward.mint} mr={2} />
                <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary} mr={2}>
                  {reward.unEmit}
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
