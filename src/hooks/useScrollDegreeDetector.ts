import { RefObject, useEffect, useRef } from 'react'
import { useEvent } from './useEvent'

export type UseScrollDegreeDetectorOptions = {
  onReachBottom?: () => void
  reachBottomMargin?: number
}

export function useScrollDegreeDetector(ref: RefObject<HTMLElement | null | undefined>, options?: UseScrollDegreeDetectorOptions) {
  const isReachedBottom = useRef(false)

  const onScroll = useEvent(() => {
    if (!ref.current) return
    const { scrollHeight, scrollTop, clientHeight } = ref.current
    const isNearlyReachBottom = scrollTop + clientHeight + (options?.reachBottomMargin ?? 0) >= scrollHeight

    if (isNearlyReachBottom && !isReachedBottom.current) {
      options?.onReachBottom?.()
      isReachedBottom.current = true
    }

    if (!isNearlyReachBottom && isReachedBottom.current) {
      isReachedBottom.current = false
    }
  })

  useEffect(() => {
    onScroll()
    ref.current?.addEventListener('scroll', onScroll, { passive: true })
    return () => ref.current?.removeEventListener('scroll', onScroll)
  }, [ref, onScroll])
}
