import Decimal from 'decimal.js'
import i18n from '@/i18n'

export function formatLocaleStr(num?: string | number | Decimal, decimalPlace?: number) {
  if (num === null || num === undefined) return '-'
  const decimalNum = new Decimal(num || 0)
  const numStr = decimalNum.toFixed(decimalPlace || 0)
  const numArr = numStr.split('.')
  numArr[0] = numArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return trimTrailZero(numArr.join('.'))
}

export interface FormatDecimalParams {
  val: number | string
  /** default is 8 */
  maxDigitCount?: number
}

export const formatToMaxDigit = ({ val, maxDigitCount = 8 }: FormatDecimalParams): string => {
  const valStr = String(val)
  const [int = '', decimal = ''] = valStr.split('.')
  const [intDigit, decimalDigitLength] = [int?.length || 1, decimal?.length || 0]
  const totalLength = intDigit + decimalDigitLength
  if (totalLength <= maxDigitCount) return String(val)
  const remainLength = Math.max(maxDigitCount - intDigit, 0)
  return `${int}.${decimal.slice(0, remainLength - 1)}`
}

export const trimTrailZero = (numberStr?: string) => {
  if (!numberStr || !numberStr.includes('.')) return numberStr
  const splitNum = numberStr.split('.')
  while (splitNum[1][splitNum[1].length - 1] === '0') splitNum[1] = splitNum[1].slice(0, -1)
  return splitNum[1].length ? `${splitNum[0]}.${splitNum[1]}` : splitNum[0]
}

export const numTransform = (value: any) => (isNaN(value) ? 0 : value)

const stringNumberRegex = /(-?)([\d,_]*)\.?(\d*)/
export function getFirstNonZeroDecimal(s: string) {
  let str = s
  if (s.indexOf('e') > 0) {
    str = new Decimal(s).toFixed(new Decimal(s).decimalPlaces())
  }
  const [, , , dec = ''] = str.match(stringNumberRegex) ?? []
  const index = dec.split('').findIndex((c) => Number(c) > 0)
  return index + 1
}

/**
 *
 * @example
 * trimTailingZero('-33.33000000') //=> '-33.33'
 * trimTailingZero('-33.000000') //=> '-33'
 * trimTailingZero('.000000') //=> '0'
 * @deprecated
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

export const isIntlNumberFormatSupported = typeof Intl == 'object' && Intl && typeof Intl.NumberFormat == 'function'

/**
 *
 * @example
 * formatToRawLocaleStr(6553.83766) // locale en: 6553.83766, locale es:6553,83766
 * formatToRawLocaleStr(1.2%) // locale en:1.2%, locale es:1,2%
 */
export function formatToRawLocaleStr(val: string | number | undefined): string | number {
  const locale = i18n.language
  if (!val) {
    return ''
  }
  const decimalSeparator = isIntlNumberFormatSupported
    ? new Intl.NumberFormat(locale).formatToParts(0.1).find((part) => part.type === 'decimal')?.value || '.'
    : '.'
  return decimalSeparator !== '.' ? val.toString().replace('.', decimalSeparator) : val
}

export interface FormatCurrencyParams {
  noDecimal?: boolean
  symbol?: string
  abbreviated?: boolean
  decimalPlaces?: number
  maximumDecimalTrailingZeroes?: number
}

const subscriptNumbers: string[] = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
function toSubscript(number: number): string {
  return number
    .toString()
    .split('')
    .map((digit) => subscriptNumbers[parseInt(digit, 10)])
    .join('')
}
function formatSmallNumberWithFixed(number: number, fixedDigits: number): number {
  const [base, exponent] = number.toExponential().split('e')
  const baseFixed = parseFloat(base).toFixed(fixedDigits)
  return parseFloat(`${baseFixed}e${exponent}`)
}

function formatWithAbbreviation(value: number, numDecimals: number) {
  const thresholds = [
    { sign: 'T', value: 1e12 },
    { sign: 'B', value: 1e9 },
    { sign: 'M', value: 1e6 },
    { sign: 'K', value: 1e3 }
  ]
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i].value) {
      const abbreviatedValue = trimTrailZero((value / thresholds[i].value).toFixed(numDecimals))
      return `${abbreviatedValue}${thresholds[i].sign}`
    }
  }
  return trimTrailZero(value.toFixed(numDecimals)) || ''
}

// Function to transform decimal trailing zeroes to exponent
function decimalTrailingZeroesToExponent(formattedCurrency: string, maximumDecimalTrailingZeroes: number): string {
  const decimalTrailingZeroesPattern = new RegExp(`(\\.|,)(0{${maximumDecimalTrailingZeroes + 1},})(?=[1-9]?)`)
  return formattedCurrency.replace(
    decimalTrailingZeroesPattern,
    (_match, separator, decimalTrailingZeroes) => `${separator}0${toSubscript(decimalTrailingZeroes.length)}`
  )
}

function formatCurrencyOverride(formattedCurrency: string, maximumDecimalTrailingZeroes?: number): string {
  if (typeof maximumDecimalTrailingZeroes !== 'undefined') {
    formattedCurrency = decimalTrailingZeroesToExponent(formattedCurrency, maximumDecimalTrailingZeroes)
  }
  return formattedCurrency
}

function generateFallbackFormatter(
  symbol: string | undefined,
  abbreviated: boolean,
  numDecimals: number
): { format: (value: number) => string } {
  return {
    format: (value: number): string => {
      const formattedValue = abbreviated ? formatWithAbbreviation(value, numDecimals) : formatLocaleStr(value, numDecimals)
      return symbol ? `${symbol}${formattedValue}` : `${formattedValue}`
    }
  }
}

