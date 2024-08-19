import axios from './axios'
import { useAppStore } from '@/store/useAppStore'

interface CheckTxResponse {
  id: string
  success: boolean
  msg?: string
}

export const validateTxData = async (txData: string[]): Promise<CheckTxResponse> => {
  try {
    const data: CheckTxResponse = await axios.post(
      `${useAppStore.getState().urlConfigs.SERVICE_1_BASE_HOST}/check-tx`,
      {
        data: txData
      },
      {
        skipError: true
      }
    )
    return data
  } catch (err: any) {
    return {
      id: '',
      success: false,
      msg: err.message || 'validate tx failed'
    }
  }
}
