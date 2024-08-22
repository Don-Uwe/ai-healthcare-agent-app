import { PublicKey } from '@solana/web3.js'
import { MintLayout, RawMint } from '@solana/spl-token'
import { TokenInfo, JupTokenType, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import createStore from './createStore'
import { useAppStore } from './useAppStore'
import { getStorageItem, setStorageItem } from '@/utils/localStorage'
import logMessage from '@/utils/log'
export const EXTRA_TOKEN_KEY = '_r_cus_t_'

export interface TokenPrice {
  value: number
}

export interface TokenStore {
  tokenList: TokenInfo[]
  displayTokenList: TokenInfo[]
  tokenMap: Map<string, TokenInfo>
  tokenPriceRecord: Map<
    string,
    {
      fetchTime: number
      data?: TokenPrice
    }
  >
  mintGroup: { official: Set<string>; jup: Set<string> }
  extraLoadedTokenList: TokenInfo[]
  whiteListMap: Set<string>

  loadTokensAct: (forceUpdate?: boolean, jupTokenType?: JupTokenType) => void
  setDisplayTokenListAct: () => void
  setExtraTokenListAct: (props: { token: TokenInfo; addToStorage?: boolean; update?: boolean }) => void
  unsetExtraTokenListAct: (token: TokenInfo) => void

  getChainTokenInfo: (mint: string | PublicKey) => Promise<RawMint | undefined>
  getTokenDecimal: (mint: string | PublicKey, tokenInfo?: RawMint) => Promise<number>
  isVerifiedToken: (props: { mint: string | PublicKey; tokenInfo?: ApiV3Token; useWhiteList?: boolean }) => Promise<boolean>
}

const initTokenSate = {
  tokenList: [],
  displayTokenList: [],
  extraLoadedTokenList: [],
  tokenMap: new Map(),
  tokenPriceRecord: new Map(),
  mintGroup: { official: new Set<string>(), jup: new Set<string>() },
  whiteListMap: new Set<string>()
}

export const cachedTokenInfo: Map<string, RawMint> = new Map()

const createMarketWhiteList = [
  { mint: 'Fishy64jCaa3ooqXw7BHtKvYD8BTkSyAPh6RNE3xZpcN', decimals: 6, is2022Token: false },
  { mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', decimals: 8, is2022Token: false },
  { mint: '33eWALS9GkzSMS3EsKSdYCsrUiMdQDgX2QzGx4vA9wE8', decimals: 8, is2022Token: false },
  { mint: 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6', decimals: 6, is2022Token: false },
  { mint: 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr', decimals: 6, is2022Token: false }
]

export const blackJupMintSet = new Set(['GinNabffZL4fUj9Vactxha74GDAW8kDPGaHqMtMzps2f'])

export const setTokenToStorage = (token: TokenInfo) => {
  const storageTokenList: (TokenInfo & { time?: number })[] = JSON.parse(getStorageItem(EXTRA_TOKEN_KEY) || '[]')
  if (storageTokenList.some((t) => t.address === token.address)) return
  try {
    setStorageItem(
      EXTRA_TOKEN_KEY,
      JSON.stringify(
        storageTokenList.concat([
          {
            ...token,
            time: Date.now()
          }
        ])
      )
    )
  } catch {
    console.warn('local storage exceed')
  }
}

export const unsetTokenToStorage = (token: TokenInfo) => {
  const storageTokenList: TokenInfo[] = JSON.parse(getStorageItem(EXTRA_TOKEN_KEY) || '[]')
  setStorageItem(EXTRA_TOKEN_KEY, JSON.stringify(storageTokenList.filter((t) => t.address !== token.address)))
}

export const getStorageToken = (mint: string): TokenInfo | undefined => {
  const storageTokenList: (TokenInfo & { time?: number })[] = JSON.parse(getStorageItem(EXTRA_TOKEN_KEY) || '[]')
  const cacheInfo = storageTokenList.find((t) => t.address === mint)
  return cacheInfo
}

export const useTokenStore = createStore<TokenStore>(
  (set, get) => ({
    ...initTokenSate,
    loadTokensAct: (forceUpdate?: boolean, jupTokenType?: JupTokenType) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const action = { type: 'loadTokensAct' }
      const type = jupTokenType || JupTokenType.Strict

      useAppStore.setState({ jupTokenType: type }, false, action)

      const update = !!forceUpdate || useAppStore.getState().jupTokenType !== type
      raydium.token.load({ forceUpdate: update, type }).then(() => {
        get().extraLoadedTokenList.forEach((t) => {
          const existed = raydium.token.tokenMap.has(t.address)
          if (!existed) {
            raydium.token.tokenList.push(t)
            raydium.token.tokenMap.set(t.address, t)
            raydium.token.mintGroup.official.add(t.address)
          }
        })
        const tokenMap = new Map(Array.from(raydium.token.tokenMap))
        const tokenList = (JSON.parse(JSON.stringify(raydium.token.tokenList)) as TokenInfo[])
          .filter((t) => {
            if (blackJupMintSet.has(t.address)) {
              tokenMap.delete(t.address)
              raydium.token.tokenMap.delete(t.address)
              raydium.token.mintGroup.jup.delete(t.address)
              return false
            }
            return true
          })
          .map((t) => {
            if (t.type === 'jupiter') {
              const newInfo = { ...t, logoURI: t.logoURI ? `https://wsrv.nl/?w=48&h=48&url=${t.logoURI}` : t.logoURI }
              tokenMap.set(t.address, newInfo)
              return newInfo
            }
            return t
          })
        set(
          {
            tokenList,
            tokenMap,
            mintGroup: raydium.token.mintGroup,
            whiteListMap: new Set(Array.from(raydium.token.whiteListMap))
          },
          false,
          action
        )
        get().setDisplayTokenListAct()
      })
    },

    setDisplayTokenListAct: () => {
      const { raydium, displayTokenSettings, jupTokenType } = useAppStore.getState()
      if (!raydium) return
      const isJupAll = jupTokenType === JupTokenType.ALL
      set(
        {
          displayTokenList: get().tokenList.filter((token) => {
            return (
              (displayTokenSettings.official && get().mintGroup.official.has(token.address)) ||
              (displayTokenSettings.jup && raydium.token.mintGroup.jup.has(token.address) && (isJupAll || !token.tags.includes('unknown')))
            )
          })
        },
        false,
        { type: 'setDisplayTokenListAct' }
      )
    },
    setExtraTokenListAct: ({ token, addToStorage = true, update }) => {
      const { tokenList, tokenMap, mintGroup, extraLoadedTokenList, setDisplayTokenListAct } = get()

      if (tokenMap.has(token.address) && !update) return
      tokenMap.set(token.address, token)
      mintGroup.official.add(token.address)

      set({
        tokenList: tokenList.some((t) => t.address === token.address)
          ? tokenList.map((t) => (t.address === token.address ? token : t))
          : [...tokenList, token],
        tokenMap: new Map(Array.from(tokenMap)),
        mintGroup: {
          official: new Set(Array.from(mintGroup.official)),
          jup: mintGroup.jup
        },
        extraLoadedTokenList: extraLoadedTokenList.some((t) => t.address === token.address)
          ? extraLoadedTokenList.map((t) => (t.address === token.address ? token : t))
          : [...extraLoadedTokenList, token]
      })
      setDisplayTokenListAct()
      if (addToStorage && token.type === 'unknown') setTokenToStorage(token)
    },
    unsetExtraTokenListAct: (token) => {
      const { tokenList, tokenMap, mintGroup, extraLoadedTokenList, setDisplayTokenListAct } = get()
      if (!get().tokenMap.has(token.address)) return
      tokenMap.set(token.address, { ...token, userAdded: false })
      set({
        tokenList: [...tokenList.map((t) => (t.address === token.address ? { ...token, userAdded: false } : t))],
        tokenMap: new Map(Array.from(tokenMap)),
        mintGroup: {
          official: new Set(Array.from(mintGroup.official)),
          jup: mintGroup.jup
        },
        extraLoadedTokenList: extraLoadedTokenList.filter((t) => t.address !== token.address)
      })
      setDisplayTokenListAct()
      unsetTokenToStorage(token)
    },
    getChainTokenInfo: async (mint) => {
      const cacheData = cachedTokenInfo.get(mint.toString())
      if (cacheData) return cacheData
      const connection = useAppStore.getState().connection
      if (!connection) return
      logMessage('rpc: get token info')
      const accountData = await connection.getAccountInfo(new PublicKey(mint), { commitment: useAppStore.getState().commitment })
      if (!accountData || accountData.data.length !== MintLayout.span) return
      const tokenInfo = MintLayout.decode(accountData.data)
      cachedTokenInfo.set(mint.toString(), tokenInfo)
      return tokenInfo
    },
    getTokenDecimal: async (mint, tokenInfo) => {
      const { tokenMap, getChainTokenInfo } = get()
      const token = tokenMap.get(mint.toString())
      if (tokenInfo) return tokenInfo.decimals
      if (token) return token.decimals
      const info = await getChainTokenInfo(mint.toString())
      return info?.decimals ?? 0
    },

    isVerifiedToken: async ({ mint, tokenInfo, useWhiteList = false }) => {
      const { getChainTokenInfo, mintGroup } = get()
      const mintStr = mint.toString()
      const tokenData = tokenInfo ? undefined : await getChainTokenInfo(mint)
      if (!tokenData) return false
      const isWhiteList = useWhiteList && createMarketWhiteList.some((d) => d.mint === mint)
      const isFreezed = !isWhiteList && (tokenInfo?.tags.includes('hasFreeze') || tokenData?.freezeAuthorityOption === 1)

      const isAPIToken = mintGroup.official.has(mintStr) || mintGroup.jup.has(mintStr)
      if (tokenData.decimals !== null && !isAPIToken && isFreezed) return false

      return true
    }
  }),
  'useTokenStore'
)
