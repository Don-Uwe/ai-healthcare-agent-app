import { parseUserAgent } from 'react-device-detect'
import axios from './axios'

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
    axios.post('https://monitor.raydium.io/event', {
      ...props,
      deviceType
    })
  } catch {
    console.log('send event error')
  }
}
