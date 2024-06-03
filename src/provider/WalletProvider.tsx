import { FC, PropsWithChildren, useEffect } from 'react'
import React, { useMemo, useState } from 'react'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { SolflareWalletAdapter } from '@solflare-wallet/wallet-adapter'
import {
  PhantomWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
  WalletConnectWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
  CoinbaseWalletAdapter,
  SolongWalletAdapter,
  Coin98WalletAdapter,
  SafePalWalletAdapter,
  BitpieWalletAdapter,
  BitgetWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { useAppStore, defaultNetWork, defaultEndpoint } from '../store/useAppStore'

const App: FC<PropsWithChildren<any>> = ({ children }) => {
  const [network] = useState<WalletAdapterNetwork>(defaultNetWork)
  const rpcNodeUrl = useAppStore((s) => s.rpcNodeUrl)
  const wsNodeUrl = useAppStore((s) => s.wsNodeUrl)
  // const [endpoint] = useState<string>(defaultEndpoint)
  const [endpoint, setEndpoint] = useState<string>(rpcNodeUrl || defaultEndpoint)

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      ...(typeof window === 'undefined' ? [] : [new SolflareWalletAdapter()]),
      new SlopeWalletAdapter({ endpoint }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: network as WalletAdapterNetwork.Mainnet,
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PJ_ID,
          metadata: {
            name: 'Raydium',
            description: 'Raydium',
            url: 'https://raydium.io/',
            icons: ['https://raydium.io/logo/logo-only-icon.svg']
          }
        }
      }),
      new GlowWalletAdapter(),
      new TrustWalletAdapter(),
      new MathWalletAdapter({ endpoint }),
      new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter({ endpoint }),
      new SolongWalletAdapter({ endpoint }),
      new Coin98WalletAdapter({ endpoint }),
      new SafePalWalletAdapter({ endpoint }),
      new BitpieWalletAdapter({ endpoint }),
      new BitgetWalletAdapter({ endpoint }),
      new ExodusWalletAdapter({ endpoint })
    ],
    [network, endpoint]
  )

  useEffect(() => {
    if (rpcNodeUrl) setEndpoint(rpcNodeUrl)
  }, [rpcNodeUrl])

  return (
    <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true, wsEndpoint: wsNodeUrl }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
