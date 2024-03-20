import { useEffect, useState } from 'react'

import { throbounce } from '@/utils/functionMethods'

function useScroll() {
  const [pageYOffset, setPageYOffset] = useState(0)
  const [isScrollup, setIsScrollup] = useState(false)

  const handleScroll = () => {
    setPageYOffset((p) => {
      p > window.pageYOffset ? setIsScrollup(true) : setIsScrollup(false)
      return window.pageYOffset
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', throbounce(handleScroll, 200), { passive: true })

    return () => {
      window.removeEventListener('scroll', throbounce(handleScroll, 200))
    }
  }, [])

  return { pageYOffset, isScrollup }
}

export default useScroll
