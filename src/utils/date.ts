import { shakeUndefindedItem } from './shakeUndefindedItem'

type TimeStamp = string | number | Date
/**
 * @example
 * toUTC() // => '2021-09-09 10:25 UTC'
 * toUTC('Thu, 09 Sep 2021 10:26:33 GMT') // => '2021-09-09 10:25 UTC'
 */
export function toUTC(
  timestamp?: TimeStamp,
  options?: { showDate?: boolean; showTime?: boolean; showTimeSeconds?: boolean; showUTCBadge?: boolean }
): string {
  const { showUTCBadge = true, showTimeSeconds = false, showDate = true, showTime = true } = options ?? {}
  const { year, month, day, hour, minutes, seconds } = parseDateInfo(timestamp)
  const formatedDate = `${month}/${day}/${year.slice(-2)}`
  return shakeUndefindedItem([
    showDate ? formatedDate : undefined,
    showTime ? shakeUndefindedItem([hour, minutes, showTimeSeconds ? seconds : undefined]).join(':') : undefined,
    showUTCBadge ? 'UTC' : undefined
  ]).join(' ')
}

export function parseDateInfo(timestamp?: TimeStamp) {
  const utcString = (timestamp ? new Date(Number(timestamp)) : new Date()).toISOString() // '2021-09-09T10:32:32.498Z'
  const matchInfo = utcString.match(/^([\d-]+)T(\d+):(\d+):(\d+)/)
  const [, date, hour, minutes, seconds] = matchInfo ?? []
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/
  const [, year, month, day] = date.match(dateRegex) ?? []
  return {
    year: Number(year).toString(),
    month: Number(month).toString(),
    day: Number(day).toString(),
    hour: Number(hour).toString(),
    minutes: Number(minutes).toString(),
    seconds: Number(seconds).toString()
  }
}
/**
 * date format string list:
 *
 * YYYY	2018	(year)
 * YY	  18	  (year)
 * MM	  01-12 (mounth)
 * M	    1-12	(mounth)
 * DD	  01-31	 (day)
 * D 	  1-31	 (day)
 * dd	  Sun / Mon / Tue / Wed / Thu / Fri / Sat (day)
 * d	    0-6	 (week)
 * HH	  00-23	(hour)
 * H 	  0-23	(hour)
 * hh	  01-12	(hour)
 * h   	1-12	(hour)
 * mm  	00-59	(minutes), 2-digits
 * m	    0-59	(minutes)
 * ss  	00-59	(seconds), 2-digits
 * s   	0-59	(seconds)
 * SSS	  000-999	(milliseconds), 3-digits
 * A	    AM PM
 * a	    am pm
 * @example
 * formatDate('2020-08-24 18:54', 'YYYY-MM-DD HH:mm:ss') // 2020-08-24 18:54:00
 */

export function formatDate(inputDate: Date, formatString: string) {
  return formatString
    .replace('YYYY', `${inputDate.getFullYear()}`)
    .replace('YY', `${inputDate.getFullYear()}`.slice(2))
    .replace('MM', `${inputDate.getMonth() + 1}`.padStart(2, '0'))
    .replace('M', `${inputDate.getMonth() + 1}`)
    .replace('DD', `${inputDate.getDate()}`.padStart(2, '0'))
    .replace('D', `${inputDate.getDate()}`)
    .replace('d', `${inputDate.getDay()}`)
    .replace('HH', `${inputDate.getHours()}`.padStart(2, '0'))
    .replace('H', `${inputDate.getHours()}`)
    .replace('mm', `${inputDate.getMinutes()}`.padStart(2, '0'))
    .replace('m', `${inputDate.getMinutes()}`)
    .replace('ss', `${inputDate.getSeconds()}`.padStart(2, '0'))
    .replace('s', `${inputDate.getSeconds()}`)
}

export function formatDateToReadableString(inputDate: Date | string | number | undefined) {
  return formatDate(
    inputDate
      ? new Date(typeof inputDate === 'string' ? inputDate + '000' : typeof inputDate === 'number' ? inputDate * 1000 : inputDate)
      : new Date(),
    'YYYY-MM-DD HH:mm:ss'
  )
}

export const getUTCOffset = () => {
  const offset = Math.floor(new Date().getTimezoneOffset() / 60) * -1
  return (offset > 0 ? '+' : '') + offset
}

export const MINUTE_MILLISECONDS = 60 * 1000

export const DAY_SECONDS = 60 * 60 * 24
export const WEEK_SECONDS = 60 * 60 * 24 * 7
