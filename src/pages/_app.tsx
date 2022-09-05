import type { FC, PropsWithChildren } from 'react'
import { memo } from 'react'
import type { AppProps, AppContext } from 'next/app'
import App from 'next/app'

import { WalletProvider, ThemeProvider } from '../provider'
import useInitConnection from '../hooks/useInitConnection'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Api, RaydiumApiBatchRequestParams } from '@raydium-io/raydium-sdk'
import LRU from 'lru-cache'

// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css')

type SSRData = Omit<RaydiumApiBatchRequestParams, 'api'>

const Content: FC<PropsWithChildren<SSRData>> = memo(({ children, ...props }) => {
  useInitConnection(props)
  return <>{children}</>
})

const MyApp = ({ Component, pageProps, defaultApiTokens, defaultApiLiquidityPools }: AppProps & SSRData) => {
  return (
    <WalletProvider>
      <ThemeProvider>
        <Content defaultApiTokens={defaultApiTokens} defaultApiLiquidityPools={defaultApiLiquidityPools}>
          <WalletMultiButton />
          <Component {...pageProps} />
        </Content>
      </ThemeProvider>
    </WalletProvider>
  )
}

const ssrCache = new LRU({
  max: 500,
  ttl: 1000 * 60 * 10 // 5 mins
})

MyApp.getInitialProps = async (appContext: AppContext) => {
  try {
    const ctx = await App.getInitialProps(appContext)
    const api = new Api({ cluster: 'mainnet', timeout: 10 * 1000 })

    let [defaultApiTokens, defaultApiLiquidityPools] = [ssrCache.get('defaultApiTokens'), ssrCache.get('defaultApiLiquidityPools')]
    if (!defaultApiTokens) {
      defaultApiTokens = await api.getTokens()
      ssrCache.set('defaultApiTokens', defaultApiTokens)
    }

    if (!defaultApiLiquidityPools) {
      defaultApiLiquidityPools = await api.getLiquidityPools()
      ssrCache.set('defaultApiLiquidityPools', defaultApiLiquidityPools)
    }

    return { ...ctx, defaultApiTokens, defaultApiLiquidityPools }
  } catch {
    return { defaultApiTokens: [], defaultApiLiquidityPools: [] }
  }
}

export default MyApp
