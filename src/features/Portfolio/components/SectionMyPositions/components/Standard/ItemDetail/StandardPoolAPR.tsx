import { Flex, HStack, Text } from '@chakra-ui/react'

import { QuestionToolTip } from '@/components/QuestionToolTip'
import { colors } from '@/theme/cssVariables'
import toApr from '@/utils/numberish/toApr'
import { useTranslation } from 'react-i18next'

type MyPositionProps = {
  positionAPR: number | string
  center?: boolean
}

export default function StandardPoolAPR({ positionAPR, center }: MyPositionProps) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" justify={'space-between'} py={1}>
      <Text textAlign={center ? 'center' : undefined} fontSize="sm" color={colors.textSecondary} mb={[2, '18px']}>
        {t('liquidity.APR')}
      </Text>
      <HStack>
        <Text fontSize="lg" color={colors.textPrimary} lineHeight={1} fontWeight="medium">
          {toApr({ val: positionAPR, multiply: false })}
        </Text>
        <QuestionToolTip
          iconProps={{
            width: 16,
            height: 16,
            fill: colors.textSecondary
          }}
          iconType="info"
          label={t('liquidity.APR_tooltip')}
        />
      </HStack>
    </Flex>
  )
}
