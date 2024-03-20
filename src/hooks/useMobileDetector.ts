// import { useBreakpointValue } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'
import { isClient } from '@/utils/common'

const maxMobileWidth = 768
const maxLaptopWidth = 1440

// you can see https://vscode.dev/github/chakra-ui/chakra-ui for more detail
export function useDiviceInfoDetector() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLaptop, setIsLaptop] = useState(false)
  const calcViewport = () => {
    if (isClient()) {
      const screenWidth = globalThis.innerWidth
      const isMobile = screenWidth < maxMobileWidth
      setIsMobile(isMobile)
      const isLaptop = screenWidth >= maxMobileWidth && screenWidth < maxLaptopWidth
      setIsLaptop(isLaptop)
    }
  }
  useEffect(() => {
    window.addEventListener('resize', calcViewport)
    return () => window.removeEventListener('resize', calcViewport)
  }, [])

  useIsomorphicLayoutEffect(() => {
    calcViewport()
  }, [])
  return { isMobile, isLaptop }
}
