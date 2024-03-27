import { useState, useEffect } from 'react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { getTokenInfo } from './api'
import { useTokenStore } from '@/store/useTokenStore'

export default function useMultipleTokenInfo({
  mintList
}: {
  mintList: {
    address: string | PublicKey
    programId?: PublicKey | undefined
  }[]
}) {
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [loading, setLoading] = useState<boolean>(true)
  const [allTokenInfo, setAllTokenInfo] = useState<(TokenInfo | undefined)[]>([])
  const mintStringList = mintList.map((m) => m.address.toString()).join(',')

  useEffect(() => {
    if (tokenMap.size < 1) return

    setLoading(true)
    const promiseList: ReturnType<typeof getTokenInfo>[] = mintList.map((mint) => {
      const info = tokenMap.get(mint.toString())
      if (info) return new Promise((resolve) => resolve(info))
      return getTokenInfo({ mint: mint.address, programId: mint.programId })
    })

    Promise.all(promiseList).then((res) => {
      setAllTokenInfo(res.map((r) => r))
      setLoading(false)
    })
  }, [tokenMap, mintStringList])

  return { loading, allTokenInfo }
}
