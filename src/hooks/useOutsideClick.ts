import { ElementRefs, getElementsFromRef } from '@/utils/react/getElementsFromRef'
import { useOutsideClick as _useOutsideClick } from '@chakra-ui/react'
import { useEffect } from 'react'

/** like {@link _useOutsideClick} but can accept multi refs*/
export function useOutsideClick({
  enabled = true,
  ref,
  handler
}: {
  /**
   * Whether the hook is enabled
   */
  enabled?: boolean
  /**
   * The reference to a DOM element.
   */
  ref: ElementRefs
  /**
   * Function invoked when a click is triggered outside the referenced element.
   */
  handler?: (e: Event) => void
}) {
  useEffect(() => {
    if (!enabled) return
    const handleClickOutside = (ev: Event) => {
      const targetElements = getElementsFromRef(ref)
      if (!targetElements.length) return
      const path = ev.composedPath()
      if (targetElements.some((el) => el && path.includes(el))) return
      handler?.(ev)
    }
    window.document?.addEventListener('click', handleClickOutside, { capture: true })
    return () => {
      window.document?.removeEventListener('click', handleClickOutside, { capture: true })
    }
  }, [ref, enabled, handler])
}
