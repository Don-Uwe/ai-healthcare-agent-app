import React, { CSSProperties, ReactNode, useCallback, useMemo, useRef } from 'react'
import { BarChart2, CloudOff, Inbox } from 'react-feather'
import { Text, SystemCSSProperties } from '@chakra-ui/react'
import styled from '@emotion/styled'

import Loader from '@/components/Loader'
import { Bound } from './Bound'
import { Chart } from './Chart'
import { FeeAmount } from './FeeAmount'
import { useDensityChartData } from './hooks'
import { ZoomLevels } from './types'

import { format } from 'd3'
import useElementSizeRectDetector from '@/hooks/useElementSizeRectDetector'
import { useTranslation } from 'react-i18next'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'

const theme = {
  brushHandle: '#22D1F8',
  selectedArea: '#2B6AFF',
  selectedAreaOutOfRange: '#FF4EA3',
  deprecated_text1: '#0D111C',
  deprecated_text4: '#98A1C0',
  deprecated_blue1: '#1B365F',
  deprecated_red1: '#FA2B39'
}

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`

const ZOOM_LEVELS: Record<number, ZoomLevels> = {
  [FeeAmount.LOWEST]: {
    initialMin: 0.99,
    initialMax: 1.01,
    min: 0.00001,
    max: 1.5
  },
  [FeeAmount.LOW]: {
    initialMin: 0.5,
    initialMax: 1.5,
    min: 0.00001,
    max: 20
  },
  [FeeAmount.MEDIUM]: {
    initialMin: 0.5,
    initialMax: 1.5,
    min: 0.00001,
    max: 20
  },
  [FeeAmount.HIGH]: {
    initialMin: 0.5,
    initialMax: 1.5,
    min: 0.00001,
    max: 20
  }
}

const ChartWrapper = styled.div`
  justify-content: center;
  align-content: center;
`

function InfoBox({ message, icon }: { message?: ReactNode; icon: ReactNode }) {
  return (
    <ColumnCenter style={{ height: '100%', justifyContent: 'center' }}>
      {icon}
      {message && (
        <Text padding={10} marginTop="20px" textAlign="center">
          {message}
        </Text>
      )}
    </ColumnCenter>
  )
}

export default function LiquidityChartRangeInput({
  poolId,
  feeAmount,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  timePriceMin,
  timePriceMax,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
  baseIn,
  autoZoom,
  outOfRange,
  containerStyle = {},
  zoomBlockStyle
}: {
  poolId: string
  feeAmount?: FeeAmount
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  price: number | undefined
  priceLower?: number | string
  priceUpper?: number | string
  timePriceMin?: number
  timePriceMax?: number
  onLeftRangeInput?: (typedValue: string) => void
  onRightRangeInput?: (typedValue: string) => void
  interactive: boolean
  baseIn: boolean
  autoZoom?: boolean
  outOfRange?: boolean
  containerStyle?: CSSProperties
  zoomBlockStyle?: SystemCSSProperties
}) {
  const { t } = useTranslation()
  const chartBoxRef = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSizeRectDetector(chartBoxRef)
  const { isLoading, error, formattedData } = useDensityChartData({ poolId, baseIn })

  const onBrushDomainChangeEnded = useCallback(
    (domain: [number, number], mode: string | undefined) => {
      let leftRangeValue = Number(domain[0])
      const rightRangeValue = Number(domain[1])

      if (leftRangeValue <= 0) {
        leftRangeValue = 1 / 10 ** 6
      }

      // batch(() => {
      // simulate user input for auto-formatting and other validations
      if ((mode === 'drag' || mode === 'handle' || mode === 'reset') && leftRangeValue > 0) {
        onLeftRangeInput?.(leftRangeValue.toFixed(20))
      }

      if ((mode === 'drag' || mode === 'handle' || mode === 'reset') && rightRangeValue > 0) {
        // todo: remove this check. Upper bound for large numbers
        // sometimes fails to parse to tick.
        if (rightRangeValue < 1e35) {
          onRightRangeInput?.(rightRangeValue.toFixed(20))
        }
      }
      // })
    },
    [onLeftRangeInput, onRightRangeInput]
  )

  interactive = interactive && Boolean(formattedData?.length)

  const brushDomain: [number, number] | undefined = useMemo(() => {
    return priceLower && priceUpper ? [parseFloat(Number(priceLower).toFixed(20)), parseFloat(Number(priceUpper).toFixed(20))] : undefined
  }, [priceLower, priceUpper])

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      if (!price) return ''

      if (d === 'w' && ticksAtLimit[baseIn ? Bound.LOWER : Bound.UPPER]) return '0'
      if (d === 'e' && ticksAtLimit[baseIn ? Bound.UPPER : Bound.LOWER]) return '∞'

      const percent = (x < price ? -1 : 1) * ((Math.max(x, price) - Math.min(x, price)) / price) * 100
      return price ? `${formatToRawLocaleStr(format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent))}%` : ''
    },
    [baseIn, price, ticksAtLimit]
  )
  // if (error) {
  //   sendEvent('exception', { description: error.toString(), fatal: false })
  // }

  const isUninitialized = !formattedData.length && !isLoading

  return (
    <AutoColumn gap="md" style={{ ...containerStyle, minHeight: '200px' }}>
      {isUninitialized ? (
        <InfoBox message={t('error.pool_liquidity_appear')} icon={<Inbox size={56} stroke={theme.deprecated_text1} />} />
      ) : isLoading ? (
        <InfoBox icon={<Loader size="40px" stroke={theme.deprecated_text4} />} />
      ) : error ? (
        <InfoBox message={t('error.liquidity_data_not_available')} icon={<CloudOff size={56} stroke={theme.deprecated_text4} />} />
      ) : !formattedData || formattedData.length === 0 || !price ? (
        <InfoBox message={t('error.no_liquidity_data')} icon={<BarChart2 size={56} stroke={theme.deprecated_text4} />} />
      ) : (
        <ChartWrapper ref={chartBoxRef}>
          <Chart
            data={{ series: formattedData, current: price, poolId, priceMin: timePriceMin, priceMax: timePriceMax, baseIn }}
            dimensions={{ width: width ?? 400, height: height ?? 200 }}
            margins={{ top: 10, right: 2, bottom: 30, left: 0 }}
            styles={{
              area: {
                selection: outOfRange ? theme.selectedAreaOutOfRange : theme.selectedArea,
                opacity: outOfRange ? '0.5' : '0.3'
              },
              brush: {
                handle: {
                  west: theme.brushHandle,
                  east: theme.brushHandle
                }
              }
            }}
            interactive={interactive}
            brushLabels={brushLabelValue}
            brushDomain={brushDomain}
            onBrushDomainChange={onBrushDomainChangeEnded}
            feeAmount={feeAmount}
            zoomLevels={ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM]}
            ticksAtLimit={ticksAtLimit}
            autoZoom={autoZoom}
            zoomBlockStyle={zoomBlockStyle}
          />
        </ChartWrapper>
      )}
    </AutoColumn>
  )
}
