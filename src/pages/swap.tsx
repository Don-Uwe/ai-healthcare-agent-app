import { useEffect } from 'react'
import { useLiquidityStore, useAppStore } from '../store'
import Swap from '../features/Swap'

function SwapPage() {
  const loadPoolsAct = useLiquidityStore((s) => s.loadPoolsAct)
  const raydium = useAppStore((s) => s.raydium)

  useEffect(() => {
    if (!raydium) return
    loadPoolsAct()
  }, [raydium])

  return <Swap />
}

export default SwapPage
