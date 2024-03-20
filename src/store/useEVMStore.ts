import { Connection } from '@solana/web3.js'
import { isClient } from '@/utils/common'
import createStore from './createStore'

interface EVNState {
  chainId: number
  connection?: Connection
  address?: string

  setChainIdAct: (chainId: number) => void
}

const CHAIN_CACHE_KEY = '_ray_chain_id_'

const evmInitState = {
  chainId: Number(isClient() ? localStorage.getItem(CHAIN_CACHE_KEY) || 1 : 1)
}

export const useEVMStore = createStore<EVNState>((set) => {
  return {
    ...evmInitState,
    setChainIdAct: (chainId) => {
      set({ chainId }, false, { type: 'setChainIdAct' })
      isClient() && localStorage.setItem(CHAIN_CACHE_KEY, chainId.toString())
    },
    reset: () => set(evmInitState)
  }
}, 'useEVMStore')
