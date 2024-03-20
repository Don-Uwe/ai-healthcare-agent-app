import { useEffect, useState } from 'react'

type WindowDimentions = {
  width: number | undefined
  height: number | undefined
  isMobile: boolean
}

const useWindowDimensions = (): WindowDimentions => {
  const mobileWidth = 768
  const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>({
    width: undefined,
    height: undefined,
    isMobile: false
  })
  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth > mobileWidth ? false : true
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return (): void => window.removeEventListener('resize', handleResize)
  }, [])

  return windowDimensions
}

export default useWindowDimensions
