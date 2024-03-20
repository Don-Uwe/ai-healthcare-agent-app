import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

export type NewRewardInfo = {
  id: string
  token?: ApiV3Token
  amount?: string
  farmStart?: number
  farmEnd?: number
  perWeek?: string
  error?: string
  isValid: boolean
}
