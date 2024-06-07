import React, { useCallback, useImperativeHandle, useRef, useState, ReactNode } from 'react'
import { Box, Grid, GridItem } from '@chakra-ui/react'
import { omit, throttle } from 'lodash'
import Pagination from '../Pagination'
import { PaginationProps } from '../Pagination/interface'
import Item from './item'
import { ListProps } from './interface'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE_CURRENT = 1

const defaultProps: ListProps = {
  defaultCurrent: 1,
  offsetBottom: 0,
  throttleDelay: 500
}

function List<T>(baseProps: ListProps<T>) {
  const props = {
    ...defaultProps,
    ...baseProps
  }
  const {
    children = [],
    dataSource = [],
    pagination,
    render,
    grid,
    offsetBottom,
    throttleDelay,
    defaultCurrent,
    listRef,
    onReachBottom,
    onListScroll
  } = props

  const refDom = useRef<HTMLDivElement | null>(null)
  const refScrollElement = useRef<HTMLDivElement | null>(null)
  const refItemListWrapper = useRef<HTMLDivElement>(null)
  const refCanTriggerReachBottom = useRef(true)

  const pageSize =
    pagination && typeof pagination === 'object'
      ? pagination.pageSize || pagination.defaultPageSize || DEFAULT_PAGE_SIZE
      : DEFAULT_PAGE_SIZE
  const [paginationCurrent, setPaginationCurrent] = useState(
    pagination && typeof pagination === 'object'
      ? pagination.current || pagination.defaultCurrent || DEFAULT_PAGE_CURRENT
      : DEFAULT_PAGE_CURRENT
  )
  const [pageCurrentForScroll, setPageCurrentForScroll] = useState(defaultCurrent)
  const childrenCount = React.Children.count(children)

  useImperativeHandle(listRef, () => {
    return {
      dom: refDom.current,
      scrollIntoView: (index) => {
        if (refItemListWrapper.current) {
          const node = refItemListWrapper.current.children[index]
          node && node.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
      getRootDOMNode: () => refDom.current
    }
  })

  const paginationProps: PaginationProps = {
    pageSize,
    current: paginationCurrent,
    total: dataSource.length > 0 ? dataSource.length : childrenCount,
    ...(typeof pagination === 'object' ? pagination : {}),
    onChange: useCallback((pageNumber: number, pageSize: number) => {
      setPaginationCurrent(pageNumber)
      pagination && typeof pagination === 'object' && pagination.onChange && pagination.onChange(pageNumber, pageSize)
    }, [])
  }
  paginationProps.current = Math.min(paginationProps.current!, Math.ceil(paginationProps.total! / paginationProps.pageSize!))

  const needHandleScroll = !!(onListScroll || onReachBottom)
  const throttledScrollHandler = useCallback(
    throttle(() => {
      if (!refScrollElement.current) return

      if (onListScroll) {
        onListScroll(refScrollElement.current)
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = refScrollElement.current
      const scrollBottom = scrollHeight - (scrollTop + clientHeight)

      if (Math.abs(scrollBottom) < offsetBottom! + 1) {
        if (refCanTriggerReachBottom.current) {
          setPageCurrentForScroll(pageCurrentForScroll! + 1)
          onReachBottom && onReachBottom(pageCurrentForScroll! + 1)
          refCanTriggerReachBottom.current = false
        }
      } else {
        refCanTriggerReachBottom.current = true
      }
    }, throttleDelay),
    [throttleDelay, pageCurrentForScroll, onListScroll, onReachBottom]
  )

  const showTotal = useCallback(
    (total: number, range: number[]) => <Box as="span"> {`${range[0]} - ${range[1]} of ${total} items`}</Box>,
    []
  )

  const renderListItems = () => {
    const getCurrentPageItems = (items: T[]) => {
      const { current, pageSize } = paginationProps
      const startIndex = (current! - 1) * pageSize!
      return pagination && items.length > startIndex ? items.slice(startIndex, startIndex + pageSize!) : items
    }

    const getItems = (originItems: T[], render?: (item: T, index: number) => ReactNode) => {
      const currentPageItems = getCurrentPageItems(originItems)
      return render ? currentPageItems.map(render) : currentPageItems
    }

    const getGrid = (originItems: T[], render?: (item: T, index: number) => ReactNode) => {
      const currentPageItems = getCurrentPageItems(originItems)
      if (grid?.column || grid?.colSpan) {
        const items: ReactNode[] = []
        const { gap, justifyContent, alignItems, column: gridRowSize, ...colProps } = grid
        const rowSize = gridRowSize || Math.floor(24 / (typeof grid.colSpan === 'number' ? grid.colSpan : 1))
        const colSpan = colProps.colSpan || Math.floor(24 / rowSize)

        let startNum = 0
        while (startNum < currentPageItems.length) {
          const nextStartNum = startNum + rowSize
          const currentRow = ~~(startNum / rowSize)
          items.push(
            <Grid key={currentRow} templateColumns={`repeat(24, 1fr)`} gap={gap} justifyContent={justifyContent} alignItems={alignItems}>
              {currentPageItems.slice(startNum, nextStartNum).map((item, index) => (
                <GridItem key={`${currentRow}_${index}`} {...colProps} colSpan={colSpan}>
                  {render ? render(item, startNum + index) : (item as ReactNode)}
                </GridItem>
              ))}
            </Grid>
          )
          startNum = nextStartNum
        }

        return items
      }
      return (
        <Grid gap={grid?.gap}>
          {currentPageItems.map((item, index) => (
            <GridItem {...omit(grid, ['gap'])} key={index}>
              {render ? render(item, index) : (item as ReactNode)}
            </GridItem>
          ))}
        </Grid>
      )
    }

    if (dataSource.length > 0 && render) {
      return grid ? getGrid(dataSource, render) : getItems(dataSource, render)
    }
    if (childrenCount > 0) {
      return grid ? getGrid(children as []) : getItems(children as [])
    }

    return null
  }

  const renderList = () => {
    const listItems = renderListItems()
    const paginationElement = pagination ? <Pagination showTotal={showTotal} total={200} {...paginationProps} /> : null

    return (
      <Box
        ref={(ref) => {
          refDom.current = ref
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          overflowY="auto"
          ref={(ref) => {
            refScrollElement.current = ref
          }}
          onScroll={needHandleScroll ? throttledScrollHandler : undefined}
        >
          {
            <Box className="list" flex={1} ref={refItemListWrapper}>
              {listItems as ReactNode[]}
            </Box>
          }
        </Box>
        {paginationElement}
      </Box>
    )
  }

  return renderList()
}

interface MemoListType extends React.MemoExoticComponent<(props: ListProps) => JSX.Element> {
  Item: typeof Item
}
const ListComponent = React.memo(List) as MemoListType

ListComponent.displayName = 'SimpleList'

ListComponent.Item = Item

export default ListComponent
