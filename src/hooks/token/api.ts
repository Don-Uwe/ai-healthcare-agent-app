import { DEV_API_URLS, TokenInfo, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import axios from '@/api/axios'
import { PublicKey, Connection } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getMint } from '@solana/spl-token'

import { useAppStore } from '@/store/useAppStore'

export const cacheTokenInfoMap = new Map<string, TokenInfo>()
export const addTokenInfoCache = (data: (TokenInfo | ApiV3Token)[]) =>
  data.map((token) =>
    cacheTokenInfoMap.set(token.address, {
      priority: 3,
      ...token
    })
  )

export const getTokenInfo = async ({
  mint,
  forceReload,
  connection,
  programId = TOKEN_PROGRAM_ID,
  notFetchOnline
}: {
  mint: string | PublicKey
  forceReload?: boolean
  connection?: Connection
  programId?: string | PublicKey
  notFetchOnline?: boolean
}): Promise<TokenInfo | undefined> => {
  if (!forceReload) {
    const cacheInfo = cacheTokenInfoMap.get(mint.toString())
    if (cacheInfo) return new Promise((resolve) => resolve(cacheInfo))
  }

  try {
    const { data } = await axios.get<TokenInfo>(
      DEV_API_URLS.BASE_HOST + useAppStore.getState().urlConfigs.TOKEN_INFO.replace('{mint}', mint.toString()),
      { skipError: true }
    )
    data.priority = 1
    data.type = 'raydium'

    if (data) cacheTokenInfoMap.set(data.address, data)

    if (!data && connection && !notFetchOnline) {
      const onlineData = await getMint(connection, new PublicKey(mint), 'confirmed', new PublicKey(programId))
      const mintAddress = mint.toString()
      if (onlineData) {
        const res = {
          chainId: 101,
          address: mintAddress,
          programId: '',
          logoURI: '',
          symbol: mintAddress.slice(0, 6),
          name: mintAddress.slice(0, 6),
          decimals: onlineData.decimals,
          tags: [],
          extensions: {},
          priority: 1,
          type: 'unknown'
        }
        cacheTokenInfoMap.set(mint.toString(), res)
        return res
      }
    }

    return data
  } catch {
    return new Promise((resolve) => resolve(undefined))
  }
}
