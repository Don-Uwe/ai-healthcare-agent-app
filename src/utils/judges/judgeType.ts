export const isString = (v: unknown): v is string => typeof v === 'string'

export const isArray = Array.isArray

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function isObject(val: unknown): val is Record<string | number, any> | Array<any> {
  return !(val === null) && typeof val === 'object'
}

export function isEmptyObject(obj: any): boolean {
  return (isArray(obj) && obj.length === 0) || (isObject(obj) && Object.keys(obj).length === 0)
}

export function isUndefined(val: unknown): val is undefined {
  return val === undefined
}

/**
 * @example
 * notNullish('') // true
 * notNullish(undefined) // false
 * notNullish([]) // true
 */
export function notNullish<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null
}
export function isNullish(value: any): value is undefined | null {
  return !notNullish(value)
}

export const isExist = notNullish

export const notExist = isNullish
