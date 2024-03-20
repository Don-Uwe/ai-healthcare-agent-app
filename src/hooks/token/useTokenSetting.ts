import { useAppStore, useTokenStore } from '@/store'
import { useEffect } from 'react'
import shallow from 'zustand/shallow'

export default function useTokenSetting() {
  const displayTokenSettings = useAppStore((s) => s.displayTokenSettings)
  const [setDisplayTokenListAct, loadTokensAct] = useTokenStore((s) => [s.setDisplayTokenListAct, s.loadTokensAct], shallow)

  useEffect(() => {
    setDisplayTokenListAct()
  }, [displayTokenSettings, setDisplayTokenListAct])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadTokensAct(true)
    }, 60 * 1000 * 5)
    return () => clearInterval(intervalId)
  }, [loadTokensAct])
}
