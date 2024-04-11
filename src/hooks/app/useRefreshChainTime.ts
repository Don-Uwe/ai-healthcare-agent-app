import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

function useRefreshChainTime() {
  const [fetchChainTimeAct, fetchBlockSlotCountAct, raydium] = useAppStore((s) => [
    s.fetchChainTimeAct,
    s.fetchBlockSlotCountAct,
    s.raydium
  ])

  useEffect(() => {
    if (!raydium) return
    const interval = window.setInterval(() => {
      fetchChainTimeAct()
    }, 1000 * 60 * 5)
    return () => window.clearInterval(interval)
  }, [fetchChainTimeAct, raydium])

  useEffect(() => {
    if (!raydium) return
    // fetchBlockSlotCountAct()
    const interval = window.setInterval(() => {
      fetchBlockSlotCountAct()
    }, 1000 * 60 * 1)

    return () => window.clearInterval(interval)
  }, [fetchBlockSlotCountAct, raydium])
  return null
}

export default useRefreshChainTime
