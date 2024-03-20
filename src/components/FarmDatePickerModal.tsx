import { Box, Flex, Grid, GridItem, HStack, NumberInput, NumberInputField, SimpleGrid, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SelectSingleEventHandler } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { DatePick, HourPick, MinutePick } from '@/components/DateTimePicker'
import { colors } from '@/theme/cssVariables'
import ResponsiveModal from './ResponsiveModal'
import { getUTCOffset } from '@/utils/date'
dayjs.extend(utc)

export type FarmPeriodModalProps = {
  isOpen: boolean
  onConfirm: (start: number, end: number) => void
  onClose: () => void
  farmStart: number | undefined
  farmDuration?: number
}

export default function FarmDatePickerModal({ isOpen, onConfirm, onClose, farmStart, farmDuration = 7 }: FarmPeriodModalProps) {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState<Date>(dayjs(farmStart).toDate())
  const [startHour, setStartHour] = useState(dayjs(farmStart).hour())
  const [startMinute, setStartMinute] = useState<number>(
    dayjs(farmStart)
      .add(farmStart ? 0 : 15, 'minutes')
      .minute()
  )
  const [durationDays, setDurationDays] = useState<string | number>(farmDuration)
  const [hours, setHours] = useState<string[]>([])

  const endDate = useMemo(() => {
    return dayjs(startDate)
      .add(durationDays ? Number(durationDays) : 0, 'day')
      .format('YYYY/MM/DD')
  }, [startDate, durationDays])

  const onDateSelect: SelectSingleEventHandler = useCallback(
    (_, selected) => {
      setStartDate(dayjs(selected).hour(startHour).minute(startMinute).toDate())
    },
    [startHour, startMinute]
  )

  const onDurationChange = useCallback((valString: string, valueAsNumber: number) => {
    setDurationDays(valString ? valueAsNumber : valString)
  }, [])

  const handleConfirm = useCallback(() => {
    const newDate = new Date(startDate.valueOf())
    onConfirm(startDate.valueOf(), newDate.setDate(newDate.getDate() + (durationDays ? Number(durationDays) : 7)).valueOf())
  }, [startDate, durationDays])

  useEffect(() => {
    setStartDate((val) => dayjs(val).hour(startHour).minute(startMinute).toDate())
  }, [startHour, startMinute])

  useEffect(() => {
    const today = dayjs(),
      isToday = today.isSame(startDate, 'day')
    if (isToday) {
      const currentHour = today.hour()
      const hours: string[] = Array.from({ length: 24 - currentHour }, (_, idx) => (idx + currentHour).toString().padStart(2, '0'))
      setHours(hours)
    } else {
      setHours([])
    }
  }, [startDate])

  return (
    <ResponsiveModal size={'2xl'} title="Farm period" isOpen={isOpen} onClose={onClose}>
      <Grid
        gridTemplate={[
          `
          "calendar" auto
          "time    " auto
          "duration" auto
          "end     " auto / 1fr
        `,
          `
          "calendar time    " 1fr
          "calendar duration" 1fr
          "calendar end     " 1fr / auto 240px
        `
        ]}
        columnGap={5}
        rowGap={[4, 0]}
      >
        <GridItem area="calendar">
          <SimpleGrid autoFlow={'row'} gap={[4, 3]}>
            <Title value="Start on" />
            <Box bg={colors.backgroundDark} rounded={'12px'}>
              <DatePick mode="single" selected={startDate} onSelect={onDateSelect} required={true} />
            </Box>
          </SimpleGrid>
        </GridItem>

        <GridItem area="time">
          <SimpleGrid autoFlow={['column', 'row']} templateColumns={['20% 1fr', 'unset']} gap={[4, 3]} alignItems={'center'}>
            <Title value="Start at" />
            <HStack spacing={3}>
              <HourPick sx={{ flex: 1 }} value={startHour} defaultValues={hours} onChange={setStartHour} />
              <MinutePick sx={{ flex: 1 }} value={startMinute} onChange={setStartMinute} />
            </HStack>
          </SimpleGrid>
        </GridItem>

        <GridItem area="duration">
          <SimpleGrid autoFlow={['column', 'row']} templateColumns={['20% 1fr', 'unset']} gap={[4, 3]} alignItems={'center'}>
            <Title value="Duration" />
            <Flex borderRadius="12px" bg={colors.backgroundDark} p="16px 20px 16px 20px">
              <NumberInput variant="clean" min={7} max={90} step={1} value={durationDays} onChange={onDurationChange}>
                <NumberInputField placeholder="7-90 Days" _placeholder={{ color: colors.textSecondary, fontSize: '20px', opacity: 0.5 }} />
              </NumberInput>
            </Flex>
          </SimpleGrid>
        </GridItem>

        <GridItem area="end">
          <SimpleGrid
            h="full"
            justifyContent={'center'}
            alignItems={'center'}
            border={`1px solid ${colors.textTertiary}`}
            bg={colors.backgroundTransparent07}
            borderRadius="12px"
            py={4}
            gap={1}
            columnGap={4}
            gridTemplate={[
              `
              "label  label" auto
              "date   time " auto / auto auto
            `,
              `
              "label" auto
              "date " auto
              "time " auto / auto
            `
            ]}
          >
            <Text gridArea={'label'} textAlign={'center'} fontSize="sm" color={colors.textTertiary}>
              {t('date_picker.farm_will_end_at')}
            </Text>
            <Text gridArea={'date'} width={'max-content'} textAlign={['right', 'center']}>
              {endDate}
            </Text>
            <Text gridArea={'time'} textAlign={'center'} color={colors.textSecondary} fontWeight={400} fontSize="xs">
              {dayjs(startDate)
                .add(durationDays ? Number(durationDays) : 0, 'day')
                .format('HH:mm')}{' '}
              (UTC{getUTCOffset()})
            </Text>
          </SimpleGrid>
        </GridItem>
      </Grid>

      <Flex justifyContent="space-between" mt={8} mb={4} gap={3}>
        <Button size={['lg', 'md']} onClick={onClose} variant="outline">
          {t('button.cancel')}
        </Button>
        <Button
          flex={[1, 'unset']}
          size={['lg', 'md']}
          isDisabled={
            isNaN(Number(durationDays)) ||
            Number(durationDays) < 7 ||
            Number(durationDays) > 90 ||
            dayjs(startDate).isBefore(dayjs(), 'minute')
          }
          onClick={handleConfirm}
        >
          {t('button.confirm')}
        </Button>
      </Flex>
    </ResponsiveModal>
  )
}

function Title({ value }: { value: string }) {
  return (
    <Text fontWeight="medium" fontSize="sm">
      {value}
    </Text>
  )
}
