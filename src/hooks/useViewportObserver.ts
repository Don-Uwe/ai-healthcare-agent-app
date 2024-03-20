import { useEffect } from 'react'
import { useEvent } from './useEvent'

/**
 * only itself(ref)
 *
 * this hooks build on assumption: resize of a child will resize his parent. so just observe it's parent node.
 *
 * @param ref
 * @param callback
 */
export default function useViewportObserver(callback?: (utilities: { w: number; height: number }) => void) {
  const invokeCallback = useEvent(() => {
    callback?.({ w: window.innerWidth, height: window.innerHeight })
  })
  useEffect(() => {
    document.addEventListener('resize', invokeCallback)
    invokeCallback()
    return () => {
      document.removeEventListener('resize', invokeCallback)
    }
  }, [])
}
