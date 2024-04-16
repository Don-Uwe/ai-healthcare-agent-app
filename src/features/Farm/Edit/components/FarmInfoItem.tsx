import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import toApr from '@/utils/numberish/toApr'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { Box, Text, Tag, Flex } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

interface FarmInfoItemProps {
  name: string
  token1: ApiV3Token
  token2: ApiV3Token
  tvl: string | number
  apr: string | number
  feeRate?: number
}

export default function FarmInfoItem({ name, token1, token2, tvl, apr, feeRate }: FarmInfoItemProps) {
  return (
    <Box fontWeight={500} rounded="xl" bg={colors.backgroundLight} px={5} py={4}>
      <Flex alignItems="center" gap="2">
        <TokenAvatarPair token1={token1} token2={token2} />
        <Text fontSize={'2xl'} whiteSpace={'nowrap'}>
          {name}
        </Text>
        {feeRate ? (
          <Tag size="sm" variant="rounded">
            {feeRate * 100}%
          </Tag>
        ) : null}
      </Flex>
      <Flex mt="2">
        <Box flex="1">
          <Text fontSize={'xs'} fontWeight={500} color={colors.textTertiary}>
            TVL
          </Text>
          <Text>{formatCurrency(tvl, { symbol: '$', decimalPlaces: 2 })}</Text>
        </Box>
        <Box flex="1">
          <Text fontSize="xs" fontWeight={500} color={colors.textTertiary}>
            APR
          </Text>
          <Text>{formatToRawLocaleStr(toApr({ val: apr, multiply: false }))}</Text>
        </Box>
      </Flex>
    </Box>
  )
}
