import { useHover } from '@/hooks/useHover'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { colors } from '@/theme/cssVariables'
import { Box, BoxProps, Popover, PopoverArrow, PopoverContent, PopoverProps, PopoverTrigger, Portal, forwardRef } from '@chakra-ui/react'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { useDisclosure } from '../hooks/useDelayDisclosure'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { useAppStore } from '@/store'

export type TooltipHandles = {
  open(): void
  close(): void
}

let prevTooltipHandler: TooltipHandles | undefined = undefined
/**
 * build-in chakra's Tooltip is **NOT** interactive.Popover is too comlicated, even your usage is just show a text sentences.
 * so have to build a custom tooltip to match the V3's usage
 */
export default forwardRef(function Tooltip(
  {
    isLazy = true,
    usePortal = false,
    label,
    children,
    isOpen,
    defaultIsOpen: defaultTooltipIsOpen,
    contentBoxProps,
    ...restPopoverProps
  }: {
    /** render content only when content is open */
    isLazy?: boolean
    usePortal?: boolean
    label?: ReactNode | ((handlers: TooltipHandles) => ReactNode)
    children?: ReactNode
    isOpen?: boolean
    defaultIsOpen?: boolean
    contentBoxProps?: BoxProps
  } & Omit<PopoverProps, 'isOpen' | 'label' | 'defaultIsOpen'>,
  ref
) {
  const tooltipBoxRef = useRef<HTMLDivElement>(null)
  const tooltipTriggerRef = useRef<HTMLDivElement>(null)
  const defaultIsOpen = isOpen ?? defaultTooltipIsOpen
  const { isOpen: isTooltipOpen, onOpen: open, onClose: close, onToggle: toggle } = useDisclosure({ defaultIsOpen })
  const isMobile = useAppStore((s) => s.isMobile)
  useOutsideClick({
    enabled: isTooltipOpen,
    ref: [tooltipBoxRef, tooltipTriggerRef],
    handler: () => {
      if (isTooltipOpen) {
        close()
      }
    }
  })
  const tooltipHandlers = useMemo(
    () => ({
      open,
      close
    }),
    [open, close]
  )

  // always has only one tooltip open
  useEffect(() => {
    if (isTooltipOpen && prevTooltipHandler !== tooltipHandlers) {
      prevTooltipHandler?.close()
      prevTooltipHandler = tooltipHandlers
    }
  }, [isTooltipOpen])

  useHover([tooltipTriggerRef, tooltipBoxRef], {
    onHoverStart: () => {
      if (isMobile) return
      open()
    },
    onHoverEnd: () => close({ delay: 300 })
  })

  const renderLabel = () => {
    const node = shrinkToValue(label, [tooltipHandlers])
    return node
  }

  function PopoverContentWrapper({ usePortal, children }: { usePortal?: boolean; children?: ReactNode }) {
    if (usePortal) {
      return <Portal>{children}</Portal>
    }
    return <>{children}</>
  }

  return (
    <Popover isOpen={isTooltipOpen} placement="top" defaultIsOpen={defaultIsOpen} {...restPopoverProps}>
      <PopoverTrigger>
        <Box
          ref={tooltipTriggerRef}
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          cursor={label ? 'pointer' : undefined}
        >
          {shrinkToValue(children, [tooltipHandlers])}
        </Box>
      </PopoverTrigger>

      <PopoverContentWrapper usePortal={usePortal}>
        <PopoverContent ref={ref}>
          <Box>
            <PopoverArrow />
            <Box
              ref={tooltipBoxRef}
              fontSize="sm"
              color={colors.textSecondary}
              py={restPopoverProps.variant == 'card' ? undefined : 3}
              px={restPopoverProps.variant == 'card' ? undefined : 4}
              rounded={restPopoverProps.variant == 'card' ? 'xl' : 'lg'}
              bg={colors.tooltipBg}
              {...contentBoxProps}
            >
              {(isLazy && isTooltipOpen) || !isLazy ? renderLabel() : null}
            </Box>
          </Box>
        </PopoverContent>
      </PopoverContentWrapper>
    </Popover>
  )
})
