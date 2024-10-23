import { PublicKey } from '@solana/web3.js'

export const cacheId: Map<string, string> = new Map()

export const getPdaIdCache = ({
  program,
  mint,
  identifier = '',
  pdaFunc
}: {
  program: string | PublicKey
  mint: string | PublicKey
  identifier?: string
  pdaFunc: (
    program: PublicKey,
    mint: PublicKey
  ) => {
    publicKey: PublicKey
    nonce: number
  }
}): string => {
  const key = `${program.toString()}-${mint.toString()}${identifier}`
  if (!cacheId.get(key)) cacheId.set(key, pdaFunc(new PublicKey(program), new PublicKey(mint)).publicKey.toBase58())
  return cacheId.get(key)!
}
