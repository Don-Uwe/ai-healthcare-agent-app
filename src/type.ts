import { RaydiumApiBatchRequestParams } from '@raydium-io/raydium-sdk-v2'

export type SSRData = Omit<RaydiumApiBatchRequestParams, 'api'>
export type ValueOf<T> = T[keyof T]

interface SolanaFeeInfo {
  min: number
  max: number
  avg: number
  priorityTx: number
  nonVotes: number
  priorityRatio: number
  avgCuPerBlock: number
  blockspaceUsageRatio: number
}

export type SolanaFeeInfoJson = {
  '1': SolanaFeeInfo
  '5': SolanaFeeInfo
  '15': SolanaFeeInfo
}
