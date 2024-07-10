import { loadMoonPay } from '@moonpay/moonpay-js'
import { Box } from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'

export default function Moonpay(props: { children: ReactNode }) {
  const [moonPaySdk, setMoonPaySdk] = useState(undefined as any)
  useEffect(() => {
    if (moonPaySdk) {
      return
    }
    loadMoonPay().then((data) => {
      if (!data) {
        return null
      }
      const moonPaySdk = data({
        flow: 'buy',
        environment: 'sandbox',
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
  }, [moonPaySdk])

  return (
    <Box cursor="pointer" onClick={() => moonPaySdk?.show()}>
      {props.children}
    </Box>
  )
}
