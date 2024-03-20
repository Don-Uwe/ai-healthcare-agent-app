import { useRecordedEffect } from '@/hooks/useRecordedEffect'
import { useScrollDegreeDetector } from '@/hooks/useScrollDegreeDetector'
import mergeRef from '@/utils/react/mergeRef'
import { FlexProps, Grid, forwardRef } from '@chakra-ui/react'
import { ReactNode, createContext, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ObserveFn, useIntersectionObserver } from '../hooks/useIntersectionObserver'
import ListItem from './ListItem'

/**
 * if ref is already stand as a domRef, there should be another ref for component methods
 */
export type ListPropController = {
  resetRenderCount(): void
}

type ListProps<T> = {
  /**
   * if ref is already stand as a domRef, there should be another ref for component methods
   */
  controllerRef?: React.Ref<ListPropController | undefined>

  increaseRenderCount?: number
  initRenderCount?: number
  reachBottomMargin?: number
  /** hatch for render all */
  renderAllAtOnce?: boolean

  /** set this will render grid-like list (used for card feed pool), mutual exclusion with gridSlotItemMinWidth  */
  gridSlotCount?: number
  /** set this will render grid-like list (used for card feed pool), mutual exclusion with gridSlotCount  */
  gridSlotItemMinWidth?: number
  /** set this will render grid-like list (used for card feed pool), mutual exclusion with gridSlotCount  */
  gridSlotItemWidth?: number

  items: T[]
  children?: (item: T, idx: number) => ReactNode
  getItemKey: (item: T, idx: number) => string | number
  // TODO: should use Context not createElement to pass List info
  // | (() => ReactNode) /* Function for lazy load when init */

  onLoadMore?: () => void
  haveLoadAll?: boolean

  // normally, it will reset if Item's length has changed
  preventResetOnChange?: boolean
}

export const listContext = createContext<{ observeFn?: ObserveFn<any> }>({})

function List<T>(
  {
    controllerRef,

    increaseRenderCount = 30,
    initRenderCount = 30,
    reachBottomMargin = 50, // px
    renderAllAtOnce,

    onLoadMore,
    haveLoadAll = false,
    preventResetOnChange = false,

    gridSlotCount,
    gridSlotItemMinWidth,
    gridSlotItemWidth,

    items: _items,
    getItemKey,
    children,
    ...props
  }: ListProps<T> & Omit<FlexProps, keyof ListProps<T>>,
  ref: any
) {
  const items = useDeferredValue(_items) // ⚡ lazy load to avoid render task aborting critical main thread
  const listRef = useRef<HTMLDivElement>(null)

  const { observe, stop } = useIntersectionObserver({ rootRef: listRef, options: { rootMargin: '80%' } })
  const contextValue = useMemo(() => ({ observeFn: observe }), [observe])

  useEffect(() => stop, []) // stop observer when destory

  const initRenderItemLength = renderAllAtOnce ? items.length : initRenderCount
  // actually showed itemLength
  const [renderItemLength, setRenderItemLength] = useState(initRenderItemLength)

  useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => {
        if (haveLoadAll && n >= items.length) return items.length
        const newCount = n + increaseRenderCount
        if (!haveLoadAll && items.length - newCount <= increaseRenderCount) onLoadMore?.()
        return newCount
      })
    },
    reachBottomMargin
  })

  // all need to render items

  // set this to force render all items
  const [renderCount, setRenderCount] = useState(0)
  const allListItems = useMemo(
    () => items.slice(0, renderItemLength).map((item, idx) => <ListItem key={getItemKey(item, idx)}>{children?.(item, idx)}</ListItem>),
    [items, renderItemLength, renderCount, children]
  )

  // reset if Item's length has changed
  useRecordedEffect(
    ([prevAllItems]) => {
      if (preventResetOnChange) return
      const prevAllItemKeys = new Set(prevAllItems?.map((item, idx) => getItemKey(item, idx)))
      const currAllItemKeys = items.map((item, idx) => getItemKey(item, idx))
      if (prevAllItems && !renderAllAtOnce && currAllItemKeys.some((key) => !prevAllItemKeys.has(key))) {
        listRef.current?.scrollTo({ top: 0 })
        setRenderItemLength(initRenderCount)
      }
    },
    [items, renderAllAtOnce, preventResetOnChange] as const
  )

  function resetRenderCount() {
    setRenderItemLength(initRenderItemLength)
    setRenderCount((n) => n + 1)
  }

  useImperativeHandle(
    controllerRef,
    () => ({
      resetRenderCount
    }),
    [resetRenderCount]
  )

  return (
    <listContext.Provider value={contextValue}>
      <Grid
        className="List"
        ref={mergeRef(listRef, ref)}
        gridTemplateColumns={
          gridSlotItemMinWidth != null
            ? `repeat(auto-fill, minmax(${gridSlotItemMinWidth}px, 1fr))`
            : gridSlotItemWidth != null
            ? `repeat(auto-fill, ${gridSlotItemWidth}px)`
            : gridSlotCount != null
            ? `repeat(${gridSlotCount}, minmax(0, 1fr))`
            : undefined
        }
        justifyContent={gridSlotCount || gridSlotItemMinWidth || gridSlotItemWidth ? 'center' : undefined}
        overflow="overlay" // overlay is prettier
        {...props}
      >
        {allListItems}
      </Grid>
    </listContext.Provider>
  )
}

export default forwardRef(List) as typeof List
