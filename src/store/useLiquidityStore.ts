import { LiquidityPoolJsonInfo } from '@raydium-io/raydium-sdk'
import createStore from './createStore'
import { useAppStore } from './useAppStore'

interface LiquidityStore {
  poolList: LiquidityPoolJsonInfo[]
  poolMap: Map<string, LiquidityPoolJsonInfo>
  loadPoolsAct: (forceUpdate?: boolean) => void
}

const initLiquiditySate = {
  poolList: [],
  poolMap: new Map()
}

export const useLiquidityStore = createStore<LiquidityStore>(
  (set, get) => ({
    ...initLiquiditySate,
    loadPoolsAct: (forceUpdate?: boolean) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      raydium.liquidity.load({ forceUpdate: !!forceUpdate }).then(() => {
        set({
          poolList: raydium.liquidity.allPools,
          poolMap: raydium.liquidity.allPoolMap
        })
      })
    }
  }),
  'useLiquidityStore'
)
