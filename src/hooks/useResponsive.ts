import { useBreakpointValue } from '@chakra-ui/react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const useResponsive = (): ResponsiveState => {
  const isMobile = useBreakpointValue({ base: true, sm: false }) || false
  const isTablet = useBreakpointValue({ sm: true, md: false }) || false
  const isDesktop = useBreakpointValue({ md: true }) || false

  return { isMobile, isTablet, isDesktop }
}
export default useResponsive
