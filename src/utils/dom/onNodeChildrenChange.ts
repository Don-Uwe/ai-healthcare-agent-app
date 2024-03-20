export function onNodeChildrenChange(observeNode: HTMLElement, cb: () => void): { cancel(): void } {
  const observer = new MutationObserver(cb)
  observer.observe(observeNode, { childList: true, subtree: true })
  return {
    cancel() {
      observer.disconnect()
    }
  }
}
