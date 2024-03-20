import { shrinkToValue } from '@/utils/shrinkToValue'
import { Box } from '@chakra-ui/react'
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { listContext } from './List'
import VirtualBox from './VirtualBox'

type ListItemStatus = {
  isIntersecting: boolean
}

export default function ListItem({ children }: { children?: ReactNode | ((status: ListItemStatus) => ReactNode) }) {
  const itemRef = useRef<HTMLElement>()

  const [isIntersecting, setIsIntersecting] = useState(true)
  const { observeFn } = useContext(listContext) ?? {}

  const status = useMemo(
    () => ({
      isIntersecting
    }),
    [isIntersecting]
  )

  useEffect(() => {
    if (!itemRef.current) return
    observeFn?.(itemRef.current, ({ entry: { isIntersecting } }) => {
      setIsIntersecting(isIntersecting)
    })
  }, [itemRef])

  return (
    <VirtualBox show={isIntersecting} ref={itemRef} w="full" flexShrink={0}>
      {(detectRef) => (
        <Box w="full" display={'flow-root'} className="ListItem" ref={detectRef}>
          {shrinkToValue(children, [status])}
        </Box>
      )}
    </VirtualBox>
  )
}
