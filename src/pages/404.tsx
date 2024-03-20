import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Page404() {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [])

  return null
}
