import { startTransition, useEffect } from 'react'

export default function useTransitionedEffect(effect: () => any, dependenceList?: any[]) {
  useEffect(() => {
    startTransition(() => {
      effect()
    })
  }, dependenceList)
}
