import { formatNumber } from './formatter'

export type ToPercentStringOptions = {
  /** by default, it will output <0.01% if it is too small   */
  exact?: boolean
  /** @default 2  */
  decimals?: number
  /** maybe backend will, but it's freak
   * @default true
   */
  alreadyPercented?: boolean
  /** usually used in price */
  alwaysSigned?: boolean
  // TODO:
  maxBoundary?: number
  // TODO:
  minBoundary?: number
  notShowZero?: boolean
}

/**
 * @example
 * toPercentString('58', { fixed: 2 }) //=> '58.00%'
 * toPercentString(58) //=> '58.00%'
 * toPercentString(.58, {alreadyPercented: false}) //=> '58.00%'
 */
export default function toPercentString(n: string | number | undefined, options?: ToPercentStringOptions): string {
  try {
    if (n == null) return '--'
    const stringPart = (Number(n) * (options?.alreadyPercented ?? true ? 1 : 100)).toFixed(options?.decimals ?? 2)
    if ((n === 0 || n === '0') && !options?.notShowZero) return '0%'
    if (!options?.exact && stringPart === (0).toFixed(options?.decimals ?? 2)) return options?.alwaysSigned ? '<+0.01%' : '<0.01%'
    return options?.alwaysSigned
      ? `${getSign(stringPart)}${formatNumber.format(Number(getUnsignNumber(stringPart)))}%`
      : `${formatNumber.format(Number(stringPart), options?.decimals)}%`
  } catch (err) {
    return '0%'
  }
}

export function getSign(n: string | number | undefined): '+' | '-' | '' {
  return n ? (String(n)[0] !== '-' ? '+' : '-') : ''
}

function getUnsignNumber(s: string | number | undefined): string {
  if (s == null) return ''
  return Number(s) > 0 ? String(s) : String(s).slice(1)
}

export const toTotalPercent = (numerator: number, denominator: number) => {
  return parseFloat(((numerator / (denominator || 1)) * 100).toFixed(2))
}
