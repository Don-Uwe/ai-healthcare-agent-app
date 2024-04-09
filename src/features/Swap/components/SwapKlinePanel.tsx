import Tabs from '@/components/Tabs'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { Grid, GridItem, HStack, Text, Box } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useState } from 'react'
import CandleChart from './CandleChart'
import dayjs from 'dayjs'
import SwapIcon from '@/icons/misc/SwapIcon'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/numberish/formatter'

export function SwapKlinePanel({
  baseToken,
  quoteToken,
  timeType,
  untilDate,
  onDirectionToggle,
  onTimeTypeChange
}: {
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  const [price, setPrice] = useState<
    | {
        current: number
        change: number
      }
    | undefined
  >()

  const { i18n } = useTranslation()
  const currentLocale = i18n.language

  return (
    <>
      <Grid
        gridTemplate={`
        "name   tabs " auto
        "chartwrap chartwrap" 1fr / 1fr auto
      `}
        alignItems="center"
        height={'100%'}
      >
        <GridItem gridArea="name" marginLeft="4px" marginBottom="12px">
          <HStack spacing={2}>
            <TokenAvatarPair token1={baseToken} token2={quoteToken} />
            <HStack>
              <Text fontSize="20px" fontWeight="500">
                {baseToken?.symbol} / {quoteToken?.symbol}
              </Text>
              <Box
                cursor="pointer"
                onClick={() => {
                  onDirectionToggle?.()
                }}
              >
                <SwapIcon />
              </Box>
              <Text fontSize="sm" color={colors.textTertiary}>
                {dayjs().utc().format('YY/MM/DD HH:MM')}
              </Text>
            </HStack>
          </HStack>
        </GridItem>
        <GridItem gridArea="tabs" marginRight="8px" marginBottom="12px">
          <Tabs
            items={['15m', '1H', '4H', '1D', '1W']}
            variant="squarePanel"
            onChange={(t: TimeType) => {
              onTimeTypeChange?.(t)
            }}
            tabItemSX={{ minWidth: '3.75em' }}
            style={{ marginLeft: 'auto' }}
          />
        </GridItem>
        <GridItem area={'chartwrap'} height="100%">
          <Grid
            gridTemplate={`
            "price  price" auto
            "chart  chart" 1fr / 1fr auto
            `}
            alignItems="center"
            cursor="pointer"
            paddingLeft="16px"
            height="100%"
            bg={colors.backgroundDark}
            borderRadius="8px"
          >
            <GridItem gridArea="price" paddingTop="8px">
              <HStack spacing={2} alignItems="baseline">
                <Text fontSize="28px" fontWeight={700} color={colors.textPrimary}>
                  {price ? formatCurrency(price.current, { locale: currentLocale, maximumDecimalTrailingZeroes: 5 }) : price}
                </Text>
                {price?.change && (
                  <Text
                    fontSize="sm"
                    color={
                      price?.change > 0 ? colors.priceFloatingUp : price?.change < 0 ? colors.priceFloatingDown : colors.priceFloatingFlat
                    }
                  >
                    {formatCurrency(toPercentString(price?.change, { alwaysSigned: true }), { locale: currentLocale, raw: true })}
                  </Text>
                )}
              </HStack>
            </GridItem>
            <CandleChart onPriceChange={setPrice} baseMint={baseToken} quoteMint={quoteToken} timeType={timeType} untilDate={untilDate} />
          </Grid>
        </GridItem>
      </Grid>
    </>
  )
}
