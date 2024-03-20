export function listToMap<T, S extends string | number, V = T>(
  source: T[],
  getKey: (item: T, index: number) => S,
  getValue?: (item: T, index: number) => V
): Record<S, V> {
  // @ts-expect-error force
  return Object.fromEntries(source.map((item, idx) => [getKey(item, idx), getValue ? getValue(item, idx) : item]))
}
