import { useRecordedLayoutEffect } from '@/hooks/useRecordedEffect'
import { Box } from '@chakra-ui/react'
import { ReactNode, useRef } from 'react'

export function VisualSlider(props: {
  /** change this will cause view transition */
  contentIndex: number
  direction?: 'horizontal' | 'vertical'
  children?: ReactNode
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const prevBoxRef = useRef<HTMLDivElement>(null)
  const nextBoxRef = useRef<HTMLDivElement>(null)
  const currBoxRef = useRef<HTMLDivElement>(null)
  const transitionCSS = '.3s ease-out'

  const isInit = useRef(true)
  useRecordedLayoutEffect(
    ([prevContentIndex]) => {
      if (!boxRef.current) return
      if (!currBoxRef.current) return

      const newClonedNode = currBoxRef.current.cloneNode(true)

      const justCurrent = prevContentIndex == null
      if (justCurrent) return

      // start transition
      const toNextIndex = prevContentIndex != null && prevContentIndex < props.contentIndex
      const toPrevIndex = prevContentIndex != null && prevContentIndex > props.contentIndex
      if (toNextIndex) {
        prevBoxRef.current?.appendChild(newClonedNode)
      }
      if (toPrevIndex) {
        nextBoxRef.current?.appendChild(newClonedNode)
      }
      boxRef.current.style.setProperty('transition', 'none')
      boxRef.current.style.setProperty('transform', `translateX(${toNextIndex ? '100%' : '-100%'})`)

      nextBoxRef.current?.style.removeProperty('transition')
      nextBoxRef.current?.style.setProperty('opacity', `100`)
      prevBoxRef.current?.style.removeProperty('transition')
      prevBoxRef.current?.style.setProperty('opacity', `100`)
      currBoxRef.current.style.removeProperty('transition')
      currBoxRef.current.style.setProperty('opacity', `0`)

      boxRef.current?.clientWidth // force render
      nextBoxRef.current?.clientWidth // force render
      prevBoxRef.current?.clientWidth // force render
      currBoxRef.current?.clientWidth // force render

      boxRef.current.style.setProperty('transition', transitionCSS)
      boxRef.current.style.setProperty('transform', 'translateX(0%)')
      nextBoxRef.current?.style.setProperty('transition', transitionCSS)
      nextBoxRef.current?.style.setProperty('opacity', `0`)
      prevBoxRef.current?.style.setProperty('transition', transitionCSS)
      prevBoxRef.current?.style.setProperty('opacity', `0`)
      currBoxRef.current.style.setProperty('transition', transitionCSS)
      currBoxRef.current.style.setProperty('opacity', `100`)

      const handleTransitionEnd = () => {
        boxRef.current?.style.removeProperty('transform')
        boxRef.current?.style.removeProperty('transition')
        prevBoxRef.current?.replaceChildren()
        nextBoxRef.current?.replaceChildren()
        boxRef.current?.removeEventListener('transitionend', handleTransitionEnd)
        boxRef.current?.removeEventListener('transitioncancel', handleTransitionEnd)
      }
      boxRef.current?.addEventListener('transitionend', handleTransitionEnd)
      boxRef.current?.addEventListener('transitioncancel', handleTransitionEnd)
    },
    [props.contentIndex]
  )

  return (
    <Box
      ref={boxRef}
      position={'relative'}
      flex={1}
      transform={'translateX(0%)'}
      display={'flex'}
      flexDirection={'column'}
      css={{ contain: 'size' }}
      style={{ transition: transitionCSS }}
    >
      {/* to hold prev node  */}
      <Box ref={prevBoxRef} position={'absolute'} inset={0} style={{ transform: 'translateX(-100%)', transition: 'inherit' }}></Box>

      {/* to hold current node  */}
      <Box
        ref={currBoxRef}
        flex={1}
        display={'flex'}
        flexDirection={'column'}
        style={{ transform: 'translateX(0%)', transition: 'inherit' }}
        css={{ contain: 'size' }}
      >
        {props.children}
      </Box>

      {/* to hold next node  */}
      <Box ref={nextBoxRef} position={'absolute'} inset={0} style={{ transform: 'translateX(100%)', transition: 'inherit' }}></Box>
    </Box>
  )
}
