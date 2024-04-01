import Decimal from 'decimal.js'
import { ToVolumeOption, toVolume } from './autoSuffixNumberish'

/**
 *
 * @todo Nuumberish should  just accept `number | string | bigint`
 */
export default function toUsdVolume(amount: number | string | Decimal | undefined, options?: ToVolumeOption) {
  if (amount == null) return '--'
  if (!amount) return '$0'
  return `$${toVolume(amount, options)}`
}
