import { useTranslation } from 'react-i18next'
import { Flex, Box, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables/colors'

interface Props {
  currentPrice: string
  currentPriceLabel: string
  timePrice: string
}

export default function ChartPriceLabel({ currentPrice, currentPriceLabel, timePrice }: Props) {
  const { t } = useTranslation()
  return (
    <Flex gap={[0, 2]} flexDirection={'column'} justifyContent="center">
      <Flex gap="2">
        <Box width="8px" height="2px" mt="8px" bg="#FFF" />
        <Flex flexDirection={['row', 'column']} gap={[2, 0]}>
          <Text fontSize="xs" fontWeight="500" color={colors.textSecondary}>
            {t('field.current_price')}
          </Text>
          <Text fontSize="xs" fontWeight="500">
            {currentPrice}{' '}
            <Text as="span" color={colors.textTertiary}>
              {currentPriceLabel}
            </Text>
          </Text>
        </Flex>
      </Flex>

      <Flex gap="2">
        <Box width="8px" height="2px" mt="8px" bg="#8C6EEF" />
        <Flex flexDirection={['row', 'column']} gap={[2, 0]}>
          <Text fontSize="xs" fontWeight="500" color={colors.textSecondary}>
            {t('clmm.time_price_range', { time: '24h' })}
          </Text>
          <Text fontSize="xs" fontWeight="500">
            [{timePrice}]
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
