import React, { forwardRef, ForwardedRef, ReactElement } from 'react'
import { Box } from '@chakra-ui/react'
import { ListItemProps } from './interface'

const defaultProps: Partial<ListItemProps> = {}

function Item(baseProps: ListItemProps, ref: ForwardedRef<HTMLDivElement>) {
  const props = {
    ...defaultProps,
    ...baseProps
  }
  const { children, ...rest } = props

  const mainContent: ReactElement[] = []

  React.Children.forEach(children as ReactElement[], (element: ReactElement) => {
    mainContent.push(element)
  })

  const content = mainContent.length ? mainContent : null

  return (
    <Box className="listitem" ref={ref} display="flex" justifyContent="space-between" width="100%" overflow="hidden" {...rest}>
      <Box flex={1} overflow="hidden">
        {content}
      </Box>
    </Box>
  )
}

const ItemComponent = forwardRef<HTMLDivElement, ListItemProps>(Item)

ItemComponent.displayName = 'SimpleListItem'

export default ItemComponent
