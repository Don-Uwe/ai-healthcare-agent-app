export interface ApiSwapV1OutError {
  id: string
  success: false
  version: 'V0' | 'V1'
  msg: string
  openTime?: number
  data: undefined
}
export interface ApiSwapV1OutSuccess {
  id: string
  success: true
  version: 'V0' | 'V1'
  openTime?: undefined
  msg: undefined
  data: {
    swapType: 'BaseIn' | 'BaseOut'
    inputMint: string
    inputAmount: string
    outputMint: string
    outputAmount: string
    otherAmountThreshold: string
    slippageBps: number
    priceImpactPct: number
    routePlan: {
      poolId: string
      inputMint: string
      outputMint: string
      feeMint: string
      feeRate: number
      feeAmount: string
    }[]
  }
}

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
