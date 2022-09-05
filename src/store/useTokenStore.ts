import { TokenJson, SplToken } from '@raydium-io/raydium-sdk'
import createStore from './createStore'
import { useAppStore } from './useAppStore'

interface TokenStore {
  tokenList: TokenJson[]
  tokenMap: Map<string, SplToken>
  tokenMintList: { official: string[]; unOfficial: string[] }
  loadTokensAct: (forceUpdate?: boolean) => void
}

const initTokenSate = {
  tokenList: [],
  tokenMap: new Map(),
  tokenMintList: { official: [], unOfficial: [] }
}

export const useTokenStore = createStore<TokenStore>(
  (set, get) => ({
    ...initTokenSate,
    loadTokensAct: (forceUpdate?: boolean) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      raydium.token.load({ forceUpdate: !!forceUpdate }).then(() => {
        set({
          tokenList: raydium.token.allTokens,
          tokenMap: raydium.token.allTokenMap,
          tokenMintList: raydium.token.tokenMints
        })
      })
    }
  }),
  'useTokenStore'
)
