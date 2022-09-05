import { useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useAppStore } from '@/store/useAppStore'
import shallow from 'zustand/shallow'
import { RaydiumApiBatchRequestParams } from '@raydium-io/raydium-sdk'

function useInitConnection(props: Omit<RaydiumApiBatchRequestParams, 'api'>) {
  const { connection } = useConnection()
  const { publicKey, signAllTransactions } = useWallet()
  const { initRaydiumAct, raydium } = useAppStore(
    (s) => ({
      initRaydiumAct: s.initRaydiumAct,
      raydium: s.raydium
    }),
    shallow
  )

  useEffect(() => {
    // raydium sdk initialization can be done with connection only
    if (connection) {
      initRaydiumAct({ owner: publicKey || undefined, connection, signAllTransactions, ...props })
    }
  }, [initRaydiumAct, connection])

  useEffect(() => {
    // if user connected wallet, update pubk
    if (raydium) {
      raydium.setOwner(publicKey || undefined)
      raydium.setSignAllTransactions(signAllTransactions)
      useAppStore.setState({ connected: !!publicKey }, false, 'useInitConnection')
    }
  }, [raydium, publicKey, signAllTransactions])
}

export default useInitConnection
