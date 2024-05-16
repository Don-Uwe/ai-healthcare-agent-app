import { SOL_INFO } from '@raydium-io/raydium-sdk-v2'
import { useAppStore } from '@/store'
import axios from '@/api/axios'
import { SolanaFeeInfoJson } from '@/type'

export interface ComputeBudgetConfig {
  units?: number
  microLamports?: number
}

export const fetchComputePrice = async () => {
  try {
    const res = (await axios.get(`https://solanacompass.com/api/fees?cacheFreshTime=${5 * 60 * 1000}`, {
      timeout: 3 * 1000,
      skipError: true
    })) as SolanaFeeInfoJson
    return res
  } catch {
    return undefined
  }
}

export async function getComputeBudgetConfig(): Promise<ComputeBudgetConfig | undefined> {
  const transactionFee = useAppStore.getState().getPriorityFee()
  if (isNaN(parseFloat(String(transactionFee) || ''))) {
    const json = await fetchComputePrice()
    const { avg } = json?.[15] ?? {}
    if (!avg) return undefined
    return {
      units: 600000,
      microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
    } as ComputeBudgetConfig
  } else {
    return {
      units: 600000,
      microLamports: Math.ceil((Number(transactionFee as string) * 10 ** SOL_INFO.decimals * 1000000) / 600000)
    } as ComputeBudgetConfig
  }
}
