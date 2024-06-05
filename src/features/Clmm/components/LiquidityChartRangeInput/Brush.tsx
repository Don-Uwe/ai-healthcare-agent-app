import { brushHandleAccentPath, brushHandlePath, OffScreenHandle } from './svg'
import { BrushBehavior, brushX, D3BrushEvent, ScaleLinear, select } from 'd3'
import usePrevious from '@/hooks/usePrevious'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { colors } from '@/theme/cssVariables'

const Handle = styled.path<{ color: string }>`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 3;
  stroke: ${({ color }) => color};
  fill: ${({ color }) => color};
`

const HandleAccent = styled.path`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 1.5;
  stroke: #8c6eef;
`

const LabelGroup = styled.g<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? '1' : '1')};
  transition: opacity 300ms;
`

const TooltipBackground = styled.rect`
  fill: ${colors.backgroundTransparent12};
`

const Tooltip = styled.text`
  text-anchor: middle;
  font-size: 12px;
  fill: ${colors.textSecondary};
`

// flips the handles draggers when close to the container edges
const FLIP_HANDLE_THRESHOLD_PX = 20

// margin to prevent tick snapping from putting the brush off screen
const BRUSH_EXTENT_MARGIN_PX = 2

/**
 * Returns true if every element in `a` maps to the
 * same pixel coordinate as elements in `b`
 */
const compare = (a: [number, number], b: [number, number], xScale: ScaleLinear<number, number>): boolean => {
  // normalize pixels to 1 decimals
  const aNorm = a.map((x) => (Number.isNaN(x) ? '0' : xScale(x).toFixed(1)))
  const bNorm = b.map((x) => (Number.isNaN(x) ? '0' : xScale(x).toFixed(1)))
  return aNorm.every((v, i) => v === bNorm[i])
}

export const Brush = ({
  id,
  xScale,
  interactive,
  brushLabelValue,
  brushExtent,
  onBrushDomainChange,
  innerWidth,
  innerHeight,
  westHandleColor,
  eastHandleColor
}: {
  id: string
  xScale: ScaleLinear<number, number>
  interactive: boolean
  brushLabelValue: (d: 'w' | 'e', x: number) => string
  brushExtent: [number, number]
  onBrushDomainChange: (extent: [number, number], mode: string | undefined) => void
  innerWidth: number
  innerHeight: number
  westHandleColor: string
  eastHandleColor: string
}) => {
  const brushRef = useRef<SVGGElement | null>(null)
  const brushBehavior = useRef<BrushBehavior<SVGGElement> | null>(null)
  const handleRef = useRef<boolean>(false)

  // only used to drag the handles on brush for performance
  const [localBrushExtent, setLocalBrushExtent] = useState<[number, number] | null>(brushExtent)
  const [showLabels, setShowLabels] = useState(false)
  const [hovering, setHovering] = useState(false)
  const previousBrushExtent = usePrevious(brushExtent)

  const brushed = useCallback(
    (event: D3BrushEvent<unknown>) => {
      const { type, selection, mode } = event
      handleRef.current = (mode === 'drag' || mode === 'handle') && type !== 'end'
      if (!selection) {
        // setLocalBrushExtent(null)
        return
      }

      const scaled = (selection as [number, number]).map(xScale.invert) as [number, number]
      setLocalBrushExtent(scaled)
      // avoid infinite render loop by checking for change
      if (type === 'end' && !compare(brushExtent, scaled, xScale)) {
        onBrushDomainChange(scaled, mode)
      }
    },
    [xScale, brushExtent, onBrushDomainChange]
  )

  // keep local and external brush extent in sync
  // i.e. snap to ticks on bruhs end
  useEffect(() => {
    if (handleRef.current) return
    setLocalBrushExtent(brushExtent)
  }, [brushExtent])

  // initialize the brush
  useEffect(() => {
    if (!brushRef.current || handleRef.current) return
    brushBehavior.current = brushX<SVGGElement>()
      .extent([
        [Math.max(0 + BRUSH_EXTENT_MARGIN_PX, xScale(0)), 0],
        [innerWidth - BRUSH_EXTENT_MARGIN_PX, innerHeight]
      ])
      .handleSize(30)
      .filter(() => interactive)
      .on('brush end', brushed)

    brushBehavior.current(select(brushRef.current))

    if (previousBrushExtent && compare(brushExtent, previousBrushExtent, xScale)) {
      select(brushRef.current)
        .transition()
        .call(brushBehavior.current.move as any, brushExtent.map(xScale))
    }

    // brush linear gradient
    select(brushRef.current)
      .selectAll('.selection')
      .attr('stroke', 'none')
      .attr('fill-opacity', '0.1')
      .attr('fill', `url(#${id}-gradient-selection)`)
      .attr('cursor', interactive ? 'move' : 'crosshair')

    !interactive && select(brushRef.current).selectAll('.handle').attr('cursor', 'crosshair')
  }, [brushExtent, brushed, id, innerHeight, innerWidth, interactive, previousBrushExtent, xScale])

  // respond to xScale changes only
  useEffect(() => {
    if (!brushRef.current || !brushBehavior.current || handleRef.current) return

    brushBehavior.current.move(select(brushRef.current) as any, brushExtent.map(xScale) as any)
  }, [brushExtent[0], brushExtent[1], xScale(0)])

  // show labels when local brush changes
  useEffect(() => {
    setShowLabels(true)
    const timeout = setTimeout(() => setShowLabels(false), 1500)
    return () => clearTimeout(timeout)
  }, [localBrushExtent])

  // variables to help render the SVGs
  const flipWestHandle = localBrushExtent && xScale(localBrushExtent[0]) > FLIP_HANDLE_THRESHOLD_PX
  const flipEastHandle = localBrushExtent && xScale(localBrushExtent[1]) > innerWidth - FLIP_HANDLE_THRESHOLD_PX

  const showWestArrow = interactive && localBrushExtent && (xScale(localBrushExtent[0]) < 0 || xScale(localBrushExtent[1]) < 0)
  const showEastArrow =
    interactive && localBrushExtent && (xScale(localBrushExtent[0]) > innerWidth || xScale(localBrushExtent[1]) > innerWidth)

  const westHandleInView = localBrushExtent && xScale(localBrushExtent[0]) >= 0 && xScale(localBrushExtent[0]) <= innerWidth
  const eastHandleInView = localBrushExtent && xScale(localBrushExtent[1]) >= 0 && xScale(localBrushExtent[1]) <= innerWidth

  return useMemo(
    () => (
      <>
        <defs>
          <linearGradient id={`${id}-gradient-selection`} x1="0%" y1="100%" x2="100%" y2="100%">
            <stop stopColor={westHandleColor} />
            <stop stopColor={eastHandleColor} offset="1" />
          </linearGradient>

          {/* clips at exactly the svg area */}
          <clipPath id={`${id}-brush-clip`}>
            <rect x="0" y="0" width={innerWidth} height={innerHeight} />
          </clipPath>
        </defs>

        {/* will host the d3 brush */}
        <g
          ref={brushRef}
          clipPath={`url(#${id}-brush-clip)`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        />

        {/* custom brush handles */}
        {localBrushExtent && (
          <>
            {/* west handle */}
            {interactive && westHandleInView ? (
              <g transform={`translate(${Math.max(0, xScale(localBrushExtent[0]))}, 0), scale(${flipWestHandle ? '-1' : '1'}, 1)`}>
                <g>
                  <Handle color={westHandleColor} d={brushHandlePath(innerHeight)} />
                  <HandleAccent cursor={interactive ? undefined : 'crosshair'} d={brushHandleAccentPath()} />
                </g>

                <LabelGroup transform={`translate(50,0), scale(${flipWestHandle ? '1' : '-1'}, 1)`} visible={showLabels || hovering}>
                  <TooltipBackground y="0" x="-25" height="25" width="50" rx="8" />
                  <Tooltip transform={`scale(-1, 1)`} y="12.5" dominantBaseline="middle">
                    {brushLabelValue('w', localBrushExtent[0])}
                  </Tooltip>
                </LabelGroup>
              </g>
            ) : null}
            {/* east handle */}
            {interactive && eastHandleInView ? (
              <g transform={`translate(${xScale(localBrushExtent[1])}, 0), scale(${flipEastHandle ? '-1' : '1'}, 1)`}>
                <g>
                  <Handle color={eastHandleColor} d={brushHandlePath(innerHeight)} />
                  <HandleAccent cursor={interactive ? undefined : 'crosshair'} d={brushHandleAccentPath()} />
                </g>

                <LabelGroup transform={`translate(50,0), scale(${flipEastHandle ? '-1' : '1'}, 1)`} visible={showLabels || hovering}>
                  <TooltipBackground y="0" x="-25" height="25" width="50" rx="8" />
                  <Tooltip y="12.5" dominantBaseline="middle">
                    {brushLabelValue('e', localBrushExtent[1])}
                  </Tooltip>
                </LabelGroup>
              </g>
            ) : null}
            {showWestArrow && <OffScreenHandle color={westHandleColor} />}
            {showEastArrow && (
              <g transform={`translate(${innerWidth}, 0) scale(-1, 1)`}>
                <OffScreenHandle color={eastHandleColor} />
              </g>
            )}
          </>
        )}
      </>
    ),
    [
      brushLabelValue,
      eastHandleColor,
      eastHandleInView,
      flipEastHandle,
      flipWestHandle,
      hovering,
      id,
      innerHeight,
      innerWidth,
      localBrushExtent,
      showEastArrow,
      showLabels,
      showWestArrow,
      westHandleColor,
      westHandleInView,
      xScale,
      interactive
    ]
  )
}
