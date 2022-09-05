import create, { Mutate, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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
) => create<T, MiddleWares>(devtools(immer(fn), name ? { name } : undefined))

export default createStore
