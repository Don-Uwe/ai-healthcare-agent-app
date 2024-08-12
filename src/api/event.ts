import { parseUserAgent } from 'react-device-detect'
import axios from './axios'
import { debounce } from '@/utils/functionMethods'

interface EventTypeConnectWallet {
  walletName: string
  connectStatus: 'success' | 'userUnlink' | 'failure'
  type: 'connectWallet'
  // deviceType: 'pc' | 'mobile' | 'tablet'
}

export const sendWalletEvent = debounce(async (props: EventTypeConnectWallet) => {
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
})
