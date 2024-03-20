import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { skipRetryStatus } from '@/api/axios'
import WalletProvider from './WalletProvider'
import ThemeProvider from './ThemeProvider'
import GlobalColorProvider from './GlobalColorProvider'

export { WalletProvider, ThemeProvider, GlobalColorProvider }

const timeoutId: Record<string, number> = {}
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
      value={{
        onErrorRetry: (error, key, config, revalidate, { retryCount: apiRetryCount }) => {
          if (skipRetryStatus.has(error.response?.status)) return
          const is429 = error.message?.indexOf('429') !== -1
          if (apiRetryCount >= 10) return

          // Retry after 5 seconds.
          timeoutId[key] && clearTimeout(timeoutId[key])
          timeoutId[key] = window.setTimeout(() => revalidate({ retryCount: apiRetryCount }), is429 ? apiRetryCount * 1000 : 5000)
        }
      }}
    >
      <ThemeProvider>
        <GlobalColorProvider>
          <WalletProvider>{children}</WalletProvider>
        </GlobalColorProvider>
      </ThemeProvider>
    </SWRConfig>
  )
}
