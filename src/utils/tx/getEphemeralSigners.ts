import { Wallet } from '@solana/wallet-adapter-react'

export default async function getEphemeralSigners(wallet: Wallet) {
  const { adapter } = wallet
  return (
    adapter &&
    'standard' in adapter &&
    'fuse:getEphemeralSigners' in adapter.wallet.features &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    adapter.wallet.features['fuse:getEphemeralSigners'].getEphemeralSigners
  )
}
