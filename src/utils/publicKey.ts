import { PublicKey } from '@solana/web3.js'

const CACHE_KEYS = new Map<string, PublicKey>()

export const isValidPublicKey = (val: string | PublicKey): boolean => {
  if (!val) return false
  const valStr = val.toString()
  if (CACHE_KEYS.has(valStr)) return true
  try {
    new PublicKey(valStr)
    return true
  } catch {
    return false
  }
}

export default function ToPublicKey(key: string | PublicKey): PublicKey {
  const keyStr = key?.toString() || ''
  if (CACHE_KEYS.has(keyStr)) return CACHE_KEYS.get(keyStr)!
  const pubKey = new PublicKey(keyStr)
  CACHE_KEYS.set(keyStr, pubKey)
  return pubKey
}
