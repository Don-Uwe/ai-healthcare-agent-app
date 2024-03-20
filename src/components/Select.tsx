import {
  Box,
  Divider,
  HStack,
  PlacementWithLogical,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SystemStyleObject,
  TooltipProps,
  useDisclosure
} from '@chakra-ui/react'
import { ReactNode, useRef } from 'react'

import { useOutsideClick } from '@/hooks/useOutsideClick'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { colors } from '@/theme/cssVariables'
import { isObject } from '@/utils/judges/judgeType'
import { MayFn, shrinkToValue } from '@/utils/shrinkToValue'

type SelectorItemObj<T> = {
  value: T
  label?: ReactNode | ((isActive: boolean) => ReactNode)
  disabled?: boolean
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export type SelectorItem<T = any> = SelectorItemObj<T> | T

function isSelectorItemObj<T>(item: SelectorItem<T>): item is SelectorItemObj<T> {
  return isObject(item) && 'value' in item
}
/**
 * chakra <Select> use HTML <select>, which only can include text as option.
 * So use chakra <Popover> instead
 */
export function Select<T>({
  variant = 'filled',
  facePrefix,
  items,
  value,
  defaultValue,
  sx,
  popoverContentSx,
  triggerSX,
  disabled,
  onChange,
  renderItem,
  renderTriggerItem = renderItem,
  hasDivider = false,
  hasBorder = false,
  hasDownIcon = true,
  placement = 'bottom-start'
}: {
  variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  facePrefix?: MayFn<ReactNode, [{ open: boolean; itemValue?: T }]>
  items?: SelectorItem<T>[]
  value?: T
  defaultValue?: T
  sx?: MayFn<SystemStyleObject, [{ isPanelOpen: boolean }]>
  popoverContentSx?: MayFn<SystemStyleObject, [{ isPanelOpen: boolean }]>
  triggerSX?: MayFn<SystemStyleObject, [{ isPanelOpen: boolean }]>
  disabled?: boolean
  onChange?(item: T): void
  renderItem?(item?: T, idx?: number): ReactNode
  /** if not spcified use renderItem */
  renderTriggerItem?(item?: T): ReactNode
  placeholder?: ReactNode
  hasDivider?: boolean
  hasBorder?: boolean
  hasDownIcon?: boolean
  placement?: PlacementWithLogical
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const isFaceRounded = variant.toLocaleLowerCase().includes('rounded')
  const isFaceLight = variant === 'filled' || variant === 'filledFlowDark' || variant === 'roundedFilledFlowDark'
  const isWhenOpenFaceLight = variant === 'filled'
  const isContentDark = variant.toLocaleLowerCase().includes('dark')

  const triggerValue = value ?? defaultValue
  function getItemLabel(itemValue: T | undefined, activeIdx?: number) {
    for (const [idx, item] of (items ?? []).entries()) {
      if (!isSelectorItemObj(item)) {
        if (item === itemValue) return String(itemValue)
      } else {
        if (item.value === itemValue) return shrinkToValue(item.label, [activeIdx === idx]) ?? String(itemValue)
      }
    }
    return String(itemValue)
  }
  function getItemIndex(itemValue: T | undefined) {
    for (const [idx, item] of (items ?? []).entries()) {
      if (!isSelectorItemObj(item)) {
        if (item === itemValue) return idx
      } else {
        if (item.value === itemValue) return idx
      }
    }
    return undefined
  }
  const activeItemIndex = getItemIndex(triggerValue)
  const triggerItem = renderTriggerItem ? renderTriggerItem(triggerValue) : getItemLabel(triggerValue, activeItemIndex)
  const Trigger = () => (
    <HStack
      ref={triggerRef}
      sx={shrinkToValue(sx, [{ isPanelOpen: isOpen }]) ?? shrinkToValue(triggerSX, [{ isPanelOpen: isOpen }])}
      width={'max-content'}
      fontWeight={500}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? '0.5' : '1'}
      bg={(isOpen ? isWhenOpenFaceLight : isFaceLight) ? colors.backgroundTransparent12 : colors.backgroundDark}
      _hover={{
        bg: isWhenOpenFaceLight ? colors.backgroundTransparent12 : colors.backgroundDark
      }}
      transition={'200ms'}
      borderRadius={isFaceRounded ? 'full' : '8px'}
      py={1}
      px={4}
      fontSize={['md']}
      color={isFaceLight ? colors.textSecondary : colors.textPrimary}
    >
      {facePrefix && <Box>{shrinkToValue(facePrefix, [{ open, itemValue: value }])}</Box>}
      <Box flexGrow="1">{triggerItem}</Box>
      {hasDownIcon && <ChevronDownIcon width={16} height={16} />}
    </HStack>
  )

  /** {@link Select} can close by click outside selector */
  useOutsideClick({
    ref: [triggerRef, panelRef],
    handler() {
      onClose()
    }
  })

  if (disabled) return Trigger()

  return (
    <Popover strategy="fixed" isOpen={isOpen} onOpen={onOpen} onClose={onClose} autoFocus={false} placement={placement}>
      <PopoverTrigger>{Trigger()}</PopoverTrigger>
      <PopoverContent
        ref={panelRef}
        sx={shrinkToValue(popoverContentSx, [{ isPanelOpen: isOpen }])}
        bg={isContentDark ? colors.backgroundDark : colors.backgroundTransparent12}
        minW={triggerRef.current?.clientWidth}
        maxHeight={'8lh'} // sometimes, content may be too large, like date-picker's hour/minute picker
        overflowY={'auto'}
        py="8px"
        _focus={{ boxShadow: 'none' }}
        border={hasBorder ? `1px solid ${colors.dividerBg}` : undefined}
      >
        {items?.map((item, idx) => {
          const itemValue = isSelectorItemObj(item) ? item.value : item
          const itemLabel = isSelectorItemObj(item)
            ? shrinkToValue(item.label, [activeItemIndex === idx]) ?? String(itemValue)
            : String(item)
          return (
            <Box key={idx}>
              {idx && hasDivider ? <Divider my={2} /> : null}
              <Box
                cursor="pointer"
                _hover={{
                  bg: colors.backgroundLight
                }}
                onClick={() => {
                  onChange?.(itemValue)
                  onClose()
                }}
                fontSize={['md']}
                py={1}
                px="8px"
                color={isFaceLight ? colors.textTertiary : colors.textSecondary}
              >
                {renderItem ? renderItem(itemValue, idx) : itemLabel}
              </Box>
            </Box>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
