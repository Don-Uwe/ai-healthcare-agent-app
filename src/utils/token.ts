import { TOKEN_WSOL, WSOLMint, SOLMint, ApiV3Token, SOL_INFO, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { sortItems } from '@/utils/sortItems'

export const wSolToSol = (key?: string): string | undefined => (key === WSOLMint.toBase58() ? SOLMint.toBase58() : key)
export const solToWSol = (key?: string): string | undefined => (key === SOLMint.toBase58() ? WSOLMint.toBase58() : key)
export const wSolToSolString = (name?: string) => (name ? name.replace(/WSOL/gi, 'SOL') : '')
export const solToWsolString = (name?: string) => (name ? name.replace(/^SOL/gi, 'WSOL') : '')

export const isSolWSol = (mint?: string | PublicKey) => {
  if (!mint) return false
  return mint.toString() === TOKEN_WSOL.address || mint.toString() === SOL_INFO.address
}

export const solToWSolToken = (token: ApiV3Token): ApiV3Token => {
  if (token.address === SOLMint.toBase58()) {
    return {
      ...token,
      address: TOKEN_WSOL.address,
      symbol: TOKEN_WSOL.symbol,
      name: TOKEN_WSOL.name
    }
  }
  return token
}

export const wsolToSolToken = (token: ApiV3Token): ApiV3Token => {
  if (token.address === WSOLMint.toBase58()) {
    return {
      ...token,
      address: SOL_INFO.address,
      symbol: SOL_INFO.symbol,
      name: SOL_INFO.name
    }
  }
  return token
}

export const getMintSymbol = ({ mint, transformSol }: { mint: ApiV3Token; transformSol?: boolean }) =>
  mint ? (transformSol ? wSolToSolString(mint.symbol) : mint.symbol) || mint.address.substring(0, 6) : ''

export const getMintName = ({ mint }: { mint: ApiV3Token }) => mint.name || mint.address.slice(0, 12)

export const RAY_TOKEN_INFO = {
  chainId: 101,
  address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  logoURI: 'https://img.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png',
  symbol: 'RAY',
  name: 'Raydium',
  decimals: 6,
  tags: [],
  extensions: {
    coingeckoId: 'raydium'
  },
  type: 'raydium',
  priority: 2
}

export const filterTokenFn = (list: TokenInfo[], params?: { searchStr?: string; skipFn?: (token: TokenInfo) => boolean }) => {
  const { searchStr, skipFn } = params || {}
  const searchText = searchStr ? searchStr.trim().toLocaleLowerCase() : ''
  let filteredList = [...list]
  if (searchText) {
    const tokenGroup: TokenInfo[][] = []
    list.forEach((data) => {
      if (skipFn?.(data) || tokenGroup[0]) return

      if (searchText === data.address.toLocaleLowerCase()) {
        tokenGroup[0] = [data]
        return
      }
      if (searchText === data.symbol.toLocaleLowerCase()) {
        tokenGroup[1] = [...(tokenGroup[1] || []), data]
        return
      }
      const idx = data.symbol.toLocaleLowerCase().indexOf(searchText)
      if (idx > -1) {
        tokenGroup[idx + 2] = [...(tokenGroup[idx + 2] || []), data].sort((a, b) => b.priority - a.priority)
      }
    })
    tokenGroup[1] = tokenGroup[1]
      ? sortItems(tokenGroup[1], {
          sortRules: [{ value: (i) => i.type === 'raydium' }]
        })
      : tokenGroup[1]
    filteredList = tokenGroup.flat().filter(Boolean)
  }
  return filteredList
}
