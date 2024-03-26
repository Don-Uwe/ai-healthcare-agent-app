import { useState, useEffect } from 'react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { getTokenInfo } from './api'
import { useTokenStore } from '@/store/useTokenStore'
import { useAppStore } from '@/store/useAppStore'
import { getMintSymbol } from '@/utils/token'

export default function useTokenInfo({ mint, programId }: { mint?: string | PublicKey; programId?: PublicKey | undefined }) {
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const connection = useAppStore((s) => s.connection)
  const [loading, setLoading] = useState<boolean>(true)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined)

  useEffect(() => {
    if (tokenMap.size < 1) return
    if (!mint) return
    const info = tokenMap.get(mint.toString())

    if (!info) {
      setLoading(true)
      getTokenInfo({ mint, connection, programId }).then((r) => {
        if (r)
          setTokenInfo({
            ...r,
            symbol: getMintSymbol({ mint: r })
          })
        setLoading(false)
      })
      return
    }

    setTokenInfo(info)
    setLoading(false)
  }, [mint, tokenMap, connection, programId])

  return { loading, tokenInfo }
}
