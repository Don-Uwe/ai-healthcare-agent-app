import { useAppStore } from '@/store/useAppStore'
import { ReactNode } from 'react'

function ConnectedOnly({ children }: { children: ReactNode }) {
  const connected = useAppStore((s) => s.connected)
  return connected ? <>{children}</> : null
}

export default ConnectedOnly
