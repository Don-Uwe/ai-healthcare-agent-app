import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { toVolume } from '@/utils/numberish/autoSuffixNumberish'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'

type TokenInfoProps = {
  base: {
    token: ApiV3Token | undefined
    amount: number | string
  }
  quote: {
    token: ApiV3Token | undefined
    amount: number | string
  }
}

export default function TokenPooledInfo({ base, quote }: TokenInfoProps) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" justify={'space-between'} bg={colors.backgroundDark} rounded="lg" py={3} px={4}>
      <Flex justify={'space-between'} align="center">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('amm.pooled_token', { token: base.token?.symbol })}
        </Text>
        <HStack>
          <Text fontSize="sm" color={colors.textSecondary} fontWeight="medium">
            {toVolume(new Decimal(base.amount).toFixed(2, Decimal.ROUND_FLOOR), { useShorterExpression: true })}
          </Text>
          <TokenAvatar token={base.token} size="xs" />
        </HStack>
      </Flex>
      <Flex justify={'space-between'} align="center">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('amm.pooled_token', { token: quote.token?.symbol })}
        </Text>
        <HStack>
          <Text fontSize="sm" color={colors.textSecondary} fontWeight="medium">
            {toVolume(new Decimal(quote.amount).toFixed(2, Decimal.ROUND_FLOOR), { useShorterExpression: true })}
          </Text>
          <TokenAvatar token={quote.token} size="xs" />
        </HStack>
      </Flex>
    </Flex>
  )
}
