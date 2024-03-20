import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useIdoStore } from '@/features/Ido/useIdoStore'
import Ido from '@/features/Ido'

function IdoPage() {
  const raydium = useAppStore((s) => s.raydium)
  const loadIdoListAct = useIdoStore((s) => s.loadIdoListAct)

  useEffect(() => {
    if (!raydium) return
    loadIdoListAct()
  }, [raydium, loadIdoListAct])
  return <Ido />
}

export default IdoPage
