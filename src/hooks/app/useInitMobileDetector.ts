import { useEffect } from 'react'
import { useDeviceInfoDetector } from '../useMobileDetector'
import { useAppStore } from '@/store'

export default function useInitMobileDetector() {
  const { isMobile, isDesktop } = useDeviceInfoDetector()
  useEffect(() => {
    useAppStore.setState({ isMobile })
  }, [isMobile])
  useEffect(() => {
    useAppStore.setState({ isDesktop })
  }, [isDesktop])
}
