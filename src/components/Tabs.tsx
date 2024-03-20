import {
  Button,
  SystemStyleObject,
  TabProps,
  TabIndicator as _TabIndicator,
  TabList as _TabList,
  TabListProps as _TabListProps,
  Tabs as _Tabs,
  TabsProps as _TabsProps,
  useTab,
  useTabsStyles,
  Tooltip,
  TooltipProps
} from '@chakra-ui/react'
import { ReactNode, forwardRef, useEffect, useMemo, useRef, useState } from 'react'

import { useEvent } from '@/hooks/useEvent'
import { shrinkToValue } from '@/utils/shrinkToValue'
import useResizeObserver from '@/hooks/useResizeObserver'

export type TabOptionsObj = {
  value: string
  label?: ReactNode | ((isActive: boolean) => ReactNode)
  defaultChecked?: boolean
  disabled?: boolean
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export type TabItem = TabOptionsObj | string

type TabsProps = Omit<_TabsProps, 'children' | 'onChange' | 'index' | 'defaultIndex'> & {
  items: readonly TabItem[]
  variant?:
    | 'line' /* has line indicator style */
    | 'square'
    | 'rounded'
    | 'folder'
    | 'roundedLight'
    | 'roundedPlain'
    | 'roundedSwitch'
    | 'squarePanel'
    | 'squarePanelDark'
  tabListSX?: _TabListProps['sx']
  onChange?: (value: any /* string but, don't need to type */) => void
  value?: string
  defaultValue?: string

  renderItem?(itemValue?: string, idx?: number): ReactNode
  tabItemSX?: SystemStyleObject
}

type CustomTabProps = TabProps & { toolTipProps?: Omit<TooltipProps, 'children'> }

const CustomTab = forwardRef<HTMLButtonElement, CustomTabProps>(({ toolTipProps, ...props }, ref) => {
  const tabProps = useTab({ ...props, ref })

  const styles = useTabsStyles()
  if (toolTipProps) {
    return (
      <Tooltip {...toolTipProps}>
        <Button __css={styles.tab} {...tabProps}>
          {tabProps.children}
        </Button>
      </Tooltip>
    )
  }
  return (
    <Button __css={styles.tab} {...tabProps} isDisabled={props.isDisabled}>
      {tabProps.children}
    </Button>
  )
})

export default function Tabs({
  items: rawOptions,
  size = 'sm',
  variant = 'line',
  gap = 1,
  tabListSX,
  onChange,
  value,
  defaultValue,
  renderItem,
  tabItemSX,
  ...rest
}: TabsProps) {
  const options = rawOptions.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const defaultValueIndex = useMemo(() => {
    const firstAvailableIndex = options.findIndex((option) => !option.disabled)
    const hasSetDefaultValue = defaultValue != null
    if (hasSetDefaultValue) {
      return Math.max(
        options.findIndex((option) => option.value === defaultValue),
        firstAvailableIndex
      )
    }
    const hasSetDefaultValueInItems = options.some((option) => option.defaultChecked)
    if (hasSetDefaultValueInItems) {
      return Math.max(
        options.findIndex((option) => option.defaultChecked),
        firstAvailableIndex
      )
    }
    return Math.max(
      options.findIndex((option) => option.value === value),
      firstAvailableIndex
    )
  }, [defaultValue, value, options]) // [defaultValue, value, options
  const inputValueIndex = value ? options.findIndex((option) => option.value === value && !option.disabled) : undefined
  const defaultInputValueIndex = defaultValue ? options.findIndex((option) => option.value === defaultValue && !option.disabled) : undefined
  const [activeIndex, setActiveIndex] = useState(inputValueIndex ?? defaultInputValueIndex)
  const syncActiveIndexState = (idx: number) => setActiveIndex(idx)
  useEffect(() => {
    if (inputValueIndex != null) {
      syncActiveIndexState(inputValueIndex)
    }
  }, [inputValueIndex])
  const haveIndicator = variant !== 'roundedPlain'
  const tabItemRefs = useRef<(HTMLElement | undefined | null)[]>([])
  const [indicatorTarget, setIndicatorTarget] = useState<HTMLElement>()
  const setIndicatorTargetByIndex = useEvent((idx: number) => {
    const el = tabItemRefs.current[idx]
    if (el) {
      setIndicatorTarget(el)
    }
  })

  useEffect(() => {
    if (inputValueIndex != null) {
      setIndicatorTargetByIndex(inputValueIndex)
    }
  }, [inputValueIndex])

  useEffect(() => {
    if (!isNaN(defaultValueIndex)) {
      setIndicatorTargetByIndex(defaultValueIndex)
    }
  }, [defaultValueIndex])

  const onTabChange = useEvent((idx: number) => {
    if (options[idx].disabled) return
    setIndicatorTargetByIndex(idx)
    return onChange?.(options[idx].value)
  })
  // change this will recalculate indicatorLeft and indicatorWidth
  const [forceRerenderIndicatorCount, setForceRerenderIndicatorCount] = useState(0)
  const forceRerenderIndicator = () => {
    setForceRerenderIndicatorCount((c) => c + 1)
  }
  useResizeObserver(tabItemRefs, forceRerenderIndicator)
  useEffect(() => {
    if (globalThis.document == null) return
    globalThis.document.addEventListener('resize', forceRerenderIndicator)
    return () => globalThis.document.removeEventListener('resize', forceRerenderIndicator)
  }, [])
  const indicatorLeft = useMemo(() => indicatorTarget?.offsetLeft, [indicatorTarget, forceRerenderIndicatorCount])
  const indicatorWidth = useMemo(() => indicatorTarget?.offsetWidth, [indicatorTarget, forceRerenderIndicatorCount])
  return (
    <_Tabs
      size={size}
      variant={variant}
      w={rest.isFitted ? undefined : 'fit-content'}
      onChange={(idx) => {
        // tabs trigger twice?
        syncActiveIndexState(idx)
        onTabChange(idx)
      }}
      defaultIndex={defaultValueIndex}
      index={inputValueIndex}
      {...rest}
    >
      <_TabList sx={tabListSX} gap={variant !== 'line' ? gap : size === 'sm' ? '8px' : size === 'md' ? '16px' : '28px'}>
        {options.map((option, idx) => (
          <CustomTab
            sx={tabItemSX}
            key={`${option.value}`}
            cursor={option.disabled ? 'default' : 'pointer'}
            toolTipProps={option.tooltipProps}
            ref={(el) => {
              if (el) tabItemRefs.current[idx] = el
            }}
            whiteSpace="nowrap"
            minW={['2em', '3em']}
            px={'1em'}
            display={'grid'}
            placeItems={'center'}
            isDisabled={option.disabled}
          >
            {renderItem?.(option.value, idx) ?? shrinkToValue(option.label, [activeIndex === idx]) ?? option.value}
          </CustomTab>
        ))}
        {haveIndicator && (
          <_TabIndicator
            sx={{
              left: `${indicatorLeft}px !important`, // overwrite chakra's wrong style
              width: `${indicatorWidth}px !important` // overwrite chakra's wrong style
            }}
          />
        )}
      </_TabList>
    </_Tabs>
  )
}
