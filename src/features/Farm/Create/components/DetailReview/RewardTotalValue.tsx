import { HStack, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'

export function RewardTotalValue(props: { total: number | string }) {
  return (
    <HStack mt={4} spacing={4} bg={colors.backgroundLight} rounded={'md'} py={4} px={[3, 10]} justify={'end'}>
      <Text fontSize={'sm'} fontWeight={500} color={colors.textSecondary}>
        Total value
      </Text>
      <Text fontSize={'md'} fontWeight={500}>
        {toUsdVolume(props.total)}
      </Text>
    </HStack>
  )
}
