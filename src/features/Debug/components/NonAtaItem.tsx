import { Flex } from '@chakra-ui/react'
import { TokenAccount } from '@raydium-io/raydium-sdk-v2'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'

import useTokenInfo from '@/hooks/token/useTokenInfo'
import { useAppStore } from '@/store'
import Decimal from 'decimal.js'

export default function NonAtaItem({ account }: { account: TokenAccount }) {
  const publicKey = useAppStore((s) => s.publicKey)
  const token = useTokenInfo({
    mint: account.mint.toString(),
    programId: account.programId
  }).tokenInfo
  const symbol = token?.symbol || account.mint.toString().slice(0, 6)

  return (
    <Flex>
      token: {symbol}, amount: {new Decimal(account.amount.toString()).div(10 ** (token?.decimals || 0)).toString()}, publicKey:{' '}
      {account.publicKey?.toString()}, ata: {getAssociatedTokenAddressSync(account.mint, publicKey!).toString()}
    </Flex>
  )
}
