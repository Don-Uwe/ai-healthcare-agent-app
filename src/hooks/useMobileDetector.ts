// import { useBreakpointValue } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import { isClient } from '@/utils/common'
const maxMobileWidth = 768
const maxLaptopWidth = 1440
// you can see https://vscode.dev/github/chakra-ui/chakra-ui for more detail
export function useDeviceInfoDetector() {
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const calcViewport = () => {
    if (isClient()) {
      const screenWidth = globalThis.innerWidth
      const isMobile = screenWidth < maxMobileWidth
      setIsMobile(isMobile)
      const isDesktop = screenWidth >= maxMobileWidth && screenWidth < maxLaptopWidth
      setIsDesktop(isDesktop)
    }
  }
  useEffect(() => {
    window.addEventListener('resize', calcViewport)
    return () => window.removeEventListener('resize', calcViewport)
  }, [])
  useIsomorphicLayoutEffect(() => {
    calcViewport()
  }, [])
  return { isMobile, isDesktop }
}
