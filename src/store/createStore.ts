import create, { Mutate, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const storeResetter: {
  name?: string
  reset: (replaceState?: Record<string, any>) => void
}[] = []

// e.g. resetAllStore({ useAppStore: { raydium: useAppStore.getState().raydium, rpcNodeUrl: 'https://xxx' } })
export const resetAllStore = (props?: { [key: string]: Record<string, any> }) => {
  storeResetter.forEach((f) => f.reset(f.name && props ? props[f.name] : undefined))
}

declare type Get<T, K, F = never> = K extends keyof T ? T[K] : F

type MiddleWares = [['zustand/devtools', never], ['zustand/immer', never]]
const createStore = <T>(
  fn: (
    setState: Get<Mutate<StoreApi<T>, MiddleWares>, 'setState', undefined>,
    getState: Get<Mutate<StoreApi<T>, MiddleWares>, 'getState', undefined>,
    store: Mutate<StoreApi<T>, MiddleWares>,
    $$storeMutations: MiddleWares
  ) => T,
  name?: string
) => {
  const store = create<T, MiddleWares>(
    devtools(
      immer((set, get, store, $$storeMutations) => {
        // this function is to add log to redux dev tool
        const logSet: Get<Mutate<StoreApi<T>, MiddleWares>, 'setState', undefined> = (nextStateOrUpdater, shouldReplace, action) => {
          let objAct = action || {}
          objAct = typeof objAct === 'string' ? { type: objAct } : objAct
          return set(nextStateOrUpdater, shouldReplace, { ...(objAct || { type: 'unknown' }), payload: nextStateOrUpdater } as any)
        }

        return fn(logSet, get, store, $$storeMutations)

        // maybe need while try to catch all tx
        // const storeState = fn(logSet, get, store, $$storeMutations)
        // const newState = { ...storeState }

        // /* eslint-disable */
        // /* @ts-ignore */
        // Object.keys(newState).forEach((key) => {
        //   /* @ts-ignore */
        //   if (typeof newState[key] === 'function') {
        //     /* @ts-ignore */
        //     newState[key] = (...props: any) => {
        //       if (key.indexOf('Act') !== -1) console.log(12312311, 'call', key)
        //       /* @ts-ignore */
        //       return storeState[key].bind({})(...props)
        //     }
        //   }
        // })
        // /* eslint-enable */
        // return newState
      }),

      name ? { name } : undefined
    )
  )
  const initState = store.getState()
  storeResetter.push({
    name,
    reset: (replaceState?: Record<string, any>) => {
      store.setState({ ...initState, ...(replaceState || {}) }, true, { type: 'reset' })
    }
  })
  return store
}

export default createStore
