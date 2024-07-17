import { useState, useEffect } from 'react'
import { useBreakpointValue } from '@chakra-ui/react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const useResponsive = (): ResponsiveState => {
  const [isClient, setIsClient] = useState(false)

  const isMobile = useBreakpointValue({ base: true, sm: false }) || false
  const isTablet = useBreakpointValue({ sm: true, md: false }) || false
  const isDesktop = useBreakpointValue({ md: true }) || false

  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  if (!isClient) {
    return { isMobile: false, isTablet: false, isDesktop: false }
  }

  return { isMobile, isTablet, isDesktop }
}

export default useResponsive
