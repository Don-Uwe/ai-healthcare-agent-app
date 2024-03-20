import { useAppStore } from '@/store'
import { ReactNode } from 'react'

export default function MobileDesktop(props: {
  mobile?: ReactNode
  pc?: ReactNode
  /** props:children is an shortcut of props:pc */
  children?: ReactNode
}) {
  return (
    <>
      <Desktop>{props.pc ?? props.children}</Desktop>
      <Mobile>{props.mobile}</Mobile>
    </>
  )
}

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
