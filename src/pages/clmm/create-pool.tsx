import { useClmmStore, useAppStore } from '@/store'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const CreatePool = dynamic(() => import('@/features/Create/ClmmPool'))

function CreatePoolPage() {
  const raydium = useAppStore((s) => s.raydium)
  const fetchAmmConfigsAct = useClmmStore((s) => s.fetchAmmConfigsAct)

  useEffect(() => {
    if (!raydium) return
    fetchAmmConfigsAct()
  }, [raydium, fetchAmmConfigsAct])

  return <CreatePool />
}

export default CreatePoolPage
