import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import shallow from 'zustand/shallow'

export default function useRefreshEpochInfo() {
  const [getEpochInfo, epochInfo, connection] = useAppStore((s) => [s.getEpochInfo, s.epochInfo, s.connection], shallow)
  useEffect(() => {
    getEpochInfo()
    const id = window.setInterval(() => {
      getEpochInfo()
    }, 60 * 1000)
    return () => window.clearInterval(id)
  }, [connection])

  return epochInfo
}
