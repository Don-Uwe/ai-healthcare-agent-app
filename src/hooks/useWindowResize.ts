import { useEffect, useState, useMemo } from 'react'
import { debounce } from '@/utils/functionMethods'

export default function useWindowResize(delay?: number) {
  const [size, setSize] = useState([0, 0])
  const debounceUpdate = useMemo(() => debounce(() => setSize([window.innerWidth, window.innerHeight]), delay || 100), [delay])
  useEffect(() => {
    const getSize = () => {
      debounceUpdate()
    }
    getSize()
    window.addEventListener('resize', getSize)
    return () => window.removeEventListener('resize', getSize)
  }, [debounceUpdate])

  return size
}
