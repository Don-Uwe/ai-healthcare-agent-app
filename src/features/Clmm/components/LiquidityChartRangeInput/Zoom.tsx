import { Flex, SystemCSSProperties } from '@chakra-ui/react'
import { ScaleLinear, select, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3'
import React, { useEffect, useMemo, useRef } from 'react'
import { RefreshCcw, ZoomIn, ZoomOut } from 'react-feather'
import styled from '@emotion/styled'
import { FeeAmount } from './FeeAmount'
import { ZoomLevels } from './types'

export const ZoomOverlay = styled.rect<{ cursor?: string }>`
  fill: transparent;
  cursor: ${({ cursor }) => cursor || 'grab'};

  &:active {
    cursor: ${({ cursor }) => cursor || 'grabbing'};
  }
`

export const IconWrapper = styled.div`
  cursor: pointer;
  background: rgba(57, 208, 216, 0.1);
  border-radius: 50%;
  padding: 6px;
`

export default function Zoom({
  svg,
  xScale,
  setZoom,
  width,
  height,
  resetBrush,
  showResetButton,
  zoomLevels,
  interactive,
  feeAmount,
  style
}: {
  svg: SVGElement | null
  xScale: ScaleLinear<number, number>
  setZoom: (transform: ZoomTransform) => void
  width: number
  height: number
  resetBrush: () => void
  showResetButton: boolean
  zoomLevels: ZoomLevels
  interactive: boolean
  feeAmount?: FeeAmount
  style?: SystemCSSProperties
}) {
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>()

  const [zoomIn, zoomOut, zoomInitial, zoomReset] = useMemo(
    () => [
      () => {
        svg &&
          zoomBehavior.current &&
          select(svg as Element)
            .transition()
            .call(zoomBehavior.current.scaleBy, 2)
      },
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleBy, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5),
      () =>
        svg &&
        zoomBehavior.current &&
        select(svg as Element)
          .call(zoomBehavior.current.transform, zoomIdentity.translate(0, 0).scale(1))
          .transition()
          .call(zoomBehavior.current.scaleTo, 0.5)
    ],
    [svg]
  )

  useEffect(() => {
    if (!svg) return
    const multiplier = feeAmount === FeeAmount['LOWEST'] ? 10 : 1
    zoomBehavior.current = zoom()
      .scaleExtent([zoomLevels.min * (1 / multiplier), zoomLevels.max * multiplier])
      .extent([
        [0, 0],
        [width, height]
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) => setZoom(transform))

    if (interactive) select(svg as Element).call(zoomBehavior.current)
  }, [height, width, setZoom, svg, xScale, zoomBehavior, zoomLevels.max, zoomLevels.min, interactive, feeAmount])

  useEffect(() => {
    // reset zoom to initial on zoomLevel change
    zoomInitial()
  }, [zoomInitial, zoomLevels])

  if (!interactive) return null

  return (
    <Flex gap="3" justifyContent="flex-end" sx={style}>
      {showResetButton && (
        <IconWrapper
          onClick={() => {
            resetBrush()
            zoomReset()
          }}
        >
          <RefreshCcw color="#22D1F8" size={16} />
        </IconWrapper>
      )}
      <IconWrapper onClick={zoomIn}>
        <ZoomIn size={16} color="#22D1F8" />
      </IconWrapper>
      <IconWrapper onClick={zoomOut}>
        <ZoomOut size={16} color="#22D1F8" />
      </IconWrapper>
    </Flex>
  )
}
