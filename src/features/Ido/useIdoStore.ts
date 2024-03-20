import { createStore, useAppStore } from '@/store'

export interface TokenStore {
  idoHydratedList: any[]
  idoHydratedMap: Map<string, any>
  currentIdo?: any

  loadIdoListAct: (forceUpdate?: boolean) => void
}

const initTokenSate = {
  idoHydratedList: [],
  idoHydratedMap: new Map()
}

export const useIdoStore = createStore<TokenStore>(
  () => ({
    ...initTokenSate,
    loadIdoListAct: (forceUpdate?: boolean) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      // raydium.ido.load(forceUpdate).then(() => {
      //   set({
      //     idoHydratedList: raydium.ido.idoData.hydratedList,
      //     idoHydratedMap: new Map(raydium.ido.idoData.hydratedList.map((ido) => [ido.id, ido]))
      //   })
      // })
    }
  }),
  'useIdoStore'
)
