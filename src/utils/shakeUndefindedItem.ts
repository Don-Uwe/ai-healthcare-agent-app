export function shakeUndefindedItem<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter((item) => item != null) as NonNullable<T>[]
}
