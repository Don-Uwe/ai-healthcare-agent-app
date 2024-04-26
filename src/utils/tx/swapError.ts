import { SignatureResult } from '@solana/web3.js'

export function isSwapSlippageError(result: SignatureResult): boolean {
  try {
    // @ts-expect-error force
    if ([38, 6022].includes(result.err?.InstructionError[1].Custom)) {
      return true
    } else {
      return false
    }
  } catch {
    return false
  }
}
