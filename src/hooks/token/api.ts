import { TokenInfo, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import axios from '@/api/axios'
import { PublicKey, Connection, AccountInfo } from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  unpackMint,
  TransferFeeConfig,
  Mint,
  TransferFeeConfigLayout,
  ExtensionType,
  MintLayout
} from '@solana/spl-token'

import { useAppStore } from '@/store/useAppStore'

export const TYPE_SIZE = 2
export const LENGTH_SIZE = 2

export function getExtensionData(extension: ExtensionType, tlvData: Buffer): Buffer | null {
  let extensionTypeIndex = 0
  while (extensionTypeIndex + TYPE_SIZE + LENGTH_SIZE <= tlvData.length) {
    const entryType = tlvData.readUInt16LE(extensionTypeIndex)
    const entryLength = tlvData.readUInt16LE(extensionTypeIndex + TYPE_SIZE)
    const typeIndex = extensionTypeIndex + TYPE_SIZE + LENGTH_SIZE
    if (entryType == extension) {
      return tlvData.slice(typeIndex, typeIndex + entryLength)
    }
    extensionTypeIndex = typeIndex + entryLength
  }
  return null
}

export function getTransferFeeConfig(mint: Mint): TransferFeeConfig | null {
  const extensionData = getExtensionData(ExtensionType.TransferFeeConfig, mint.tlvData)
  if (extensionData !== null) {
    return TransferFeeConfigLayout.decode(extensionData)
  } else {
    return null
  }
}

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
      if (space === 82 || space >= 165) {
        const tags = []
        if (info?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
          programId = TOKEN_2022_PROGRAM_ID
          tags.push('token-2022')
        }
        const onlineData = unpackMint(address, info, programId)
        const mintAddress = mint.toString()

        try {
          if (info && MintLayout.decode(info?.data).freezeAuthorityOption === 1) tags.push('hasFreeze')
        } catch {
          console.error('decode mint error:', mint.toString())
        }
        const config = getTransferFeeConfig(onlineData)
        if (getTransferFeeConfig(onlineData)) tags.push('hasTransferFee')
        if (onlineData) {
          const res = {
            chainId: 101,
            address: mintAddress,
            programId: programId?.toBase58() || TOKEN_PROGRAM_ID.toBase58(),
            logoURI: '',
            symbol: mintAddress.slice(0, 6),
            name: mintAddress.slice(0, 6),
            decimals: onlineData.decimals,
            tags,
            extensions: {
              ...(config
                ? {
                    feeConfig: {
                      transferFeeConfigAuthority: config.transferFeeConfigAuthority.toBase58(),
                      withdrawWithheldAuthority: config.withdrawWithheldAuthority.toBase58(),
                      withheldAmount: config.withheldAmount.toString(),
                      olderTransferFee: {
                        epoch: config.olderTransferFee.epoch.toString(),
                        maximumFee: config.olderTransferFee.maximumFee.toString(),
                        transferFeeBasisPoints: config.olderTransferFee.transferFeeBasisPoints.valueOf()
                      },
                      newerTransferFee: {
                        epoch: config.newerTransferFee.epoch.toString(),
                        maximumFee: config.newerTransferFee.maximumFee.toString(),
                        transferFeeBasisPoints: config.newerTransferFee.transferFeeBasisPoints.valueOf()
                      }
                    }
                  }
                : {})
            },
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
    const { data: dataList } = await axios.get<TokenInfo[]>(
      useAppStore.getState().urlConfigs.BASE_HOST + useAppStore.getState().urlConfigs.MINT_INFO_ID + `?mints=${mint.toString()}`,
      { skipError: true }
    )
    const data = dataList?.[0]

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
