import { useEffect, useRef, useState } from 'react'
import { useEvent } from './useEvent'

type Signal<T> = [state: T, setState: (value: T | ((prev: T) => T)) => void, get: () => T]

/**
 * create state that can used both as uncontrolled component and controlled component
 */
export function useSyncSignal<T>(options: { default(): T; outsideValue: T | undefined; onChange?: (value: T) => void }): Signal<T>
export function useSyncSignal<T>(options: { default?(): T; outsideValue: T; onChange?: (value: T) => void }): Signal<T>
export function useSyncSignal<T>(options: {
  default?(): T
  outsideValue: T | undefined
  onChange?: (value: T | undefined) => void
}): Signal<T> {
  const [state, setState] = useState('defaultValue' in options ? options.default?.() ?? options.outsideValue : options.outsideValue)
  const ref = useRef(state)
  // invoke `outsideValue`
  useEffect(() => {
    setState((prev) => options.outsideValue ?? prev)
  }, [options.outsideValue])

  // invoke `onChange`
  useEffect(() => {
    ref.current = state
    if (state === options.outsideValue) return
    options.onChange?.(state)
  }, [state])

  const getValue = useEvent(() => ref.current)

  // @ts-expect-error no need to check
  return [state, setState, getValue]
}
