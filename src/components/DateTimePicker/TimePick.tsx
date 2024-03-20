import { SystemStyleObject, PlacementWithLogical } from '@chakra-ui/react'
import { Select } from '@/components/Select'
import { colors } from '@/theme/cssVariables'

type TimePickProps = {
  sx?: SystemStyleObject
  contentSx?: SystemStyleObject
  placement?: PlacementWithLogical
  value: number
  defaultValues?: string[]
  onChange: (value: number) => void
}

export function HourPick({ sx = {}, contentSx = {}, placement, value, defaultValues, onChange }: TimePickProps) {
  const items: string[] =
    defaultValues && defaultValues.length > 0
      ? defaultValues
      : Array(24)
          .fill(0)
          .map((_, idx) => idx.toString().padStart(2, '0'))

  const onHourChange = (val: string) => {
    onChange(Number(val))
  }

  const isValueValid = items.includes(value.toString().padStart(2, '0'))
  const validValue = isValueValid ? value : items[0]

  return (
    <Select
      placeholder="HH"
      value={validValue}
      items={items}
      onChange={onHourChange}
      popoverContentSx={contentSx}
      placement={placement}
      variant="filledDark"
      sx={{
        bg: colors.backgroundDark,
        padding: '16px 20px',
        fontSize: '20px',
        justifyContent: 'space-between',
        ...sx
      }}
    />
  )
}

export function MinutePick({ sx = {}, value, onChange, contentSx = {}, placement }: TimePickProps) {
  const items: string[] = Array(60)
    .fill(0)
    .map((_, idx) => idx.toString().padStart(2, '0'))

  const onMinuteChange = (val: string) => {
    onChange(Number(val))
  }

  return (
    <Select
      value={items[value]}
      items={items}
      onChange={onMinuteChange}
      popoverContentSx={contentSx}
      variant="filledDark"
      placement={placement}
      sx={{
        bg: colors.backgroundDark,
        padding: '16px 20px 16px 20px',
        fontSize: '20px',
        justifyContent: 'space-between',
        ...sx
      }}
    />
  )
}
