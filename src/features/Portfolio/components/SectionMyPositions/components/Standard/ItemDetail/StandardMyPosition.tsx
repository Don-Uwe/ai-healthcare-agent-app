import { Flex, Text } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { useTranslation } from 'react-i18next'

type MyPositionProps = {
  positionUsd: number | string
  center?: boolean
}

export default function StandardMyPosition({ positionUsd, center }: MyPositionProps) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" justify={'space-between'} py={1}>
      <Text textAlign={center ? 'center' : undefined} fontSize="sm" color={colors.textSecondary} mb={[2, '18px']}>
        {t('liquidity.my_position')}
      </Text>
      <Text textAlign={center ? 'center' : undefined} fontSize="lg" color={colors.textPrimary} fontWeight="medium">
        {toUsdVolume(positionUsd, { useShorterExpression: true })}
      </Text>
    </Flex>
  )
}
