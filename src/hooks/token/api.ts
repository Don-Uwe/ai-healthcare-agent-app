import { DEV_API_URLS, TokenInfo, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import axios from '@/api/axios'
import { PublicKey, Connection, AccountInfo } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, unpackMint } from '@solana/spl-token'

import { useAppStore } from '@/store/useAppStore'

export const cacheTokenInfoMap = new Map<string, TokenInfo>()
export const addTokenInfoCache = (data: (TokenInfo | ApiV3Token)[]) =>
  data.map((token) =>
    cacheTokenInfoMap.set(token.address, {
      priority: 3,
      ...token
    })
  )

export const getOnlineTokenInfo = async ({
  mint,
  connection,
  programId = TOKEN_PROGRAM_ID
}: {
  mint: string | PublicKey
  connection?: Connection
  programId?: PublicKey | undefined
}): Promise<TokenInfo | undefined> => {
  try {
    if (connection) {
      const address = new PublicKey(mint)
      const info = await connection.getAccountInfo(address, 'confirmed')
      const space = (info as AccountInfo<Buffer> & { space?: number })?.space ?? 0
      if (space === 82 || space > 165) {
        if (info?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
          programId = TOKEN_2022_PROGRAM_ID
        }
        const onlineData = unpackMint(address, info, programId)
        const mintAddress = mint.toString()
        if (onlineData) {
          const res = {
            chainId: 101,
            address: mintAddress,
            programId: programId?.toBase58() || TOKEN_PROGRAM_ID.toBase58(),
            logoURI: '',
            symbol: mintAddress.slice(0, 6),
            name: mintAddress.slice(0, 6),
            decimals: onlineData.decimals,
            tags: [],
            extensions: {},
            priority: 2,
            type: 'unknown'
          }
          cacheTokenInfoMap.set(mint.toString(), res)
          return res
        }
      }
    }
    return undefined
  } catch {
    return undefined
  }
}

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
  programId?: PublicKey | undefined
  notFetchOnline?: boolean
}): Promise<TokenInfo | undefined> => {
  if (!forceReload) {
    const cacheInfo = cacheTokenInfoMap.get(mint.toString())
    if (cacheInfo) return new Promise((resolve) => resolve(cacheInfo))
  }

  let isOnlineFetched = false

  try {
    const { data } = await axios.get<TokenInfo>(
      DEV_API_URLS.BASE_HOST + useAppStore.getState().urlConfigs.TOKEN_INFO.replace('{mint}', mint.toString()),
      { skipError: true }
    )

    if (data) {
      data.priority = 2
      cacheTokenInfoMap.set(data.address, data)
      return data
    }

    if (!notFetchOnline) {
      isOnlineFetched = true
      return await getOnlineTokenInfo({ mint, connection, programId })
    }
    return undefined
  } catch {
    if (!notFetchOnline && !isOnlineFetched) {
      return await getOnlineTokenInfo({ mint, connection, programId })
    }
    return undefined
  }
}
