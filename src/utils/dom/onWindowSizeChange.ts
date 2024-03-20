export function onWindowSizeChange(cb: () => void): { cancel: () => void } {
  const rAFcallback = () => {
    requestAnimationFrame(cb)
  }
  window.addEventListener('resize', rAFcallback)
  return {
    cancel() {
      window.removeEventListener('resize', rAFcallback)
    }
  }
}
