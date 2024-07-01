import { area, curveStepAfter, curveStepBefore, ScaleLinear } from 'd3'
import React, { useMemo } from 'react'
import styled from '@emotion/styled'

import { ChartEntry } from './types'

const Path = styled.path<{ opacity: string | undefined; fill: string | undefined }>`
  opacity: ${({ opacity }) => opacity || 0.9};
  stroke: ${({ fill }) => fill || '#2B6AFF'};
  fill: ${({ fill }) => fill || '#2B6AFF'};
`

export const Area = ({
  series,
  xScale,
  yScale,
  xValue,
  yValue,
  fill,
  opacity,
  curveAfter = true
}: {
  series: ChartEntry[]
  xScale: ScaleLinear<number, number>
  yScale: ScaleLinear<number, number>
  xValue: (d: ChartEntry) => number
  yValue: (d: ChartEntry) => number
  fill?: string | undefined
  opacity?: string
  curveAfter?: boolean
}) =>
  useMemo(() => {
    const rangeSeries = series.filter((d) => {
      const value = xScale(xValue(d))
      return value > 0 && value <= window.innerWidth
    })

    return (
      <Path
        opacity={opacity}
        fill={fill}
        d={
          area()
            .curve(curveAfter ? curveStepAfter : curveStepBefore)
            .x((d: unknown) => xScale(xValue(d as ChartEntry)))
            .y1((d: unknown) => yScale(yValue(d as ChartEntry)))
            .y0(yScale(0))((rangeSeries.length < 2 ? series : rangeSeries) as Iterable<[number, number]>) ?? undefined
        }
      />
    )
  }, [fill, series, xScale, xValue, yScale, yValue, curveAfter])
