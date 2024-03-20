import { Text, VStack } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'

type TokenBriefFaceProps = {
  token: ApiV3Token | undefined
}

export default function TokenBriefFace({ token }: TokenBriefFaceProps) {
  return (
    <VStack flexDirection={['row', 'column']} alignItems={['center', 'start']} gap={2}>
      <TokenAvatar size={['sm', 'md']} token={token} />
      <Text color={colors.textPrimary} fontSize={['md', 'xl']} fontWeight="500">
        {token?.symbol}
      </Text>
    </VStack>
  )
}
