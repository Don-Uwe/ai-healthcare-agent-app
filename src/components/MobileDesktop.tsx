import { useAppStore } from '@/store'
import { ReactNode } from 'react'

/**
 * chakra's `<Show>` is not react in time, so just use AppStore
 */
export function Desktop(props: { children: ReactNode }) {
  const isMobile = useAppStore((s) => s.isMobile)
  return isMobile ? null : <>{props.children}</>
}

/**
 * chakra's `<Show>` is not react in time, so just use AppStore
 */
export function Mobile(props: { children: ReactNode }) {
  const isMobile = useAppStore((s) => s.isMobile)
  return isMobile ? <>{props.children}</> : null
}
