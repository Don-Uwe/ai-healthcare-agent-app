/**
 *
 * Stop when document hidden
 */
export function startLazyIntervalTask(cb: () => void, duration: number /* ms */): { stop(): void } {
  const { isVisiable, stop } = checkDocumentVisibility()
  const timeid = setInterval(() => {
    if (isVisiable()) cb()
  }, duration)
  const stopInterval = () => {
    stop()
    clearInterval(timeid)
  }
  return { stop: stopInterval }
}

export function checkDocumentVisibility() {
  let isDocumentContentVisiable = true
  function isVisiable() {
    return isDocumentContentVisiable
  }
  const handleVisibilityChange = () => {
    const visibilityState = document.visibilityState
    isDocumentContentVisiable = visibilityState === 'visible'
  }
  document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })
  const stop = () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  return { isVisiable, stop }
}
