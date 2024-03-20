import { Box, Flex } from '@chakra-ui/react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'

import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'

type TokenPairProps = {
  base: TokenInfo | undefined
  quote: TokenInfo | undefined
  poolName: string
}

export default function TokenPair({ base, quote, poolName }: TokenPairProps) {
  return (
    <Flex flex={1}>
      <Flex direction="column" justify="center" align={'flex-start'} gap={2}>
        <TokenAvatarPair token1={base} token2={quote} pr={[2, 8]} />
        <Box color={colors.textPrimary} fontWeight="medium" fontSize="xl">
          {poolName}
        </Box>
      </Flex>
    </Flex>
  )
}
