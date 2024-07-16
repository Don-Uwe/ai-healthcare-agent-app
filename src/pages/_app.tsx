import { getCookie } from 'cookies-next'
import type { AppContext, AppProps } from 'next/app'
import App from 'next/app'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import Decimal from 'decimal.js'
import { isLocal } from '../utils/common'

import i18n from '../i18n'
import { isClient } from '../utils/common'
import '@/components/Toast/toast.css'
import '@/components/LandingPage/components/tvl.css'
import '@/components/LandingPage/liquidity.css'
import 'react-day-picker/dist/style.css'

const DynamicProviders = dynamic(() => import('@/provider').then((mod) => mod.Providers))
const DynamicContent = dynamic(() => import('@/components/Content'))
const DynamicAppNavLayout = dynamic(() => import('@/components/AppLayout/AppNavLayout'))

const CONTENT_ONLY_PATH = ['/', '404', '/docs/disclaimer', '/moonpay']
const OVERFLOW_HIDDEN_PATH = ['/liquidity-pools']

Decimal.set({ precision: 1e3 })

const MyApp = ({ Component, pageProps, lng, ...props }: AppProps & { lng: string }) => {
  const { pathname } = useRouter()

  const [onlyContent, overflowHidden] = useMemo(
    () => [CONTENT_ONLY_PATH.includes(pathname), OVERFLOW_HIDDEN_PATH.includes(pathname)],
    [pathname]
  )

  // if (isLocal()) {
  //   const lang = lng || (getCookie('i18nextLng') as string) || 'en'
  //   i18n.changeLanguage(lang)
  // }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="twitter:image" content="https://img-v1.raydium.io/share/7be7ee6c-56b2-451e-a010-6c21e0db2ee5.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RaydiumProtocol" />
        <meta name="twitter:creator" content="@RaydiumProtocol" />
        <meta name="twitter:title" content="Raydium" />
        <meta name="twitter:description" content="An on-chain order book AMM powering the evolution of DeFi " />
        <meta property="og:description" content="An on-chain order book AMM powering the evolution of DeFi " />
        <meta property="og:url" content="https://raydium.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://img-v1.raydium.io/share/7be7ee6c-56b2-451e-a010-6c21e0db2ee5.png" />
        <meta property="og:image:alt" content="Raydium" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content="Raydium" />
        <meta property="og:title" content="Swap | Raydium" />
        <title>{pageProps.title ? `${pageProps.title} Raydium` : 'Raydium'}</title>
      </Head>
      <DynamicProviders>
        <DynamicContent {...props}>
          {onlyContent ? (
            <Component {...pageProps} />
          ) : (
            <DynamicAppNavLayout overflowHidden={overflowHidden}>
              <Component {...pageProps} />
            </DynamicAppNavLayout>
          )}
        </DynamicContent>
      </DynamicProviders>
    </>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  if (isClient()) return {}
  try {
    const ctx = await App.getInitialProps(appContext)
    let lng = getCookie('i18nextLng', { req: appContext.ctx.req, res: appContext.ctx.res }) as string
    lng = lng || 'en'
    i18n.changeLanguage(lng)

    return ctx
  } catch (err) {
    return {}
  }
}

export default MyApp
