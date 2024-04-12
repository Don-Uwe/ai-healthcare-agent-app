import { useTranslation } from 'react-i18next'
import { HStack, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

export function RewardTotalValue(props: { total: number | string }) {
  const { t } = useTranslation()
  return (
    <HStack mt={4} spacing={4} bg={colors.backgroundLight} rounded={'md'} py={4} px={[3, 10]} justify={'end'}>
      <Text fontSize={'sm'} fontWeight={500} color={colors.textSecondary}>
        {t('field.total_value')}
      </Text>
      <Text fontSize={'md'} fontWeight={500}>
        {formatCurrency(props.total, { symbol: '$', decimalPlaces: 2 })}
      </Text>
    </HStack>
  )
}
