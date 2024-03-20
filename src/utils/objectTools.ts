/**
 * @example
 * objectMap({ a: 1, b: 2 }, ([k, v]) => [k + 'c', v * 2]) // { ac: 2, bc: 4 }
 */
export function objectMapEntry<T, E extends [string, any]>(
  target: T | undefined,
  mapper: (entry: [key: keyof T, value: T[keyof T]]) => E
): { [P in keyof E[0]]: E[1] } {
  // @ts-expect-error type infer report error. but never mind
  return Object.fromEntries(Object.entries(target ?? {}).map(([key, value]) => mapper([key, value])))
}

/**
 * @param target target object
 * @param mapper (value)
 * @example
 * objectMap({ a: 1, b: 2 }, (v) => v * 2) // { a: 2, b: 4 }
 */
export function objectMap<T, V>(target: T | undefined, callbackFn: (value: T[keyof T], key: keyof T) => V): Record<keyof T, V> {
  //@ts-expect-error why type error?
  return objectMapEntry(target, ([key, value]) => [key, callbackFn(value, key)])
}

export function shakeObjectUndefinedItems<T extends object>(obj: T): { [K in keyof T]: NonNullable<T[K]> } {
  return objectFilter(obj, (value) => value !== undefined) as any
}

export function objectFilter<T, K extends keyof any>(
  obj: Record<K, T> | undefined,
  callbackFn: (value: T, key: K) => boolean
): Record<K, T> {
  //@ts-expect-error why type error?
  return Object.fromEntries(Object.entries(obj ?? {}).filter(([key, value]) => callbackFn(value, key)))
}
