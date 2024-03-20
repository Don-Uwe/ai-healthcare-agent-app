import { Box } from '@chakra-ui/react'
import React, { RefObject, startTransition, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface IntervalCircleHandler {
  /** percent */
  currentProgressPercent: number
  restart(): void
}
/** unit (ms) */
export default function IntervalCircle({
  run = true,
  initPercent = 0,
  componentRef,
  duration = 60 * 1000,
  strokeWidth = 3,
  updateDelay = 1000,
  svgWidth = 36,
  loop = true,
  trackStrokeColor = '#ffffff2e',
  trackStrokeOpacity,
  filledTrackStrokeColor = '#92e1ffd9',
  onEnd,
  onClick
}: {
  /** like animation run */
  run?: boolean
  /**
   * when this props change, restartCircle manually
   */
  componentRef?: RefObject<IntervalCircleHandler>
  initPercent?: number
  className?: string
  duration?: number
  strokeWidth?: string | number
  updateDelay?: number
  svgWidth?: number
  loop?: boolean
  trackStrokeColor?: string
  trackStrokeOpacity?: number
  filledTrackStrokeColor?: string
  onClick?: () => void
  onEnd?: () => void
} = {}) {
  const width = svgWidth
  const height = width
  const r = (0.85 * width) / 2
  const p = 2 * r * Math.PI
  const [progressPercent, setProgressPercent] = useState(initPercent) // percent
  const selfRef = useRef(null)

  useEffect(() => {
    const timeoutId = globalThis.setInterval(() => {
      if (run) setProgressPercent((old) => old + (1 / duration) * updateDelay)
    }, updateDelay)
    return () => globalThis.clearInterval(timeoutId)
  }, [duration, updateDelay, run])

  useEffect(() => {
    if (progressPercent !== 0 && (Math.round(progressPercent * 100) / 100) % 1 === 0) {
      startTransition(() => {
        onEnd?.()
      })
    }
  }, [onEnd, progressPercent])

  useImperativeHandle(
    componentRef,
    () =>
      ({
        currentProgressPercent: progressPercent % 1,
        restart() {
          setProgressPercent(0)
        }
      } as IntervalCircleHandler)
  )

  return (
    <Box cursor={onClick ? 'pointer' : 'default'} onClick={onClick}>
      <svg ref={selfRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <circle
          r={r}
          cx="50%"
          cy="50%"
          fill="transparent"
          style={{ strokeWidth, stroke: trackStrokeColor, strokeOpacity: trackStrokeOpacity }}
        />
        <circle
          id="bar"
          r={r}
          cx="50%"
          cy="50%"
          fill="transparent"
          strokeDasharray={p}
          strokeDashoffset={p - (loop ? progressPercent % 1 : Math.min(progressPercent, 1)) * p}
          style={{
            strokeWidth,
            stroke: filledTrackStrokeColor,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            strokeLinecap: 'round',
            transition: '200ms'
          }}
        />
      </svg>
    </Box>
  )
}
