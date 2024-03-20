import { ElementSingle, getSingleElement } from '@/utils/react/getElementsFromRef'
import { useState } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'
import useResizeObserver from './useResizeObserver'

/**
 * only itself(ref)
 *
 * this hooks build on assumption: resize of a child will resize his parent. so just observe it's parent node.
 *
 * @param ref
 * @param callback
 */
export default function useElementSizeRectDetector(ref: ElementSingle): { width: number | undefined; height: number | undefined } {
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [height, setHeight] = useState<number | undefined>(undefined)

  const updateRect = () => {
    const el = getSingleElement(ref)
    if (!el) return
    const rect = el.getBoundingClientRect()
    setWidth(rect.width)
    setHeight(rect.height)
  }

  useIsomorphicLayoutEffect(updateRect, [ref])
  useResizeObserver(ref, updateRect)
  return { width, height }
}
