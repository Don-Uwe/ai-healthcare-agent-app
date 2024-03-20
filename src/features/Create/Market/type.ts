import { TokenInfo } from '@raydium-io/raydium-sdk-v2'

export interface FormValue {
  baseToken?: TokenInfo
  quoteToken?: TokenInfo
  orderSize: string
  priceTick: string
}
