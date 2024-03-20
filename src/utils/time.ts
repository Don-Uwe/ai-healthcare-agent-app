/** timeA is before timeB */
export const isBefore = (timeA: number, timeB: number) => timeA < timeB

/** timeA is after timeB */
export const isAfter = (timeA: number, timeB: number) => timeA > timeB

export const DATE_FORMAT_REGEX = 'YYYY-MM-DD HH:mm'
export const DATE_FORMAT_REGEX_UTC = 'YYYY-MM-DD HH:mm UTC'
export const HOUR_SECONDS = 3600
export const DAY_SECONDS = HOUR_SECONDS * 24
// duration should be seconds
export const getDurationUnits = (duration: number) => {
  const days = Math.floor(duration / DAY_SECONDS)
  const hours = Math.floor((duration % DAY_SECONDS) / HOUR_SECONDS)
  const minutes = Math.floor((duration % HOUR_SECONDS) / 60)
  const seconds = Math.floor(duration % 60)
  return {
    days,
    hours,
    minutes,
    seconds,
    text: [[`${days}D`, ...(hours ? [`${hours}H`] : [])].join(' ')]
  }
}

export const timeBasis = {
  day: '24h',
  week: '7d',
  month: '30d'
}

export const timeBasisOptions = Object.values(timeBasis)

export const getTimeBasis = (idx: number) => {
  return timeBasisOptions[idx]
}
