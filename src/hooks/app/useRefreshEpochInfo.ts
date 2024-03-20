import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { retry } from '@/utils/common'

export default function useRefreshEpochInfo() {
  const getEpochInfo = useAppStore((s) => s.getEpochInfo)

  useEffect(() => {
    if (!useAppStore.getState().epochInfo) {
      retry(getEpochInfo)
    }
    const interval = window.setInterval(getEpochInfo, 1000 * 60)
    return () => window.clearInterval(interval)
  }, [getEpochInfo])

  return null
}
