import { Grid, GridItem, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency } from '@/utils/numberish/formatter'

import useFetchPoolKLine from '@/hooks/pool/useFetchPoolKLine'

export function SwapKlinePanelMobileThumbnail({
  untilDate,
  baseToken,
  quoteToken
}: {
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
}) {
  const { currentPrice, change24H = 0 } = useFetchPoolKLine({
    base: baseToken?.address,
    quote: quoteToken?.address,
    timeType: '15m',
    untilDate
  })

  return (
    <>
      <Grid
        gridTemplate={`
          "name   chart" auto
          "price  chart" auto
          ".      .    " 1fr / 1fr 1fr
        `}
        columnGap={4}
        alignItems="center"
        cursor="pointer"
        height={'100%'}
        px={2}
      >
        <GridItem gridArea="name">
          <HStack spacing={2}>
            <TokenAvatarPair size="xs" token1={baseToken} token2={quoteToken} />
            <HStack color={colors.textSecondary}>
              <Text>
                {baseToken?.symbol} / {quoteToken?.symbol}
              </Text>
            </HStack>
          </HStack>
        </GridItem>

        <GridItem gridArea="price">
          <HStack spacing={2}>
            <Text fontSize={['md', 'xl']} fontWeight={500} color={colors.textPrimary}>
              {currentPrice !== undefined ? formatCurrency(currentPrice, { symbol: '$', maximumDecimalTrailingZeroes: 5 }) : '--'}
            </Text>
            <Text fontSize={['xs', 'sm']} color={change24H > 0 ? 'colors.teal' : change24H < 0 ? '#ff4ea3' : '#888888'}>
              {toPercentString(change24H, { alwaysSigned: true })}
            </Text>
          </HStack>
        </GridItem>
      </Grid>
    </>
  )
}
