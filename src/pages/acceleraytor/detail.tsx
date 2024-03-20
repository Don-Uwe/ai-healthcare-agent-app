import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAppStore } from '@/store/useAppStore'
import { useIdoStore } from '@/features/Ido/useIdoStore'
import Detail from '@/features/Ido/Detail/Detail'

function IdoPage() {
  const raydium = useAppStore((s) => s.raydium)
  const { query = {} } = useRouter()
  const idoId = query.idoId as string
  const [loadIdoListAct] = useIdoStore((s) => [s.loadIdoListAct])

  useEffect(() => {
    if (!raydium && useIdoStore.getState().idoHydratedList.length > 0) return
    loadIdoListAct()
  }, [loadIdoListAct, raydium])

  useEffect(() => () => useIdoStore.setState({ currentIdo: undefined }), [])
  return <Detail />
}

export default IdoPage
