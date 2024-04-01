import formatNumber, { FormatOptions } from './formatNumber'
import Decimal from 'decimal.js'

export type ToVolumeOption = {
  decimals?: number
  format?: any | undefined
  rounding?: Decimal.Rounding
  // if true, always use shorter expression
  useShorterExpression?: boolean
  // if bigger than this, use shorter expression
  // digits includes numbers in decimal part
  maxDigitsNumber?: number
} & FormatOptions

export function toVolume(n: number | string | Decimal, options?: ToVolumeOption): string {
  const formatFn = (n: Decimal, needShortcut: boolean) =>
    formatNumber(n.toFixed(options?.decimals ?? 2, options?.rounding || Decimal.ROUND_HALF_UP), {
      decimalMode: 'fixed',
      maxDecimalCount: options?.decimals ?? 2,
      useShorterExpression: needShortcut,
      ...options
    })
  const num = new Decimal(n.toString().replace(/,/gi, ''))
  try {
    const int = num.toFixed(0)
    const numberWidth = int.length + (options?.decimals ?? 2)
    const needShortcut = options?.useShorterExpression || (options?.maxDigitsNumber != null && numberWidth > options?.maxDigitsNumber)
    return `${formatFn(num, needShortcut)}`
  } catch {
    return '0'
  }
}
