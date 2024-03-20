import { liquidityStateV4Layout, MARKET_STATE_LAYOUT_V3, Market, getLiquidityAssociatedAuthority } from '@raydium-io/raydium-sdk-v2'
import { PublicKey, AddressLookupTableAccount, Connection } from '@solana/web3.js'
import { useAppStore } from '@/store/useAppStore'

export interface ApiPoolInfoV4 {
  id: string
  baseMint: string
  quoteMint: string
  lpMint: string
  baseDecimals: number
  quoteDecimals: number
  lpDecimals: number
  version: 4
  programId: string
  authority: string
  openOrders: string
  targetOrders: string
  baseVault: string
  quoteVault: string
  withdrawQueue: string
  lpVault: string
  marketVersion: 3
  marketProgramId: string
  marketId: string
  marketAuthority: string
  marketBaseVault: string
  marketQuoteVault: string
  marketBids: string
  marketAsks: string
  marketEventQueue: string
  lookupTableAccount: string
}

export type AmmLayoutField = keyof ReturnType<typeof liquidityStateV4Layout.decode>

interface Props {
  programId?: string
  connection?: Connection
  filters?: {
    field: AmmLayoutField
    bytes: string
  }[]
  findLookupTableAddress?: boolean
}

export async function formatAmmKeys({
  connection,
  programId = useAppStore.getState().programIdConfig.AMM_V4.toBase58(),
  filters = [],
  findLookupTableAddress = false
}: Props): Promise<ApiPoolInfoV4[]> {
  if (!connection) return []
  const filterDefKey = PublicKey.default.toString()
  const allAmmAccount = await connection.getProgramAccounts(new PublicKey(programId), {
    filters: [
      { dataSize: liquidityStateV4Layout.span },
      ...filters.map((filter) => ({ memcmp: { offset: liquidityStateV4Layout.offsetOf(filter.field), bytes: filter.bytes } }))
    ]
  })
  const amAccountmData = allAmmAccount
    .map((i) => ({ id: i.pubkey, programId: i.account.owner, ...liquidityStateV4Layout.decode(i.account.data) }))
    .filter((i) => i.marketProgramId.toString() !== filterDefKey)

  const allMarketProgram = new Set<string>(amAccountmData.map((i) => i.marketProgramId.toString()))

  const marketInfo: {
    [marketId: string]: {
      marketProgramId: string
      marketAuthority: string
      marketBaseVault: string
      marketQuoteVault: string
      marketBids: string
      marketAsks: string
      marketEventQueue: string
    }
  } = {}
  for (const itemMarketProgram of allMarketProgram) {
    try {
      const allMarketInfo = await connection.getProgramAccounts(new PublicKey(itemMarketProgram), {
        filters: [
          { dataSize: MARKET_STATE_LAYOUT_V3.span },
          ...filters.map((filter) => ({ memcmp: { offset: MARKET_STATE_LAYOUT_V3.offsetOf(filter.field), bytes: filter.bytes } }))
        ]
      })
      for (const itemAccount of allMarketInfo) {
        const itemMarketInfo = MARKET_STATE_LAYOUT_V3.decode(itemAccount.account.data)
        marketInfo[itemAccount.pubkey.toString()] = {
          marketProgramId: itemAccount.account.owner.toString(),
          marketAuthority: Market.getAssociatedAuthority({
            programId: itemAccount.account.owner,
            marketId: itemAccount.pubkey
          }).publicKey.toString(),
          marketBaseVault: itemMarketInfo.baseVault.toString(),
          marketQuoteVault: itemMarketInfo.quoteVault.toString(),
          marketBids: itemMarketInfo.bids.toString(),
          marketAsks: itemMarketInfo.asks.toString(),
          marketEventQueue: itemMarketInfo.eventQueue.toString()
        }
      }
    } catch {
      continue
    }
  }

  const ammFormatData = (
    amAccountmData
      .map((itemAmm) => {
        const itemMarket = marketInfo[itemAmm.marketId.toString()]
        if (itemMarket === undefined) return undefined

        const format: ApiPoolInfoV4 = {
          id: itemAmm.id.toString(),
          baseMint: itemAmm.baseMint.toString(),
          quoteMint: itemAmm.quoteMint.toString(),
          lpMint: itemAmm.lpMint.toString(),
          baseDecimals: itemAmm.baseDecimal.toNumber(),
          quoteDecimals: itemAmm.quoteDecimal.toNumber(),
          lpDecimals: itemAmm.baseDecimal.toNumber(),
          version: 4,
          programId: itemAmm.programId.toString(),
          authority: getLiquidityAssociatedAuthority({ programId: itemAmm.programId }).publicKey.toString(),
          openOrders: itemAmm.openOrders.toString(),
          targetOrders: itemAmm.targetOrders.toString(),
          baseVault: itemAmm.baseVault.toString(),
          quoteVault: itemAmm.quoteVault.toString(),
          withdrawQueue: itemAmm.withdrawQueue.toString(),
          lpVault: itemAmm.lpVault.toString(),
          marketVersion: 3,
          marketId: itemAmm.marketId.toString(),
          ...itemMarket,
          lookupTableAccount: filterDefKey
        }
        return format
      })
      .filter((i) => i !== undefined) as ApiPoolInfoV4[]
  ).reduce((a, b) => {
    a[b.id] = b
    return a
  }, {} as { [id: string]: ApiPoolInfoV4 })

  if (findLookupTableAddress) {
    const ltas = await connection.getProgramAccounts(new PublicKey('AddressLookupTab1e1111111111111111111111111'), {
      filters: [{ memcmp: { offset: 22, bytes: 'RayZuc5vEK174xfgNFdD9YADqbbwbFjVjY4NM8itSF9' } }]
    })
    for (const itemLTA of ltas) {
      const keyStr = itemLTA.pubkey.toString()
      const ltaForamt = new AddressLookupTableAccount({
        key: itemLTA.pubkey,
        state: AddressLookupTableAccount.deserialize(itemLTA.account.data)
      })
      for (const itemKey of ltaForamt.state.addresses) {
        const itemKeyStr = itemKey.toString()
        if (ammFormatData[itemKeyStr] === undefined) continue
        ammFormatData[itemKeyStr].lookupTableAccount = keyStr
      }
    }
  }
  return Object.values(ammFormatData)
}
