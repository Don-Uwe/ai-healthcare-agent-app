import { Flex, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { CaptionProps, DayPicker, DayPickerProps, IconLeft, IconRight, useNavigation } from 'react-day-picker'

import { colors } from '@/theme/cssVariables'

export function DatePick(props: DayPickerProps) {
  const css = `
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: white;
    color: ${colors.backgroundDark};
  }
  .rdp-button:not([disabled]){
    color: ${colors.textSecondary}
  }
  .my-selected:not([disabled]) {
    color: ${colors.backgroundDark};
    background-color: ${colors.primary};
  }
  .my-selected:hover:not([disabled]) {
    color: ${colors.backgroundDark};
  }
  .my-today {
    font-weight: bold;
    font-size: 100%;
    color: orange;
  }
  .my-disabled {
    color: ${colors.textSecondary};
    cursor: not-allowed;
  }
`

  return (
    <Flex py={'8px'} justify={'center'}>
      <style>{css}</style>
      <DayPicker
        components={{ Caption: CustomCaption }}
        modifiersClassNames={{
          selected: 'my-selected',
          today: 'my-today',
          disabled: 'my-disabled'
        }}
        modifiersStyles={{
          disabled: { opacity: '50%' }
        }}
        disabled={{ before: new Date() }}
        {...props}
      />
    </Flex>
  )
}

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation()

  return (
    <Flex justify={'space-between'} align="center">
      <button
        className="rdp-button_reset rdp-button rdp-nav_button rdp-nav_button_previous"
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        <IconLeft />
      </button>
      <Text fontWeight="medium">{dayjs(props.displayMonth).format('MMMM YYYY')}</Text>

      <button
        className="rdp-button_reset rdp-button rdp-nav_button rdp-nav_button_previous"
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        <IconRight />
      </button>
    </Flex>
  )
}
