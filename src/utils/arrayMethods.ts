export function shakeUndifindedItem<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter((item) => item != null) as NonNullable<T>[]
}
export function shakeFalsyItem<T>(arr: readonly T[]): NonNullable<T>[] {
  return arr.filter(Boolean) as NonNullable<T>[]
}
