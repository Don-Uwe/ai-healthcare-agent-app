import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export default function logMessage(...params: any) {
  console.log(`${dayjs().utc().valueOf()} -`, ...params)
}
