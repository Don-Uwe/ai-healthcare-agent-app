import { isExist } from '@/utils/judges/judgeType'
import { createRef, MutableRefObject, useRef } from 'react'

export type UseCallbackRefOptions<T> = {
  defaultValue?: T
  onAttach?: (current: T) => void
  onDetach?: () => void
  onChange?: (current: T, prev: T) => void
}

/**
 * @return proxied { current: xxx }
 */
export default function useCallbackRef<T = unknown>(options?: UseCallbackRefOptions<T>): MutableRefObject<T> {
  const originalRef = useRef<T>(options?.defaultValue ?? null)
  const proxied = useRef(
    new Proxy(originalRef, {
      set(target, p, value) {
        const prev = target.current as T
        if (p === 'current' && isExist(value)) {
          if (isExist(value)) options?.onAttach?.(value)
          if (!isExist(value)) options?.onDetach?.()
          options?.onChange?.(value, prev)
        }
        if (p === 'current' && !isExist(value)) {
          options?.onDetach?.()
        }
        return true
      }
    })
  )
  // @ts-expect-error  use proxied must typed not elegant
  return proxied.current
}

export function createCallbackRef<T = unknown>(callback: (current: T) => void) {
  const originalRef = createRef<T>()
  return new Proxy(originalRef, {
    set(target, p, value) {
      callback(value)
      return Reflect.set(target, p, value)
    }
  })
}
