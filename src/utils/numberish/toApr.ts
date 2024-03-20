import Decimal from 'decimal.js'
import { getFirstNonZeroDecimal, formatLocaleStr } from './formatter'

export default function toApr({ val, multiply = true, decimal }: { val: string | number; multiply?: boolean; decimal?: number }) {
  const calVal = multiply ? new Decimal(val).mul(100).toString() : String(val)
  return formatLocaleStr(calVal, decimal === undefined ? Math.max(2, getFirstNonZeroDecimal(calVal) + 1) : decimal) + '%'
}
