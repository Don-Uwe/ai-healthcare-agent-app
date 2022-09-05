import { PublicKeyish, BigNumberish, Percent, GetAmountOutReturn } from '@raydium-io/raydium-sdk'
import { createStore, useAppStore } from '@/store'

interface SwapStore {
  slippage: number
  computing: boolean
  computedSwapResult: GetAmountOutReturn | null
  computeSwapAmountAct: (params: ComputeParams) => Promise<void>
}

export interface ComputeParams {
  inputMint: PublicKeyish
  outputMint: PublicKeyish
  amount: BigNumberish
}

const initSwapState = {
  computing: false,
  computedSwapResult: null,
  slippage: 1
}

export const useSwapStore = createStore<SwapStore>(
  (set, get) => ({
    ...initSwapState,

    computeSwapAmountAct: async (params: ComputeParams) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return

      const action = { type: 'computeSwapAmountAct' }
      const { inputMint, outputMint, amount } = params
      const { routedPools } = await raydium.trade.getAvailablePools(params)
      if (amount === '') {
        set(() => ({ computing: false, computedSwapResult: null }), false, action)
        return
      }

      set({ computing: true }, false, action)
      const slippage = get().slippage
      const computedSwapResult = await raydium.trade.getBestAmountOut({
        pools: routedPools, // optional, pass only if called getAvailablePools
        amountIn: raydium.decimalAmount({ mint: inputMint, amount: amount })!,
        inputToken: raydium.mintToToken(inputMint),
        outputToken: raydium.mintToToken(outputMint),
        slippage: new Percent(slippage, 100) // means 1 percent
      })

      set({ computedSwapResult, computing: false }, false, action)
    },
    swapTokenAct: async (params: { inputMint: PublicKeyish; amount: BigNumberish }) => {
      const raydium = useAppStore.getState().raydium
      const computedSwapResult = get().computedSwapResult
      if (!raydium || !computedSwapResult) return

      const { inputMint, amount } = params
      const { execute, transactions } = await raydium.trade.swap({
        routes: computedSwapResult.routes,
        routeType: computedSwapResult.routeType,
        amountIn: raydium.mintToTokenAmount({ mint: inputMint, amount })!,
        amountOut: computedSwapResult.minAmountOut,
        fixedSide: 'in'
      })
      // await execute()
      set({ computedSwapResult: null }, false, { type: 'swapTokenAct' })
    }
  }),
  'useSwapStore'
)
