import { useEffect } from 'react'
import { useDiviceInfoDetector } from '../useMobileDetector'
import { useAppStore } from '@/store'

export default function useInitMobileDetector() {
  const { isMobile, isLaptop } = useDiviceInfoDetector()
  useEffect(() => {
    useAppStore.setState({ isMobile })
  }, [isMobile])
  useEffect(() => {
    useAppStore.setState({ isLaptop })
  }, [isLaptop])
}
