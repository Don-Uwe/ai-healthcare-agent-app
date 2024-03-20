import { Numberish, Rounding, Fraction, toFraction } from '@raydium-io/raydium-sdk-v2'
import formatNumber, { FormatOptions } from './formatNumber'
import Decimal from 'decimal.js'

export type ToVolumeOption = {
  decimals?: number
  format?: any | undefined
  rounding?: Rounding
  // if true, always use shorter expression
  useShorterExpression?: boolean
  // if bigger than this, use shorter expression
  // digits includes numbers in decimal part
  maxDigitsNumber?: number
} & FormatOptions

export function toVolume(n: Numberish | Decimal, options?: ToVolumeOption): string {
  const formatFn = (n: Fraction, needShortcut: boolean) =>
    formatNumber(n.toFixed(options?.decimals ?? 2, options?.format, options?.rounding), {
      decimalMode: 'fixed',
      maxDecimalCount: options?.decimals ?? 2,
      useShorterExpression: needShortcut,
      ...options
    })
  const num = toFraction(isDecimal(n) ? n.toString() : n)
  try {
    const int = num.toFixed(0)
    const numberWidth = int.length + (options?.decimals ?? 2)
    const needShortcut = options?.useShorterExpression || (options?.maxDigitsNumber != null && numberWidth > options?.maxDigitsNumber)
    return `${formatFn(num, needShortcut)}`
  } catch {
    return '0'
  }
}

function isDecimal(n: any): n is Decimal {
  return n && typeof n === 'object' && n instanceof Decimal
}
