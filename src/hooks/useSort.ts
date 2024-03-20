import { useState, useCallback } from 'react'

interface Prop {
  defaultKey?: string
  defaultOrder?: 0 | 1
  formatPropFunc?: (prop: any) => number
}

export default function useSort({ defaultKey, defaultOrder, formatPropFunc }: Prop) {
  const [sortKey, setSortKey] = useState<string>(defaultKey || '')
  const [order, setOrder] = useState<number>(defaultOrder ?? 1) // 0 for ascending, 1 for descending

  const sortFn = useCallback(
    (list: any[]) =>
      list?.sort((a: any, b: any) => {
        const propA = formatPropFunc?.(a[sortKey]) ?? a[sortKey]
        const propB = formatPropFunc?.(b[sortKey]) ?? b[sortKey]
        if (typeof propA !== 'number' || typeof propB !== 'number') return Number.MIN_SAFE_INTEGER
        return (propA - propB) * Math.pow(-1, order)
      }),
    [sortKey, order, formatPropFunc]
  )

  const onChangeSortData = useCallback(
    (key: string) => {
      if (key === sortKey) {
        setOrder((order) => (order ? 0 : 1))
        return
      }
      setSortKey(key)
      setOrder(1)
    },
    [sortKey]
  )

  return {
    order,
    sortKey,
    onChangeSortData,
    sortFn
  }
}
