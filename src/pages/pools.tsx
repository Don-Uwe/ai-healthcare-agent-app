import { useEffect } from 'react'
import { useAppStore } from '../store'
import { usePoolStore } from '../features/Pools/usePoolStore'
import Pools from '../features/Pools'

function PoolsPage() {
  const loadPairInfoAct = usePoolStore((s) => s.loadPairInfoAct)
  const raydium = useAppStore((s) => s.raydium)

  useEffect(() => {
    if (!raydium) return
    loadPairInfoAct()
  }, [raydium])

  return <Pools />
}

export default PoolsPage
