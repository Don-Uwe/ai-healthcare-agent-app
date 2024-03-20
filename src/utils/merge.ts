import { AnyFn, AnyObj } from '@/types/tools'
import { isArray, isExist, isFunction, isObject, isUndefined } from './judges/judgeType'

/**
 * @example
 * _mergeObjects([{a: 3, b: 2, c: undefined}, {a: 1, d: undefined}]) // {a: 1, b: 2}
 * _mergeObjects([{a: 3, b: 2}, {a: 1, b: 3}], (key, v1, v2) => (key === 'a') ? [v1, v2] : v2) // {a: [3,1], b: 3}
 */
export function _shallowMergeObjects<T extends AnyObj>(
  objs: T[],
  transformer: (key: string, valueA: unknown, valueB: unknown) => unknown
): T {
  if (objs.length === 0) return {} as T
  if (objs.length === 1) return objs[0]

  const resultObj: any = { ...objs[0] }
  for (const obj of objs.slice(1)) {
    if (!isObject(obj)) continue
    for (const [key, valueB] of Object.entries(obj)) {
      const valueA = resultObj[key]
      if (isUndefined(valueA) && isUndefined(valueB)) continue
      const resultValue = transformer(key, valueA, valueB)
      if (isExist(resultValue)) resultObj[key] = resultValue
    }
  }
  return resultObj
}

/**
 * @todo it's type intelligense is not very smart for parameters
 * @example
 * const add = (a: number, b: number) => a + b
 * const multi = (a: number) => 3 + a
 * const c = mergeFunction(add, multi) // (a: number, b: number) => {add(a, b); multi(a, b)}
 */
export function mergeFunction<T extends AnyFn>(...fns: [T]): (...params: Parameters<T>) => void
export function mergeFunction<T extends AnyFn, U extends AnyFn | undefined>(...fns: [T, U]): (...params: Parameters<T>) => void
export function mergeFunction<T extends AnyFn, U extends AnyFn | undefined, W extends AnyFn | undefined>(
  ...fns: [T, U, W]
): (...params: Parameters<T>) => void
export function mergeFunction<T extends AnyFn, U extends AnyFn | undefined, W extends AnyFn | undefined, K extends AnyFn | undefined>(
  ...fns: [T, U, W, K]
): (...params: Parameters<T>) => void
export function mergeFunction<
  T extends AnyFn,
  U extends AnyFn | undefined,
  W extends AnyFn | undefined,
  K extends AnyFn | undefined,
  V extends AnyFn | undefined
>(...fns: [T, U, W, K, V]): (...params: Parameters<T>) => void
export function mergeFunction<T extends AnyFn>(...fns: T[]): (...params: Parameters<T>) => void {
  return (...params) => {
    fns.forEach((fn) => fn?.(...params))
  }
}

export function mergeObject<T>(...objs: [T, ...any[]]): T {
  return _shallowMergeObjects(objs, (propertyName, v1, v2) => {
    if (isArray(v1) && isArray(v2)) return [...v1, ...v2]
    if (isObject(v1) && isObject(v2)) return mergeObject(v1, v2)
    if (isFunction(v1) && isFunction(v2)) return mergeFunction(v1, v2)
    return v2 == null ? v1 : v2
  })
}
