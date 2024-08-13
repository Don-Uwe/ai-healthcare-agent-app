import { parseUserAgent } from 'react-device-detect'
import axios from './axios'
import { useAppStore } from '@/store/useAppStore'

interface EventTypeConnectWallet {
  walletName: string
  connectStatus: 'success' | 'userUnlink' | 'failure'
  type: 'connectWallet'
  // deviceType: 'pc' | 'mobile' | 'tablet'
  errorMsg?: string
}

export const sendWalletEvent = async (props: EventTypeConnectWallet) => {
  try {
    const deviceInfo = parseUserAgent(window.navigator.userAgent)
    const deviceType = deviceInfo.device.type || 'pc'
    axios.post(`${useAppStore.getState().urlConfigs.MONITOR_BASE_HOST}/event`, {
      ...props,
      deviceType
    })
  } catch {
    console.log('send event error')
  }
}
