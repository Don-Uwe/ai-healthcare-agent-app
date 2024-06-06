import { HTMLAttributes, MutableRefObject, ReactNode } from 'react'
import { PaginationProps } from '../Pagination/interface'
import { GridProps, GridItemProps } from '@chakra-ui/react'

type ListGridProps = {
  column?: number
} & Pick<GridProps, 'templateColumns' | 'gap' | 'justifyContent' | 'alignItems'> &
  Pick<GridItemProps, 'colSpan' | 'rowSpan' | 'colStart' | 'colEnd' | 'rowStart' | 'rowEnd'>

export type ListHandle = {
  dom: HTMLDivElement | null
  scrollIntoView: (index: number) => void
}

export interface ListProps<T = any> {
  dataSource?: T[]
  render?: (item: T, index: number) => ReactNode
  children?: ReactNode
  pagination?: boolean | PaginationProps
  grid?: ListGridProps
  onReachBottom?: (currentPage: number) => void
  offsetBottom?: number
  defaultCurrent?: number
  throttleDelay?: number
  listRef?: MutableRefObject<ListHandle>
  onListScroll?: (elem: Element) => void
}

export interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}
