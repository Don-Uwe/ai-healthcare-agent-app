import { loadMoonPay } from '@moonpay/moonpay-js'
import { Box } from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'

export function MoonpayBuy(props: { children: ReactNode }) {
  const [moonPaySdk, setMoonPaySdk] = useState(undefined as any)
  useEffect(() => {
    if (moonPaySdk) {
      return
    }
    loadMoonPay()
      .then((data) => {
        if (!data) {
          return null
        }
        const moonPaySdk = data({
          flow: 'buy',
          environment: 'production',
          variant: 'overlay',
          params: {
            apiKey: process.env.NEXT_PUBLIC_MOON_PAY_KEY ?? '',
            theme: 'dark',
            baseCurrencyCode: 'usd',
            baseCurrencyAmount: '100',
            defaultCurrencyCode: 'sol'
          }
        })
        setMoonPaySdk(moonPaySdk)
      })
      .catch((error) => {
        console.log('Error loading MoonPay SDK:', error)
      })
  }, [moonPaySdk])

  return (
    <Box cursor="pointer" onClick={() => moonPaySdk?.show()}>
      {props.children}
    </Box>
  )
}

export function MoonpaySell(props: { children: ReactNode }) {
  const [moonPaySdk, setMoonPaySdk] = useState(undefined as any)
  useEffect(() => {
    if (moonPaySdk) {
      return
    }
    loadMoonPay()
      .then((data) => {
        if (!data) {
          return null
        }
        const moonPaySdk = data({
          flow: 'sell',
          environment: 'production',
          variant: 'overlay',
          params: {
            apiKey: process.env.NEXT_PUBLIC_MOON_PAY_KEY ?? '',
            theme: 'dark',
            quoteCurrencyCode: 'usd',
            baseCurrencyAmount: '1',
            defaultBaseCurrencyCode: 'sol'
          }
        })
        setMoonPaySdk(moonPaySdk)
      })
      .catch((error) => {
        console.log('Error loading MoonPay SDK:', error)
      })
  }, [moonPaySdk])

  return (
    <Box cursor="pointer" onClick={() => moonPaySdk?.show()}>
      {props.children}
    </Box>
  )
}
