import { UseDisclosureProps, useDisclosure as _useDisclosure } from '@chakra-ui/react'
import { useRef } from 'react'
import { useEvent } from './useEvent'

/** like {@link _useDisclosure} but onOpen/onClose can also accept delay  */
export function useDisclosure(props?: UseDisclosureProps) {
  const { isOpen, onOpen, onClose, ...restDisclosureControllers } = _useDisclosure(props)
  const delayActionTimoutId = useRef(0 as NodeJS.Timeout | number)
  const open = useEvent((options?: { delay?: number }) => {
    cancelDelay()
    if (options?.delay != null) {
      delayActionTimoutId.current = setTimeout(() => {
        onOpen()
      }, options.delay)
    } else {
      onOpen()
    }
  })
  const close = useEvent((options?: { delay?: number }) => {
    cancelDelay()
    if (options?.delay != null) {
      delayActionTimoutId.current = setTimeout(() => {
        onClose()
      }, options.delay)
    } else {
      onClose()
    }
  })
  const toggle = useEvent((options?: { delay?: number }) => {
    if (isOpen) {
      close(options)
    } else {
      open(options)
    }
  })
  const cancelDelay = useEvent(() => {
    clearTimeout(delayActionTimoutId.current)
  })
  return { ...restDisclosureControllers, isOpen, onOpen: open, onClose: close, onToggle: toggle, cancelDelay }
}
