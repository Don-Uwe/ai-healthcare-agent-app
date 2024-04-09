import { Box, Grid, GridItem, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency } from '@/utils/numberish/formatter'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { ColorType, IChartApi, ISeriesApi, createChart } from 'lightweight-charts'

import useFetchPoolKLine from '@/hooks/pool/useFetchPoolKLine'
import ExpandLeftTopIcon from '@/icons/misc/ExpandLeftTopIcon'

export function SwapKlinePanelMobileThumbnail({
  untilDate,
  baseToken,
  quoteToken
}: {
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
}) {
  const {
    data,
    currentPrice,
    change24H = 0,
    isEmptyResult
  } = useFetchPoolKLine({
    base: baseToken?.address,
    quote: quoteToken?.address,
    timeType: '15m',
    untilDate
  })
  const { t, i18n } = useTranslation()
  const currentLocale = i18n.language
  const chartCtrRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<{ chart?: IChartApi; line?: ISeriesApi<'Line'> }>({})
  const pair = baseToken && quoteToken ? `${baseToken?.address}-${quoteToken?.address}` : undefined
  useEffect(() => {
    if (!pair) return
    const chart = createChart(chartCtrRef.current!, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, fontFamily: 'Space Grotesk' },
      grid: {
        vertLines: {
          visible: false
        },
        horzLines: {
          visible: false
        }
      },
      crosshair: {
        horzLine: {
          visible: false
        },
        vertLine: {
          visible: false
        }
      },
      timeScale: {
        visible: false
      },
      rightPriceScale: {
        visible: false
      },
      leftPriceScale: {
        visible: false
      }
    })
    const lineSeries = chart.addLineSeries({
      priceLineVisible: false
    })
    chartRef.current.chart = chart
    chartRef.current.line = lineSeries
    return () => {
      chart.remove()
      chartRef.current = {}
    }
  }, [pair])

  useEffect(() => {
    if (!chartRef.current.chart || !data.length) return
    chartRef.current.line?.setData(data)
  }, [data])

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
              {currentPrice !== undefined ? formatCurrency(currentPrice, { locale: currentLocale, maximumDecimalTrailingZeroes: 5 }) : '--'}
            </Text>
            <Text fontSize={['xs', 'sm']} color={change24H > 0 ? 'colors.teal' : change24H < 0 ? '#ff4ea3' : '#888888'}>
              {formatCurrency(toPercentString(change24H, { alwaysSigned: true }), { locale: currentLocale, raw: true })}
            </Text>
          </HStack>
        </GridItem>
        <GridItem gridArea="chart" position="relative" height="100%">
          <Box ref={chartCtrRef} style={{ opacity: isEmptyResult ? 0 : 1, width: '100%', height: '100%', contain: 'size' }}></Box>
        </GridItem>
      </Grid>
      <HStack justify="center">
        <Text fontWeight="bold" fontSize="12px" color={colors.textSecondary}>
          {t('swap.show_chart')}
        </Text>
        <ExpandLeftTopIcon />
      </HStack>
    </>
  )
}
