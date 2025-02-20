import Decimal from 'decimal.js'
import { getFirstNonZeroDecimal, formatLocaleStr } from './formatter'

export default function toApr({ val, multiply = true, decimal }: { val: string | number; multiply?: boolean; decimal?: number }) {
  const decimalVal = new Decimal(val || 0)
  const calVal = multiply ? decimalVal.mul(100).toString() : String(val ?? 0)
  return (
    formatLocaleStr(
      calVal,
      decimal === undefined ? (decimalVal.gte(0.01) ? 2 : Math.max(2, getFirstNonZeroDecimal(calVal) + 1)) : decimal
    ) + '%'
  )
}
