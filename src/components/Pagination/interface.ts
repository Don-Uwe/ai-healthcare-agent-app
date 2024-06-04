import { ReactNode } from 'react'

export interface PaginationProps {
  current?: number
  pageSize?: number
  total?: number
  defaultCurrent?: number
  defaultPageSize?: number
  showTotal?: boolean | ((total: number, range: number[]) => ReactNode)
  bufferSize?: number
  onChange?: (pageNumber: number, pageSize: number) => void
}
