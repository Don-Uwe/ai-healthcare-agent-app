import { ScaleLinear } from 'd3'
import React, { useMemo } from 'react'
import styled from '@emotion/styled'

const StyledLine = styled.line<{ color?: string }>`
  stroke-width: 2;
  stroke-dasharray: 4;
  stroke: ${({ color }) => color || '#ecf5ff'};
  fill: none;
`

export const Line = ({
  value,
  xScale,
  innerHeight,
  y1 = 0,
  color
}: {
  value: number
  xScale: ScaleLinear<number, number>
  y1?: number
  color?: string
  innerHeight: number
}) =>
  useMemo(
    () => (
      <>
        <polygon
          fill={color}
          stroke={color}
          strokeWidth={1}
          points={`${xScale(value) - 5},-5 ${xScale(value) + 5},-5 ${xScale(value)},5`}
        />
        <StyledLine color={color} x1={xScale(value)} y1={y1} x2={xScale(value)} y2={innerHeight} />
      </>
    ),
    [value, xScale, innerHeight]
  )
