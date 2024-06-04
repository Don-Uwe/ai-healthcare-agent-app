import React, { ReactNode, ReactElement, useEffect, useState, useRef, forwardRef, ForwardedRef } from 'react'
import { Box } from '@chakra-ui/react'
import PageItem, { StepType, StepPager } from './Item'
import { PaginationProps } from './interface'

export interface PaginationState {
  current: number
  pageSize: number
  total?: number
}

const _defaultCurrent = 1
const _defaultPageSize = 10

function getAllPages(pageSize = _defaultPageSize, total: number) {
  return Math.ceil(total / pageSize)
}

function getBufferSize(bufferSize: number, allPages: number) {
  const min = 0
  const max = Math.floor(allPages / 2) - 1
  const newBufferSize = Math.max(bufferSize, min)
  return Math.min(newBufferSize, max)
}

const defaultProps: PaginationProps = {
  total: 0,
  bufferSize: 2
}

function Pagination(baseProps: PaginationProps, ref: ForwardedRef<HTMLDivElement>) {
  const props = {
    ...defaultProps,
    ...baseProps
  }
  const { total: propTotal, pageSize: propPageSize, current: propCurrent, defaultCurrent, defaultPageSize } = props
  const [current, setCurrent] = useState(propCurrent ?? defaultCurrent ?? _defaultCurrent)
  const [pageSize, setPageSize] = useState(propPageSize ?? defaultPageSize ?? _defaultPageSize)
  const total = propTotal

  function getAdjustedCurrent(newPageSize: number, newTotal: number) {
    const newAllPages = getAllPages(newPageSize, newTotal)
    const newCurrent = current > newAllPages ? newAllPages : current
    return newCurrent
  }

  const firstRenderRef = useRef(true)
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    propCurrent && setCurrent(propCurrent)
  }, [propCurrent])

  useEffect(() => {
    const newCurrent = getAdjustedCurrent(pageSize, total ?? 0)
    if (newCurrent !== current && !('current' in props)) {
      setCurrent(newCurrent)
    }
  }, [total, current, pageSize])

  const onChange = (pageNumber = current, size = pageSize) => {
    const { onChange } = props
    onChange && onChange(pageNumber, size)
  }

  const onPageNumberChange = (pageNumber: number) => {
    if (!('current' in props)) {
      setCurrent(pageNumber)
    }
    onChange(pageNumber)
  }

  const { showTotal } = props

  const pageList: ReactElement[] = []
  const allPages = getAllPages(pageSize, total ?? 0)

  const bufferSize = getBufferSize(props.bufferSize ?? 0, allPages)

  if (allPages <= 1) {
    return null
  }

  const pagerProps = {
    onClick: onPageNumberChange,
    current,
    allPages
  }

  const beginFoldPage = 1 + 2 + bufferSize
  const endFoldPage = allPages - 2 - bufferSize
  if (allPages <= 4 + bufferSize * 2 || (current === beginFoldPage && current === endFoldPage)) {
    for (let i = 1; i <= allPages; i++) {
      pageList.push(<PageItem {...pagerProps} key={i} pageNum={i} />)
    }
  } else {
    let left = 1
    let right = allPages

    if (current > beginFoldPage && current < endFoldPage) {
      right = current + bufferSize
      left = current - bufferSize
    } else if (current <= beginFoldPage) {
      left = 1
      right = Math.max(beginFoldPage, bufferSize + current)
    } else if (current >= endFoldPage) {
      right = allPages
      left = Math.min(endFoldPage, current - bufferSize)
    }

    for (let i = left; i <= right; i++) {
      pageList.push(<PageItem key={i} pageNum={i} {...pagerProps} />)
    }
  }

  const renderPager: ReactElement = (
    <Box display="flex" gap={2}>
      <StepPager {...pagerProps} key="previous" type={StepType.previous} />
      {pageList}
      <StepPager key="next" {...pagerProps} type={StepType.next} />
    </Box>
  )

  let totalElement: ReactNode = null
  if (typeof showTotal === 'boolean' && showTotal) {
    totalElement = (
      <Box mr={2} fontSize="1rem" lineHeight={8}>
        {`${current}/${total}`}
      </Box>
    )
  }
  if (typeof showTotal === 'function') {
    totalElement = (
      <Box mr={2} fontSize="1rem" lineHeight={8}>
        {showTotal(total ?? 0, [(current - 1) * pageSize + 1, current * pageSize])}
      </Box>
    )
  }
  return (
    <Box display="flex" alignItems="center" justifyContent="center" ref={ref}>
      {totalElement}
      {renderPager}
    </Box>
  )
}

const PaginationComponent = React.memo(forwardRef<HTMLDivElement, PaginationProps>(Pagination))

PaginationComponent.displayName = 'Pagination'

export default PaginationComponent
