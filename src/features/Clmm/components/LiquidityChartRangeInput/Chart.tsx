import { max, scaleLinear, ZoomTransform } from 'd3'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Area } from './Area'
import { AxisBottom } from './AxisBottom'
import { Brush } from './Brush'
import { Line } from './Line'
import { ChartEntry, LiquidityChartRangeInputProps } from './types'
import Zoom, { ZoomOverlay } from './Zoom'
import { FeeAmount } from './FeeAmount'

import { useEvent } from '@/hooks/useEvent'

export const xAccessor = (d: ChartEntry) => d.price0
export const yAccessor = (d: ChartEntry) => d.activeLiquidity

export function Chart({
  id = 'liquidityChartRangeInput',
  data: { series, current, poolId, priceMin, priceMax, baseIn = true },
  styles,
  dimensions: { width, height },
  margins,
  interactive = true,
  brushDomain,
  brushLabels,
  onBrushDomainChange,
  feeAmount,
  zoomLevels,
  autoZoom,
  zoomBlockStyle
}: LiquidityChartRangeInputProps) {
  const zoomRef = useRef<SVGRectElement | null>(null)
  const xScaleRef = useRef<[number, number]>([0, 0])
  const autoZoomRef = useRef<boolean>(true)
  const [zoomOverLayLoaded, setZoomOverLayLoaded] = useState(Date.now())
  const [zoom, setZoom] = useState<ZoomTransform | null>(null)

  const [innerHeight, innerWidth] = useMemo(
    () => [height - margins.top - margins.bottom, width - margins.left - margins.right],
    [width, height, margins]
  )

  /*
  function changeAndAutoZoom (val: [number, number]) {
    autoZoomRef.current = true
    onBrushDomainChange(val, 'handle')
  }
  */

  xScaleRef.current = [current * zoomLevels.initialMin, current * zoomLevels.initialMax]

  const handleResetZoom = useCallback(() => onBrushDomainChange(xScaleRef.current, 'reset'), [])

  const { xScale, yScale } = useMemo(() => {
    const scales = {
      xScale: scaleLinear()
        .domain(
          autoZoom
            ? [
                Math.min(xScaleRef.current[0], brushDomain?.[0] ?? Number.MAX_SAFE_INTEGER),
                Math.max(xScaleRef.current[1], brushDomain?.[1] ?? Number.MIN_SAFE_INTEGER)
              ]
            : xScaleRef.current
        )
        .range([0, innerWidth]),
      yScale: scaleLinear()
        .domain([0, max(series, yAccessor)] as number[])
        .range([innerHeight, 0])
    }

    if (zoom) {
      const newXscale = zoom.rescaleX(scales.xScale)
      // to do, zoom level should based on fee rate

      const zoomNum = feeAmount === FeeAmount.LOWEST ? 0.0005 : feeAmount === FeeAmount.LOW ? 0.01 : 0.1

      const positionDomain =
        autoZoomRef.current || !interactive
          ? [Math.max(brushDomain?.[0] || 0, 0) * (1 - zoomNum), Math.min(brushDomain?.[1] || 100, Number.MAX_SAFE_INTEGER) * (1 + zoomNum)]
          : [
              Math.max(brushDomain?.[0] || 0, priceMin || 0, 0) * 0.9,
              Math.min(brushDomain?.[1] || 100, priceMax || 100, Number.MAX_SAFE_INTEGER) * 1.1
            ]
      scales.xScale.domain(interactive && !autoZoomRef.current ? newXscale.domain() : positionDomain)
      autoZoomRef.current = false
    }

    return scales
  }, [innerWidth, series, innerHeight, zoom, zoomLevels.initialMin, autoZoom, brushDomain, interactive, feeAmount])

  useEffect(() => {
    // reset zoom as necessary
    setZoom(null)
  }, [zoomLevels])

  useEffect(() => {
    setZoomOverLayLoaded(Date.now())
  }, [poolId])

  useEffect(() => {
    if (!brushDomain) {
      onBrushDomainChange(xScale.domain() as [number, number], undefined)
    }
  }, [brushDomain, onBrushDomainChange, xScale])

  const onClickArrow = useEvent((side: 'left' | 'right') => {
    const scale = xScale.domain()
    const gap = (scale[1] - scale[0]) / 20
    onBrushDomainChange(side === 'left' ? [scale[0] + gap, brushDomain![1]] : [brushDomain![0], scale[1] - gap], 'handle')
  })

  return (
    <>
      <Zoom
        key={zoomOverLayLoaded}
        svg={zoomRef.current}
        xScale={xScale}
        setZoom={setZoom}
        feeAmount={feeAmount}
        width={innerWidth}
        height={
          // allow zooming inside the x-axis
          height
        }
        resetBrush={handleResetZoom}
        showResetButton
        zoomLevels={zoomLevels}
        interactive={interactive}
        style={zoomBlockStyle}
      />
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'hidden' }}>
        <defs>
          <clipPath id={`${id}-chart-clip`}>
            <rect x="0" y="0" width={innerWidth} height={height} />
          </clipPath>

          {brushDomain && (
            // mask to highlight selected area
            <mask id={`${id}-chart-area-mask`}>
              <rect
                fill="white"
                x={xScale(brushDomain[0])}
                y="0"
                width={xScale(brushDomain[1]) - xScale(brushDomain[0])}
                height={innerHeight}
              />
            </mask>
          )}
        </defs>

        <g transform={`translate(${margins.left},${margins.top})`}>
          <g clipPath={`url(#${id}-chart-clip)`}>
            <Area curveAfter={baseIn} series={series} xScale={xScale} yScale={yScale} xValue={xAccessor} yValue={yAccessor} />
            {interactive && brushDomain && (
              // duplicate area chart with mask for selected area
              <g mask={`url(#${id}-chart-area-mask)`}>
                <Area
                  curveAfter={baseIn}
                  series={series}
                  xScale={xScale}
                  yScale={yScale}
                  xValue={xAccessor}
                  yValue={yAccessor}
                  opacity={styles.area.opacity}
                  fill={styles.area.selection}
                />
              </g>
            )}
            {interactive && <AxisBottom xScale={xScale} innerHeight={innerHeight} />}
          </g>

          <ZoomOverlay cursor={interactive ? undefined : 'crosshair'} width={innerWidth} height={height} ref={zoomRef} />

          <Brush
            id={id}
            xScale={xScale}
            interactive={interactive}
            brushLabelValue={brushLabels}
            brushExtent={brushDomain ?? (xScale.domain() as [number, number])}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            onBrushDomainChange={onBrushDomainChange}
            westHandleColor={styles.brush.handle.west}
            eastHandleColor={styles.brush.handle.east}
            onClickArrow={onClickArrow}
          />
        </g>
        {/* current price line */}
        <Line value={current} y1={10} color="#FFF" xScale={xScale} innerHeight={innerHeight + 10} />

        {/* 24 price range line */}
        {isNaN(Number(priceMin)) ? null : (
          <Line value={priceMin as number} y1={10} color="#8C6EEF" xScale={xScale} innerHeight={innerHeight + 10} />
        )}
        {isNaN(Number(priceMax)) ? null : (
          <Line value={priceMax as number} y1={10} color="#8C6EEF" xScale={xScale} innerHeight={innerHeight + 10} />
        )}
      </svg>
    </>
  )
}
