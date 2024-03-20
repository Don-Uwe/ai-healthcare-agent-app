import useCallbackRef from '@/hooks/useCallbackRef'
import { useEvent } from '@/hooks/useEvent'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'
import { BoxProps } from '@chakra-ui/react'
import { ClassAttributes, useRef } from 'react'
import { onNodeChildrenChange } from '../../utils/dom/onNodeChildrenChange'

/**
 * provide props for ability of scroll collapsing
 */
export function useScrollTitleCollapse(): {
  containerProps: BoxProps & ClassAttributes<HTMLDivElement>
  titleContainerProps: BoxProps & ClassAttributes<HTMLDivElement>
  scrollBodyProps: { ref: (el: HTMLElement) => void }
} {
  // const hasCollapseHeight = useRef(false)
  const titleRef = useCallbackRef<HTMLDivElement>({
    onAttach(current) {
      attachHeightStyle()
      onWindowSizeChange(attachHeightStyle)
      onNodeChildrenChange(current, attachHeightStyle)
    }
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const titleContainerProps: BoxProps & ClassAttributes<HTMLDivElement> = {
    ref: titleRef,
    sx: { height: 'auto', '--st': '0px', overflow: 'hidden' }
  }
  const containerProps: BoxProps & ClassAttributes<HTMLDivElement> = {
    ref: containerRef
  }
  /** record for not invoke too fast, build-in 60FPS is good enough */
  const rAFtimer = useRef(0)
  const scrollBodyProps = {
    ref: (el: HTMLElement) => {
      if (!el) return
      const handleScroll = (e: Event) => {
        cancelAnimationFrame(rAFtimer.current)
        rAFtimer.current = requestAnimationFrame(() => {
          scrollHandler(el.scrollTop)
        })
      }
      el.addEventListener('scroll', handleScroll)
      return () => el.removeEventListener('scroll', handleScroll)
    }
  }

  const attachHeightStyle = () => {
    const titleContainer = titleRef.current
    if (!titleContainer) return
    titleContainer.style.setProperty('height', 'auto')
    const trueHeight = titleContainer.clientHeight
    titleContainer.style.setProperty('height', `max(calc(${trueHeight}px - var(--st, 0px)), 0px)`)
  }

  const scrollHandler = useEvent((scrollTopOffset: number) => {
    if (scrollTopOffset < 1000 /* Too big is useless, so don't check if it is over 1000px */) {
      titleRef.current?.style.setProperty('--st', `${scrollTopOffset}px`)
    }
  })

  return { containerProps, titleContainerProps, scrollBodyProps }
}
