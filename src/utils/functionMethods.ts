export function debounce(func: (params?: any) => void, delay?: number) {
  let timer: number | null = null

  return (params?: any) => {
    timer && clearTimeout(timer)
    timer = window.setTimeout(() => {
      func(params)
    }, delay || 250)
  }
}

export function throttle(func: () => void, delay = 250) {
  let lastTime = 0

  return () => {
    const triggerTime = Date.now()

    if (triggerTime - lastTime > delay) {
      func()
      lastTime = triggerTime
    }
  }
}

export function throbounce(func: () => void, delay = 250) {
  let timer: number | null = null
  let lastTime = 0

  return () => {
    const triggerTime = Date.now()

    if (triggerTime - lastTime > delay) {
      // throttle
      func()
      lastTime = triggerTime
    } else {
      // debounce
      timer && clearTimeout(timer)
      timer = window.setTimeout(() => {
        lastTime = triggerTime
        clearTimeout(timer!)
        func()
      }, delay)
    }
  }
}

export function throttleTrigger(func: () => void, delay = 250) {
  let lastTime = 0
  let timer: number | undefined = undefined

  return () => {
    const triggerTime = Date.now()
    if (timer) clearTimeout(timer)

    if (triggerTime - lastTime > delay) {
      func()
      lastTime = triggerTime
      return
    }

    timer = window.setTimeout(() => {
      func()
      lastTime = Date.now()
    }, delay)
  }
}

/**
 * simple but useful shortcut
 */
export function tryCatch<T>(tryFunction: () => T, catchFunction?: (err: unknown) => T): T {
  try {
    return tryFunction()
  } catch (err) {
    // @ts-expect-error force
    return catchFunction?.(err)
  }
}

// SERENDIPITY: looks like this is Promise then chain
// Ask so, why not just use promise.prototype.then()？
// because the value can't get syncly
export function fall<T, F1 extends (arg: T) => any>(n: T, actions: [F1]): ReturnType<F1>
export function fall<T, F1 extends (arg: T) => any, F2 extends (arg: ReturnType<F1>) => any>(n: T, actions: [F1, F2]): ReturnType<F2> // fixme: why type not work properly?
export function fall<T, F1 extends (arg: T) => any, F2 extends (arg: ReturnType<F1>) => any, F3 extends (arg: ReturnType<F2>) => any>(
  n: T,
  actions: [F1, F2, F3]
): ReturnType<F3>
export function fall<
  T,
  F1 extends (arg: T) => any,
  F2 extends (arg: ReturnType<F1>) => any,
  F3 extends (arg: ReturnType<F2>) => any,
  F4 extends (arg: ReturnType<F3>) => any
>(n: T, actions: [F1, F2, F3, F4]): ReturnType<F4>
export function fall<
  T,
  F1 extends (arg: T) => any,
  F2 extends (arg: ReturnType<F1>) => any,
  F3 extends (arg: ReturnType<F2>) => any,
  F4 extends (arg: ReturnType<F3>) => any,
  F5 extends (arg: ReturnType<F4>) => any
>(n: T, actions: [F1, F2, F3, F4, F5]): ReturnType<F5>
export function fall(n: any, actions: any[]) {
  return actions.reduce((value, action) => action(value), n)
}

export function exhaustCall<T>(func: ((params?: T) => Promise<void>) | ((params?: T) => void)) {
  let executing = false

  return async (params?: T) => {
    if (executing) return
    executing = true
    await func(params)
    executing = false
  }
}
