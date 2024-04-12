import { Flex, Spacer, Text } from '@chakra-ui/react'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'

import { colors } from '@/theme/cssVariables'

type AprProps = {
  apr: string
}

export default function Apr({ apr }: AprProps) {
  return (
    <Flex flex={2} direction="column" justify={'space-between'} gap={[1, 2]}>
      <Text fontSize="sm" color={colors.textSecondary}>
        APR
      </Text>
      <Text fontSize="lg" color={colors.textPrimary} fontWeight="medium">
        {formatToRawLocaleStr(apr)}
      </Text>
      <Spacer />
    </Flex>
  )
}
