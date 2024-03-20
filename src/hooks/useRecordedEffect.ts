import { areShallowEqual, areShallowShallowEqual } from '@/utils/judges/areEqual'
import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * similiar to React.useEffect, but can record dependence list
 *
 * if clean fn is promise<function>, it will just ignore it
 *
 * cost:
 * - 1 `React.useEffect()`
 * - 2 `React.useRef()`
 */
export function useRecordedEffect<T extends readonly any[]>(
  effectFn: (prevDependenceList: T | undefined[]) => ((...params: any) => any) | any,
  dependenceList: readonly [...T],
  options?: {
    /**useful when item of dependenceList is object */
    shallowShallow?: boolean
  }
) {
  const prevValue = useRef<T>([] as unknown as T)
  const cleanupFn = useRef<(() => void) | void>()
  const compareFunction = options?.shallowShallow ? areShallowShallowEqual : areShallowEqual
  useEffect(() => {
    if (prevValue.current.length && compareFunction(prevValue.current, dependenceList)) return cleanupFn.current
    const returnedFn = effectFn(prevValue.current)
    // @ts-expect-error force
    prevValue.current = dependenceList
    cleanupFn.current = returnedFn
    return typeof returnedFn === 'function' ? returnedFn : undefined
  }, dependenceList)
}
export function useRecordedLayoutEffect<T extends readonly any[]>(
  effectFn: (prevDependenceList: T | undefined[]) => ((...params: any) => any) | any,
  dependenceList: readonly [...T],
  options?: {
    /**useful when item of dependenceList is object */
    shallowShallow?: boolean
  }
) {
  const prevValue = useRef<T>([] as unknown as T)
  const cleanupFn = useRef<(() => void) | void>()
  const compareFunction = options?.shallowShallow ? areShallowShallowEqual : areShallowEqual
  useLayoutEffect(() => {
    if (prevValue.current.length && compareFunction(prevValue.current, dependenceList)) return cleanupFn.current
    const returnedFn = effectFn(prevValue.current)
    // @ts-expect-error force
    prevValue.current = dependenceList
    cleanupFn.current = returnedFn
    return typeof returnedFn === 'function' ? returnedFn : undefined
  }, dependenceList)
}
