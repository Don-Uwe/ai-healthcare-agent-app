import { isObject, isUndefined } from './judgeType'

export function areEqual(v1: any, v2: any) {
  return v1 === v2
}

/**
 * @example
 * areShallowEqual([1, 2], [1, 2]) // true
 * areShallowEqual({hello: 1}, {hello: 1}) // true
 */
export function areShallowEqual(v1: any, v2: any) {
  return isObject(v1) && isObject(v2)
    ? Object.keys(v1).length === Object.keys(v2).length &&
        Object.entries(v1).every(([key, value]) => areEqual(value, v2[key as keyof typeof v2]))
    : areEqual(v1, v2)
}

/**
 * @example
 * areShallowShallowEqual([1, [2]], [1, [2]]) // true
 * areShallowShallowEqual({hello: {hi: 233}}, {hello: {hi: 233}}) // true
 */
export function areShallowShallowEqual(v1: any, v2: any) {
  return isObject(v1) && isObject(v2)
    ? Object.keys(v1).length === Object.keys(v2).length &&
        Object.entries(v1).every(([key, value]) => areShallowEqual(value, v2[key as keyof typeof v2]))
    : areShallowEqual(v1, v2)
}

export function isStringInsensitivelyEqual(s1: string | undefined, s2: string | undefined) {
  if (isUndefined(s1) || isUndefined(s2)) return false
  return s1.toLowerCase() === s2.toLowerCase()
}

export function isStringInsensitivelyContain(s1: string | undefined, s2: string | undefined) {
  if (isUndefined(s1) || isUndefined(s2)) return false
  return s1.toLowerCase().includes(s2.toLowerCase())
}
