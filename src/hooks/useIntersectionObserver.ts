import { RefObject, useRef } from 'react'
import { useEvent } from '@/hooks/useEvent'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type InterSectionObserverCallback<Item extends HTMLElement> = (utils: { el: Item; entry: IntersectionObserverEntry }) => void

export type ObserveFn<Item extends HTMLElement> = (item: Item, callback: InterSectionObserverCallback<Item>) => { abort(): void }

export function useIntersectionObserver<Item extends HTMLElement>(input: {
  rootRef: RefObject<HTMLElement>
  options?: IntersectionObserverInit
}): {
  observe: ObserveFn<Item>
  stop(): void
} {
  const registedCallbacks = useRef(new WeakMap<Item, (utils: { el: Item; entry: IntersectionObserverEntry }) => void>())
  const intersectionObserverRef = useRef<IntersectionObserver>()
  useIsomorphicLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as Item
          const registedCallback = registedCallbacks.current.get(el)
          registedCallback?.({ el, entry })
        })
      },
      { ...input.options, root: input.rootRef.current, rootMargin: input.options?.rootMargin ?? '500px' }
    )
    intersectionObserverRef.current = observer
  }, [])

  // method
  const observe = useEvent((item: Item, callback: (utils: { el: Item; entry: IntersectionObserverEntry }) => void) => {
    intersectionObserverRef.current?.observe(item)
    registedCallbacks.current.set(item, callback)
    return {
      abort() {
        registedCallbacks.current.delete(item)
        intersectionObserverRef.current?.unobserve(item)
      }
    }
  })

  // method
  const stop = useEvent(() => {
    intersectionObserverRef.current?.disconnect()
  })

  return { observe, stop }
}
