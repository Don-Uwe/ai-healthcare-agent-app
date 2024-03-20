import { ProviderMessage, ProviderRpcError, ProviderConnectInfo, RequestArguments } from 'hardhat/types'

export interface EthereumEvent {
  connect: ProviderConnectInfo
  disconnect: ProviderRpcError
  accountsChanged: Array<string>
  chainChanged: string
  message: ProviderMessage
}

type EventKeys = keyof EthereumEvent
type EventHandler<K extends EventKeys> = (event: EthereumEvent[K]) => void

export interface Ethereumish {
  autoRefreshOnNetworkChange: boolean
  chainId: string
  isMetaMask?: boolean

  /** below is based on injected wallets */
  isTrust?: boolean
  isTrustWallet?: boolean
  isOpera?: boolean
  isBraveWallet?: boolean
  isMathWallet?: boolean
  isTokenPocket?: boolean
  isSafePal?: boolean
  isCoin98?: boolean
  isBlocto?: boolean

  isStatus?: boolean
  networkVersion: string
  selectedAddress: any

  on<K extends EventKeys>(event: K, eventHandler: EventHandler<K>): void
  enable(): Promise<any>
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>
  /**
   * @deprecated
   */
  send?: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => void
  sendAsync: (request: RequestArguments) => Promise<unknown>
}

declare global {
  interface Window {
    ethereum: Ethereumish
    BinanceChain?: any
    coin98?: boolean
  }
  declare const __DEV__: string
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipRetry?: boolean
    skipError?: boolean
  }
}
