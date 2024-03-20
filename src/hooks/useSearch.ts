import { isString } from '@/utils/judges/judgeType'
import { searchItems, SearchOptions } from '@/utils/searchItems'
import { useMemo } from 'react'

/**
 * it will apply search text , every search inputs in App will apply this hook
 * it's a wrapper hook version of {@link searchItems}
 */
export function useSearch<T>(items: T[], options: string | SearchOptions<T>): T[] {
  const searched = useMemo(() => searchItems(items, isString(options) ? { searchText: options } : options), [options, items])
  return searched
}
