type SortConfigItem<T, P> = {
  value: (item: T) => any | undefined
  compareFn?: (textA: any, textB: any, items: { itemA: any; itemB: any }) => number
  /**
   * @default 'decrease'
   */
  mode?: 'decrease' | 'increase'
}

export type SortOptions<T, P> = {
  sortRules?: SortConfigItem<T, P>[]
}

/**
 * pure js fn/
 * core of "sort" feature
 */
export function sortItems<T, P>(items: T[], options?: SortOptions<T, P>): T[] {
  if (!options) return items
  if (!options.sortRules) return items
  return [...items].sort((itemA, itemB) => {
    for (const { value, compareFn, mode } of options.sortRules!) {
      const compareTargetA = value(itemA)
      const compareTargetB = value(itemB)
      if (compareTargetA == null && compareTargetB == null) continue
      if (compareTargetA == null) return 1
      if (compareTargetB == null) return -1
      const orderN =
        compareFn?.(compareTargetA, compareTargetB, { itemA, itemB }) ??
        compareForSort(compareTargetA, compareTargetB) * (mode === 'increase' ? 1 : -1)
      if (orderN == 0) continue
      return orderN
    }
    return compareForSort(itemA, itemB)
  })
}

function compareForSort(a: unknown, b: unknown): number {
  // nullish first exclude
  if (isNullish(a) && !isNullish(b)) return -1
  if (isNullish(b) && !isNullish(a)) return 1
  if (isNullish(a) && isNullish(b)) return 0
  if (isNumber(a) && isNumber(b)) {
    return a - b
  } else if (isBigInt(a) && isBigInt(b)) {
    return Number(a - b)
  } else if (isBoolean(a) && isBoolean(b)) {
    return Number(a) - Number(b)
  } else if (isString(a) && isString(b)) {
    const numberA = Number(a) // if it's a normal string, `Number()` will return `NaN`
    const numberB = Number(b) // if it's a normal string, `Number()` will return `NaN`
    if (isNaN(numberB) || isNaN(numberA)) {
      // one of them has plain string
      return a.localeCompare(b)
    } else {
      // all number string
      return numberA - numberB
    }
  }
  return 0
}

function isNullish(value: any): value is undefined | null {
  return value == undefined && value == null
}
function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}
function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}
/**
 * @example
 * isBigInt(2n) //=> true
 * isBigInt(Bigint(3)) //=> true
 * isBigInt('3') //=> false
 */
function isBigInt(val: unknown): val is bigint {
  return typeof val === 'bigint'
}
function isString(val: unknown): val is string {
  return typeof val === 'string'
}
