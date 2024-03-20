import { ElementRefs, getElementsFromRef } from '@/utils/react/getElementsFromRef'
import { useEffect, useState } from 'react'

//#region ------------------- hook: useHover() -------------------

export interface UseHoverOptions {
  disable?: boolean
  enabled?: boolean
  startDelay?: number
  endDelay?: number
  /** a shortcut for startDelay */
  delay?: number
  onHoverStart?: (info: { ev: PointerEvent }) => void
  onHoverEnd?: (info: { ev: PointerEvent }) => void
  /** a shortcut for onHoverStart */
  onHover?: (info: { ev: PointerEvent }) => void
}

export function useHover(
  ref: ElementRefs,
  { disable, enabled = true, onHover, onHoverStart = onHover, onHoverEnd, delay, startDelay = delay, endDelay }: UseHoverOptions = {}
) {
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    if (disable) return
    if (!enabled) return
    let hoverDelayTimerId: number | NodeJS.Timeout | undefined
    const hoverStartHandler = (ev: PointerEvent) => {
      if (disable) return
      if (!enabled) return
      function core() {
        setIsHover(true)
        onHoverStart?.({ ev })
      }
      clearTimeout(hoverDelayTimerId)
      if (startDelay) {
        hoverDelayTimerId = setTimeout(() => {
          core()
        }, startDelay)
      } else {
        core()
      }
    }
    const hoverEndHandler = (ev: PointerEvent) => {
      if (disable) return
      if (!enabled) return
      function core() {
        setIsHover(false)
        onHoverEnd?.({ ev })
      }
      clearTimeout(hoverDelayTimerId)
      if (endDelay) {
        hoverDelayTimerId = setTimeout(() => {
          core()
        }, endDelay)
      } else {
        core()
      }
    }
    getElementsFromRef(ref).forEach((el) => {
      el.addEventListener('pointerenter', hoverStartHandler)
      el.addEventListener('pointerleave', hoverEndHandler)
      el.addEventListener('pointercancel', hoverEndHandler)
    })
    return () => {
      getElementsFromRef(ref).forEach((el) => {
        el.removeEventListener('pointerenter', hoverStartHandler)
        el.removeEventListener('pointerleave', hoverEndHandler)
        el.removeEventListener('pointercancel', hoverEndHandler)
      })
    }
  }, [disable, enabled, ref, startDelay, endDelay, onHoverStart, onHoverEnd])

  return isHover
}
