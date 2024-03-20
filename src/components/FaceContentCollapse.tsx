import { useEvent } from '@/hooks/useEvent'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import { Box } from '@chakra-ui/react'
import { ReactNode, useRef } from 'react'

/**
 * start from thumbnail, then expand to detail
 */
export default function FaceContentCollapse(props: {
  isViewOpen: boolean
  /** will disappear when open */
  thumbnail: ReactNode
  /** will show when open */
  detail: ReactNode
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const thumbnailRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const updateLayoutBoxHeight = useEvent(() => {
    if (boxRef.current) {
      const newHeight = props.isViewOpen
        ? `${detailRef.current?.getBoundingClientRect().height}px`
        : `${thumbnailRef.current?.getBoundingClientRect().height}px`
      boxRef.current.style.height = newHeight
    }
  })

  useIsomorphicLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(updateLayoutBoxHeight)
    if (thumbnailRef.current) {
      resizeObserver.observe(thumbnailRef.current)
    }
    if (detailRef.current) {
      resizeObserver.observe(detailRef.current)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <Box ref={boxRef} position="relative" transition="300ms">
      <Box
        position="absolute"
        transition="300ms"
        opacity={props.isViewOpen ? 0 : 1}
        pointerEvents={props.isViewOpen ? 'none' : undefined}
        top={0}
        left={0}
        right={0}
        ref={thumbnailRef}
      >
        {props.thumbnail}
      </Box>
      <Box
        position="absolute"
        transition="300ms"
        opacity={props.isViewOpen ? 1 : 0}
        zIndex={props.isViewOpen ? 1 : -1}
        pointerEvents={props.isViewOpen ? undefined : 'none'}
        top={0}
        left={0}
        right={0}
        ref={detailRef}
      >
        {props.detail}
      </Box>
    </Box>
  )
}
