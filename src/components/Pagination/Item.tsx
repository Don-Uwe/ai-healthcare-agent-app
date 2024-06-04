import React, { ReactNode, MouseEvent } from 'react'
import { Box } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'

export interface PagerProps {
  disabled?: boolean
  pageNum: number
  current: number
  onClick: (value: number) => void
}

export enum StepType {
  previous,
  next
}
export interface StepPagerProps {
  disabled?: boolean
  type: StepType
  current: number
  allPages: number
  onClick: (value: number) => void
  icons?: {
    prev?: ReactNode
    next?: ReactNode
  }
}

const itemSx = {
  textAlign: 'center',
  verticalAlign: 'middle',
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: 'md',
  backgroundColor: 'transparent',
  fontSize: '1rem',
  minWidth: '2rem',
  height: '2rem',
  lineHeight: '2rem'
}

const disabledItemSx = {
  cursor: 'not-allowed',
  opacity: '0.6',
  backgroundColor: 'transparent'
}

function Item(props: PagerProps) {
  const { pageNum, current, disabled } = props

  const isActive = current === pageNum

  const activeItemSx = {
    transition: 'color .2s linear, background-color .2s linear',
    color: colors.textSecondary,
    backgroundColor: colors.backgroundTransparent12
  }

  const onClick = (e: MouseEvent<HTMLInputElement>) => {
    const { pageNum, onClick, disabled } = props
    if (e.currentTarget.dataset.active === 'true') {
      return
    }

    e.stopPropagation()

    if (!disabled) {
      onClick && onClick(pageNum)
    }
  }

  return (
    <Box
      sx={{ ...itemSx, ...(isActive ? activeItemSx : {}), ...(disabled ? disabledItemSx : {}) }}
      onClick={onClick}
      tabIndex={props.disabled ? -1 : 0}
    >
      {pageNum}
    </Box>
  )
}

function getIcon(
  name: string,
  icons?: {
    prev?: ReactNode
    next?: ReactNode
  }
) {
  switch (name) {
    case 'prev':
      return icons && icons.prev ? icons.prev : <Box>{'<'}</Box>
    case 'next':
      return icons && icons.next ? icons.next : <Box>{'>'}</Box>
    default:
      return null
  }
}

export const StepPager = (props: StepPagerProps) => {
  const { current, allPages, type, disabled } = props
  const [prev, next] = ['prev', 'next']
  const StepIcon = type === StepType.previous ? getIcon(prev) : getIcon(next)
  let _disabled = false
  if (allPages === 0) {
    _disabled = true
  } else if (type === StepType.previous) {
    _disabled = current <= 1
  } else {
    _disabled = current === allPages
  }
  const innerDisabled = disabled || _disabled

  let nextPage = current + (type === StepType.previous ? -1 : 1)
  nextPage = Math.max(0, Math.min(allPages, nextPage))

  const onClick = () => {
    if (innerDisabled) {
      return
    }
    props.onClick && props.onClick(nextPage)
  }

  return (
    <Box sx={innerDisabled ? { ...itemSx, ...disabledItemSx } : itemSx} onClick={onClick} tabIndex={innerDisabled ? -1 : 0}>
      {StepIcon}
    </Box>
  )
}

export default Item
