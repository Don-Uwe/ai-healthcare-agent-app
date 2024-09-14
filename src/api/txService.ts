import axios from './axios'
import { useAppStore } from '@/store/useAppStore'
import { parseUserAgent } from 'react-device-detect'
interface CheckTxResponse {
  id: string
  success: boolean
  msg?: string
}

export const validateTxData = async (props: { data: string[]; preData: string[]; userSignTime: number }): Promise<CheckTxResponse> => {
  try {
    const { rpcs, rpcNodeUrl } = useAppStore.getState()
    const deviceInfo = parseUserAgent(window.navigator.userAgent)
    const deviceType = deviceInfo.device.type || 'pc'
    const data: CheckTxResponse = await axios.post(
      `${useAppStore.getState().urlConfigs.SERVICE_1_BASE_HOST}/check-tx`,
      {
        walletName: useAppStore.getState().wallet?.adapter.name || 'unknown',
        deviceType,
        rpc: rpcs.find((r) => r.url === rpcNodeUrl)?.name || 'userChange',
        ...props
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

interface TxExtendResponse {
  id: string
  success: boolean
  data: string[]
  msg?: string
}
export const extendTxData = async (txData: string[]): Promise<TxExtendResponse> => {
  try {
    const data: TxExtendResponse = await axios.post(
      `${useAppStore.getState().urlConfigs.SERVICE_1_BASE_HOST}/ins-extend`,
      {
        walletName: useAppStore.getState().wallet?.adapter.name || 'unknown',
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
      data: [],
      success: false,
      msg: err.message || 'extend tx failed'
    }
  }
}