function generateIntlNumberFormatter(locale: string, symbol: string | undefined, abbreviated: boolean, numDecimals: number) {
  const params: Intl.NumberFormatOptions = {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: numDecimals
  }
  const formatter = new Intl.NumberFormat(locale, params)

  return {
    format: (value: number) => {
      let formattedValue = formatter.format(value)
      if (abbreviated) {
        const matches = formatWithAbbreviation(value, numDecimals).match(/^(\d+(?:\.\d+)?)([TBMK]?)$/)
        if (matches) {
          const [, numericPart, sign] = matches
          formattedValue = `${formatter.format(parseFloat(numericPart))}${sign}`
        }
      }
      return symbol ? `${symbol}${formattedValue}` : formattedValue
    }
  }
}

function generateFormatter(locale: string, symbol: string | undefined, abbreviated: boolean, numDecimals = 2) {
  return isIntlNumberFormatSupported
    ? generateIntlNumberFormatter(locale, symbol, abbreviated, numDecimals)
    : generateFallbackFormatter(symbol, abbreviated, numDecimals)
}

/**
 * @example
 * formatCurrency(1.83, { noDecimal: true }) // '2'
 * formatCurrency(0.00000000089912, {maximumDecimalTrailingZeroes: 5}) // result is '0.0₉8991';
 * formatCurrency(0.00000000089912, {symbol: '$', maximumDecimalTrailingZeroes: 5}) // result is '$0.0₉8991';
 * formatCurrency(0.00000000000000655383766, { symbol: '$', maximumDecimalTrailingZeroes: 5 } ) // result is $0.0₁₄6554
 * formatCurrency(1000.12345, {decimalPlaces: 3}) // "1,000.123";
 * formatCurrency(3220.12345, { symbol: '$', decimalPlaces: 3 }) // $3,220.123
 * formatCurrency(6553.83766, { symbol: '$',abbreviated:true, decimalPlaces: 3 }) // $6.554k
 * formatCurrency(0.00000000089912, { maximumDecimalTrailingZeroes: 5}) // locale:'es' result is '0,0₉8991';
 * formatCurrency(0.00000000089912, { symbol: '$', maximumDecimalTrailingZeroes: 5}) // locale:'es' result is '$0,0₉8991';
 * formatCurrency(1000.12345, { decimalPlaces: 3}) // locale:'es' result is "1.000,123";
 * formatCurrency(3220.12345, { symbol: '$', decimalPlaces: 3 }) // locale:'es' resultis  $3.220,123
 * formatCurrency(6553.83766, { symbol: '$',abbreviated:true, decimalPlaces: 3 }) // locale:'es' result is $6.554k
 */
export function formatCurrency(amount?: string | number | Decimal, params: FormatCurrencyParams = {}): string {
  const locale = i18n.language
  const { noDecimal = false, symbol, abbreviated = false, decimalPlaces, maximumDecimalTrailingZeroes } = params
  if (!amount) {
    return '0'
  }
  const amountDecimal = amount instanceof Decimal ? amount : new Decimal(String(amount).replace(/,/gi, ''))
  const amountNumber = amountDecimal.toNumber()
  const amountString = amountDecimal.toFixed()
  const currencyFormatterNoDecimal: { format: (value: number) => string } = generateFormatter(locale, symbol, abbreviated, 0)

  if (noDecimal === true && amountNumber > 1) {
    return formatCurrencyOverride(currencyFormatterNoDecimal.format(amountNumber))
  }
  if (Object.prototype.hasOwnProperty.call(params, 'decimalPlaces')) {
    const currencyFormatterCustom = generateFormatter(locale, symbol, abbreviated, decimalPlaces)
    return formatCurrencyOverride(currencyFormatterCustom.format(amountNumber), maximumDecimalTrailingZeroes)
  }

  if (amountNumber === 0.0) {
    return amountNumber.toFixed(0)
  } else if (amountNumber >= 1000) {
    // Large, show no decimal value
    return formatCurrencyOverride(currencyFormatterNoDecimal.format(amountNumber))
  } else if (amountNumber >= 50 && amountNumber < 1000) {
    // Medium, show 3 fraction digits
    const currencyFormatterMedium: { format: (value: number) => string } = generateFormatter(locale, symbol, abbreviated, 3)
    return formatCurrencyOverride(currencyFormatterMedium.format(amountNumber), maximumDecimalTrailingZeroes)
  } else if (amountNumber >= 0.000001 && amountNumber < 50) {
    // show 6 fraction digits
    const currencyFormatterSmall: { format: (value: number) => string } = generateFormatter(locale, symbol, abbreviated, 6)
    return formatCurrencyOverride(currencyFormatterSmall.format(amountNumber), maximumDecimalTrailingZeroes)
  } else if (amountNumber >= 10 ** -9 && amountNumber < 10 ** -6) {
    // show 12 fraction digits
    const currencyFormatterVeryVerySmall: { format: (value: number) => string } = generateFormatter(locale, symbol, abbreviated, 12)
    return formatCurrencyOverride(
      currencyFormatterVeryVerySmall.format(formatSmallNumberWithFixed(amountNumber, 3)),
      maximumDecimalTrailingZeroes
    )
  } else {
    // too small show all fraction digits
    const digitsAfterPoint = amountString.length - 2
    const currencyFormatterTooSmall: { format: (value: number) => string } = generateFormatter(
      locale,
      symbol,
      abbreviated,
      digitsAfterPoint
    )
    return formatCurrencyOverride(
      currencyFormatterTooSmall.format(formatSmallNumberWithFixed(amountNumber, 3)),
      maximumDecimalTrailingZeroes
    )
  }
}
