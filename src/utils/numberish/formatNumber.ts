import { Numberish } from '@raydium-io/raydium-sdk-v2'
import { fall } from '../functionMethods'
import { toString } from './toString'

const stringNumberRegex = /(-?)([\d,_]*)\.?(\d*)/

function toFixed(n: string /* a format of number */, maxDecimalCount: number): string {
  const [, , ,] = n.match(/(-?)(\d*)\.?(\d*)/) ?? []
  // if (!dec) return String(n)
  // if (dec.length < maxDecimalCount) return String(n)
  return Number(n).toFixed(maxDecimalCount) // TODO: imply this
}

/**
 *
 * @example
 * trimTailingZero('-33.33000000') //=> '-33.33'
 * trimTailingZero('-33.000000') //=> '-33'
 * trimTailingZero('.000000') //=> '0'
 */
export function trimTailingZero(s: string) {
  // no decimal part
  if (!s.includes('.')) return s
  const [, sign, int, dec] = s.match(stringNumberRegex) ?? []
  let cleanedDecimalPart = dec
  while (cleanedDecimalPart.endsWith('0')) {
    cleanedDecimalPart = cleanedDecimalPart.slice(0, cleanedDecimalPart.length - 1)
  }
  return cleanedDecimalPart ? `${sign}${int}.${cleanedDecimalPart}` : `${sign}${int}` || '0'
}

export type FormatOptions = {
  /**
   * separator symbol
   * @default ','
   * @example
   * formatNumber(7000000.2) // result: '7,000,000.200'
   * formatNumber(7000000.2, { groupSeparator: '_' }) // result: '7_000_000.20'
   */
  groupSeparator?: string
  /**
   * @default true
   * @example
   * formatNumber(7000000.2) // result: '7,000,000.200'
   * formatNumber(7000000.2, { needSeperate: false }) // result: '7000000.20'
   */
  needSeperate?: boolean
  /**
   * @default 3
   * @example
   * formatNumber(10000.2) // result: '10,000.200'
   * formatNumber(10000.1234, { groupSize: 4 }) // result: '1,0000.123400'
   */
  groupSize?: number
  /**
   * how many fraction number. (if there is noting, 0 will be added )
   * @default 2
   * @example
   * formatNumber(100.2, { maxDecimalCount: 3 }) // result: '100.200'
   * formatNumber(100.2, { maxDecimalCount: 'auto' }) // result: '100.2'
   * formatNumber(100.1234, { maxDecimalCount: 6 }) // result: '100.123400'
   */
  maxDecimalCount?: number
  /**
   * how many fraction number. (if there is noting, 0 will be added )
   * @default 'fixed'
   * @example
   * formatNumber(100.2, { maxDecimalCount: 3, decimalMode: 'trim' }) // result: '100.2'
   * formatNumber(100.2, { maxDecimalCount: 'auto', decimalMode: 'trim' }) // result: '100.2'
   * formatNumber(100.1234, { maxDecimalCount: 6, decimalMode: 'trim' }) // result: '100.1234'
   */
  decimalMode?: 'fixed' | 'trim'

  /**
   * if true, always use shorter expression
   * if set this, only max 1 digit
   * @default false
   * @example
   * formatNumber(1000000000, { useShorterExpression: false }) // result: '1,000,000,000'
   * formatNumber(1100000000, { useShorterExpression: true }) // result: '1.1B'
   * formatNumber(1000300, { useShorterExpression: true }) // result: '1M'
   * formatNumber(1020, { useShorterExpression: true }) // result: '1K'
   * formatNumber(102000, { useShorterExpression: true }) // result: '102K'
   * formatNumber(102.2344, { useShorterExpression: true }) // result: '102.2'
   */
  useShorterExpression?: boolean
}

/**
 * to formated number string
 * @example
 * formatNumber(undefined) // '0'
 * formatNumber(7000000.2) // result: '7,000,000.20'
 * formatNumber(8800.1234, { seperator: '', maxDecimalCount: 6 }) // result: '8,800.123400'
 * formatNumber(100.1234, { maxDecimalCount: 3 }) // result: '100.123'
 */
export default function formatNumber(
  n: Numberish | null | undefined,
  {
    groupSeparator = ',',
    maxDecimalCount = 2,
    groupSize = 3,
    decimalMode = 'fixed',
    needSeperate = true,
    useShorterExpression
  }: FormatOptions = {}
): string {
  if (n === undefined) return '0'
  return fall(n, [
    (n) => toString(n),
    (n) => toFixed(n, maxDecimalCount),
    (n) => (decimalMode === 'fixed' ? n : trimTailingZero(n)),
    (str) => {
      if (useShorterExpression) {
        const [, sign = '', int = '', dec = ''] =
          (str.match(/(-?)(\d*)\.?(\d*)/) as [any, string | undefined, string | undefined, string | undefined]) ?? []
        if (int.length > 3 * 4) {
          return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 4 + 2)) / 100).toFixed(1))}T`
        } else if (int.length > 3 * 3) {
          return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 3 + 2)) / 100).toFixed(1))}B`
        } else if (int.length > 3 * 2) {
          return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 2 + 2)) / 100).toFixed(1))}M`
        } else if (int.length > 3 * 1) {
          return `${sign}${trimTailingZero((Number(int.slice(0, -3 * 1 + 2)) / 100).toFixed(1))}K`
        } else {
          return dec ? `${sign}${int}.${dec}` : `${sign}${int}`
        }
      } else if (needSeperate) {
        const [, sign = '', int = '', dec = ''] =
          (str.match(/(-?)(\d*)\.?(\d*)/) as [any, string | undefined, string | undefined, string | undefined]) ?? []
        const newIntegerPart = [...int].reduceRight((acc, cur, idx, strN) => {
          const indexFromRight = strN.length - 1 - idx
          const shouldAddSeparator = indexFromRight !== 0 && indexFromRight % groupSize! === 0
          return cur + (shouldAddSeparator ? groupSeparator : '') + acc
        }, '') as string
        return dec ? `${sign}${newIntegerPart}.${dec}` : `${sign}${newIntegerPart}`
      } else {
        return str
      }
    }
  ])
}
/**
 * parse a string
 *
 * it a function that reverse the result of {@link formatNumber}
 * @param numberString a string represent a number. e.g. -70,000.050
 * @deprecated
 * @example
 * parseFormatedNumberString('-70,000.050') // result: -70000.05
 */
export function parseFormatedNumberString(numberString: string): number {
  const pureNumberString = [...numberString].reduce((acc, char) => acc + (/\d|\.|-/.test(char) ? char : ''), '')
  return Number(pureNumberString)
}
