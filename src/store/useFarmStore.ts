import { FarmPoolJsonInfo, SdkParsedFarmInfo } from '@raydium-io/raydium-sdk'
import createStore from './createStore'
import { useAppStore } from './useAppStore'

interface FarmStore {
  farmPool: FarmPoolJsonInfo[]
  sdkParsedFarmInfo: SdkParsedFarmInfo[]
}

const initFarmSate = {
  farmPool: [],
  sdkParsedFarmInfo: []
}

export const useFarmStore = createStore<FarmStore>(
  (set, get) => ({
    ...initFarmSate,
    loadFarmAct: (forceUpdate?: boolean) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      raydium.farm.load({ forceUpdate: !!forceUpdate }).then(() => {
        set({
          farmPool: raydium.farm.allFarms,
          sdkParsedFarmInfo: raydium.farm.allParsedFarms
        })
      })
    }
  }),
  'useFarmStore'
)
