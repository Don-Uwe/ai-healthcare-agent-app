import useCallbackRef from '@/hooks/useCallbackRef'
import { useEvent } from '@/hooks/useEvent'
import useResizeObserver from '@/hooks/useResizeObserver'
import { Box, BoxProps, forwardRef } from '@chakra-ui/react'
import React, { RefObject, useState } from 'react'

interface VirtualBoxProps {
  observeWidth?: boolean
  observeHeight?: boolean
  show: boolean
  children?: (detectRef?: RefObject<any>) => React.ReactNode
}

/**
 * destory children if not show, but it will remain child's size by a `<div>` element
 */
export default forwardRef(function VirtualBox(
  {
    observeHeight = true, // stable prop
    observeWidth = false, // stable prop
    show = true,
    children,
    ...boxProps
  }: VirtualBoxProps & Omit<BoxProps, keyof VirtualBoxProps>,
  domRef
) {
  const [innerHeight, setInnerHeight] = useState<number>()
  const [innerWidth, setInnerWidth] = useState<number>()

  let observerRef: React.MutableRefObject<HTMLElement> | undefined = undefined
  if (observeHeight || observeWidth) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const innerRef = useCallbackRef<HTMLElement>({
      onAttach(currentEl) {
        observe(currentEl)
      }
    })

    observerRef = innerRef

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { observe } = useResizeObserver(innerRef, ({ el }) => {
      detectSize(el)
    })

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const detectSize = useEvent((el: HTMLElement) => {
      if (!el) return
      if (!show) return
      setInnerHeight(el.clientHeight)
      setInnerWidth(el.clientWidth)
    })
  }

  return (
    <Box
      ref={domRef}
      style={{
        height: observeHeight ? innerHeight : undefined,
        width: observeWidth ? innerWidth : undefined
      }}
      {...boxProps}
    >
      {show && children?.(observerRef)}
    </Box>
  )
})
