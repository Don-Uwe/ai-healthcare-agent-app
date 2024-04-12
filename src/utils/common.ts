export const isClient = () => typeof window !== 'undefined'
export const isLocal = () => typeof window !== 'undefined' && window.location.host.includes('localhost')
export const isDocumentVisible = () => isClient() && document.visibilityState === 'visible'
export const isProdEnv = () => isClient() && window.location.host.includes('raydium.io')

export const encodeStr = (str?: string, showNum = 3, dotNum = 2) => {
  if (!str) return ''
  return [str.slice(0, showNum), '.'.repeat(dotNum), str.slice(-1 * showNum)].join('')
}

export const emptyFunc = () => {}

export const sleep = async (time?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({})
    }, time || 1000)
  })
}

const intervalRecord = new Set<number>()
export const idToIntervalRecord = new Map<string, number>()

export const retry = async <T>(
  fetcher: () => Promise<any>,
  options?: { id?: string; retryCount?: number; interval?: number; errorMsg?: string; sleepTime?: number; onError?: (msg?: string) => void }
): Promise<T> => {
  const { retryCount = 10, interval = 1000, errorMsg = 'request failed', sleepTime, onError } = options || {}
  let retryCounter = 0
  return new Promise(async (resolve, reject) => {
    if (sleepTime !== undefined) await sleep(sleepTime)
    fetcher()
      .then((res) => {
        resolve(res)
      })
      .catch(() => {
        const intervalId = window.setInterval(async () => {
          retryCounter++
          if (retryCounter > retryCount) {
            onError?.()
            clearInterval(intervalId)
            intervalRecord.delete(intervalId)
            reject(new Error(errorMsg))
          }
          try {
            const res = await fetcher()
            clearInterval(intervalId)
            intervalRecord.delete(intervalId)
            resolve(res)
          } catch (e: any) {
            if (e.message === 'tx failed') {
              onError?.(e.message)
              clearInterval(intervalId)
              intervalRecord.delete(intervalId)
              reject(new Error('tx failed'))
            }
          }
        }, interval)
        intervalRecord.add(intervalId)
        if (options?.id) idToIntervalRecord.set(options.id, interval)
      })
  })
}

export const cancelRetry = (id?: number) => {
  if (id) window.clearInterval(id)
}

export const cancelAllRetry = () => {
  Array.from(intervalRecord).forEach((i) => window.clearInterval(i))
}
