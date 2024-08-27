import {
  parseTokenAccountResp,
  TokenAccount,
  TokenAccountRaw,
  WSOLMint,
  splAccountLayout,
  getATAAddress,
  TxBuilder
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey, KeyedAccountInfo, Commitment, AccountInfo, RpcResponseAndContext, GetProgramAccountsResponse } from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferInstruction
} from '@solana/spl-token'
import { formatLocaleStr, trimTailingZero } from '@/utils/numberish/formatter'
import createStore from './createStore'
import { useAppStore } from './useAppStore'
import { useTokenStore } from './useTokenStore'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject } from '@/hooks/toast/useTxStatus'
import { TxCallbackProps } from '../types/tx'
import { retry } from '@/utils/common'

import Decimal from 'decimal.js'
import BN from 'bn.js'
import logMessage from '@/utils/log'

export interface TokenAccountStore {
  tokenAccounts: TokenAccount[]
  tokenAccountRawInfos: TokenAccountRaw[]
  tokenAccountMap: Map<string, TokenAccount[]>

  refreshClmmPositionTag: number
  refreshTokenAccTime: number

  fetchTokenAccountAct: (params: { commitment?: Commitment; forceFetch?: boolean }) => Promise<void>
  updateTokenAccountAct: () => void
  getTokenBalanceUiAmount: (params: { mint: string | PublicKey; decimals?: number; isNative?: boolean }) => {
    rawAmount: Decimal
    amount: Decimal
    decimals: number
    text: string
    localeText: string
    isZero: boolean
    gt: (val: string) => boolean
  }
  migrateATAAct: (props: { migrateAccounts: TokenAccount[] } & TxCallbackProps) => Promise<void>
  reset: () => void
}

export const initTokenAccountSate = {
  tokenAccounts: [],
  tokenAccountRawInfos: [],
  tokenAccountMap: new Map(),
  refreshClmmPositionTag: 0,
  refreshTokenAccTime: Date.now()
}

let [loading, lastFetchTime, preOwner, preCommitment]: [boolean, number, PublicKey, Commitment | undefined] = [
  false,
  0,
  PublicKey.default,
  undefined
]

export const batchUpdateAccountData: {
  tokenAccounts: Map<string, KeyedAccountInfo>
  deleteAccount: Set<string>
  solAmount?: BN
} = {
  tokenAccounts: new Map(),
  deleteAccount: new Set()
}

export const clearUpdateTokenAccData = () => {
  batchUpdateAccountData.deleteAccount.clear()
  batchUpdateAccountData.tokenAccounts.clear()
  batchUpdateAccountData.solAmount = undefined
}

export const useTokenAccountStore = createStore<TokenAccountStore>(
  (set, get) => ({
    ...initTokenAccountSate,
    updateTokenAccountAct: () => {
      const owner = useAppStore.getState().publicKey!
      const readyUpdateDataMap: Map<string, TokenAccount> = new Map()
      const readyUpdateRawDataMap: Map<string, TokenAccountRaw> = new Map()

      Array.from(batchUpdateAccountData.tokenAccounts.entries()).forEach(([publicKey, data]) => {
        const accountInfo = splAccountLayout.decode(data.accountInfo.data)
        const { mint, amount } = accountInfo
        const [accountPublicKey, tokenProgram] = [data.accountId, data.accountInfo.owner]
        const updateData = {
          publicKey: accountPublicKey,
          mint,
          amount,
          isAssociate: getATAAddress(owner, mint, data.accountInfo.owner).publicKey.equals(accountPublicKey),
          isNative: mint.equals(PublicKey.default),
          programId: tokenProgram
        }
        readyUpdateDataMap.set(publicKey, updateData)
        readyUpdateRawDataMap.set(publicKey, { pubkey: accountPublicKey, accountInfo, programId: tokenProgram })
      })

      const { tokenAccounts, tokenAccountRawInfos } = get()
      const updatedSet = new Set()
      const newTokenAccountMap: Map<string, TokenAccount[]> = new Map()
      const newTokenAccounts = tokenAccounts
        .map((acc) => {
          if (batchUpdateAccountData.solAmount && acc.mint.equals(PublicKey.default)) {
            const updateData = { ...acc, amount: batchUpdateAccountData.solAmount }
            newTokenAccountMap.set(PublicKey.default.toString(), [updateData])
            return updateData
          }
          const mintStr = acc.mint.toString()
          const accPubicKey = acc.publicKey?.toString() || ''
          const updateData = readyUpdateDataMap.get(accPubicKey)
          acc.amount = batchUpdateAccountData.deleteAccount.has(accPubicKey) ? new BN(0) : acc.amount

          if (!newTokenAccountMap.has(mintStr)) {
            newTokenAccountMap.set(mintStr, [updateData || acc])
          } else {
            newTokenAccountMap.get(mintStr)!.push(updateData || acc)
          }

          if (updateData) {
            updatedSet.add(accPubicKey)
            return updateData
          }
          return acc
        })
        .filter((acc) => !batchUpdateAccountData.deleteAccount.has(acc.publicKey?.toString() || ''))

      if (updatedSet.size !== readyUpdateDataMap.size) {
        const newAtaList = Array.from(readyUpdateDataMap.values()).filter((tokenAcc) => !updatedSet.has(tokenAcc.publicKey?.toString()))
        if (newAtaList.length)
          newAtaList.forEach((data) => {
            const mintStr = data.mint.toString()
            newTokenAccounts.push(data)

            if (!newTokenAccountMap.has(mintStr)) {
              newTokenAccountMap.set(mintStr, [data])
            } else {
              newTokenAccountMap.get(mintStr)!.push(data)
            }
          })
      }
      updatedSet.clear()

      const newTokenAccountRawInfos = tokenAccountRawInfos
        .map((acc) => {
          acc.accountInfo.amount = batchUpdateAccountData.deleteAccount.has(acc.pubkey.toString()) ? new BN(0) : acc.accountInfo.amount
          const updateData = readyUpdateRawDataMap.get(acc.pubkey.toString())
          if (updateData) {
            updatedSet.add(acc.pubkey.toString())
            return updateData
          }
          return acc
        })
        .filter((acc) => !batchUpdateAccountData.deleteAccount.has(acc.pubkey.toString()))

      if (updatedSet.size !== readyUpdateDataMap.size) {
        const newAtaList = Array.from(batchUpdateAccountData.tokenAccounts.values()).filter(
          (tokenAcc) => !updatedSet.has(tokenAcc.accountId.toString())
        )
        if (newAtaList.length)
          newAtaList.forEach((data) =>
            newTokenAccountRawInfos.push({
              pubkey: data.accountId,
              accountInfo: splAccountLayout.decode(data.accountInfo.data),
              programId: readyUpdateDataMap.get(data.accountId.toString())!.programId!
            })
          )
      }

      set(
        {
          tokenAccounts: newTokenAccounts,
          tokenAccountRawInfos: newTokenAccountRawInfos,
          tokenAccountMap: newTokenAccountMap,
          getTokenBalanceUiAmount: get().getTokenBalanceUiAmount.bind(this)
        },
        false,
        {
          type: 'updateTokenAccountAct'
        }
      )
    },
    fetchTokenAccountAct: async ({ commitment, forceFetch }) => {
      const { connection, publicKey: owner } = useAppStore.getState()
      if (!owner || !connection) return
      if (!forceFetch && (loading || (Date.now() - lastFetchTime < 3000 && owner.equals(preOwner) && commitment === preCommitment))) return
      preCommitment = commitment
      loading = true
      preOwner = owner
      try {
        logMessage('rpc: get owner acc info')
        const solAccountResp = await retry<Promise<AccountInfo<Buffer>>>(() =>
          connection.getAccountInfo(owner, { commitment: useAppStore.getState().commitment })
        )
        logMessage('rpc: get owner token acc info')
        const tokenAccountResp = await retry<Promise<RpcResponseAndContext<GetProgramAccountsResponse>>>(() =>
          connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }, { commitment: useAppStore.getState().commitment })
        )
        logMessage('rpc: get owner token2022 acc info')
        const token2022Req = await retry<Promise<RpcResponseAndContext<GetProgramAccountsResponse>>>(() =>
          connection.getTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }, { commitment: useAppStore.getState().commitment })
        )

        lastFetchTime = Date.now()
        loading = false
        const tokenAccountData = parseTokenAccountResp({
          owner,
          solAccountResp,
          tokenAccountResp: {
            context: tokenAccountResp.context,
            value: [...tokenAccountResp.value, ...token2022Req.value]
          }
        })

        const tokenAccountMap: Map<string, TokenAccount[]> = new Map()
        tokenAccountData.tokenAccounts.forEach((tokenAccount) => {
          const mintStr = tokenAccount.mint?.toBase58()
          if (!tokenAccountMap.has(mintStr)) {
            tokenAccountMap.set(mintStr, [tokenAccount])
            return
          }
          tokenAccountMap.get(mintStr)!.push(tokenAccount)
        })

        tokenAccountMap.forEach((tokenAccount) => {
          tokenAccount.sort((a, b) => (a.amount.lt(b.amount) ? 1 : -1))
        })

        clearUpdateTokenAccData()
        set(
          {
            ...tokenAccountData,
            tokenAccountMap,
            refreshTokenAccTime: Date.now(),
            getTokenBalanceUiAmount: get().getTokenBalanceUiAmount.bind(this)
          },
          false,
          {
            type: 'fetchTokenAccountAct'
          }
        )

        const tokenList = useTokenStore.getState().tokenList.sort((tokenA, tokenB) => {
          const accountA = tokenAccountMap.get(tokenA.address)
          const accountB = tokenAccountMap.get(tokenB.address)
          const amountA = new Decimal(accountB?.[0].amount.toString() || 0)
          const amountB = new Decimal(accountA?.[0].amount.toString() || 0)
          if (amountB.gt(amountA)) return 1
          if (amountB.eq(amountA)) return 0
          return -1
        })
        useTokenStore.setState({ tokenList: JSON.parse(JSON.stringify(tokenList)) }, false, { type: 'fetchTokenAccountAct' })
        useAppStore.setState({ tokenAccLoaded: true })
      } catch (e: any) {
        loading = false
        toastSubject.next({
          status: 'error',
          title: 'fetch token account error',
          detail: e.message
        })
      }
    },
    getTokenBalanceUiAmount: ({ mint: mintKey, decimals, isNative = true }) => {
      const mint = mintKey?.toString()
      const defaultVal = {
        rawAmount: new Decimal(0),
        amount: new Decimal(0),
        text: '0',
        localeText: '0',
        decimals: 0,
        isZero: true,
        gt: () => false
      }

      const tokenInfo = useTokenStore.getState().tokenMap.get(mint)
      const tokenDecimal = decimals ?? tokenInfo?.decimals ?? 6
      const tokenAccount =
        get()
          .tokenAccountMap.get(mint)
          ?.find((acc) => acc.isAssociated || acc.isNative === isNative) || get().tokenAccountMap.get(mint)?.[0]
      if (!tokenAccount) return defaultVal
      if (!tokenInfo && decimals === undefined) return defaultVal

      let amount = new Decimal(tokenAccount.amount.toString())
      // wsol might have lots of ata, so sum them up
      if (mint === WSOLMint.toBase58()) {
        amount = new Decimal(0)
        get()
          .tokenAccountMap.get(mint)!
          .forEach((acc) => {
            amount = amount.add(acc.amount.toString())
          })
      }

      const decimalAmount = new Decimal(amount.toString()).div(10 ** tokenDecimal)

      return {
        rawAmount: amount,
        amount: decimalAmount,
        decimals: tokenDecimal,
        text: trimTailingZero(decimalAmount.toFixed(tokenDecimal, Decimal.ROUND_FLOOR)),
        localeText: formatLocaleStr(decimalAmount.toFixed(tokenDecimal, Decimal.ROUND_FLOOR), tokenDecimal)!,
        isZero: amount.eq(0),
        gt: (val: string) => !!val && amount.gt(val)
      }
    },
    migrateATAAct: async ({ migrateAccounts, ...txProps }) => {
      const { connection, publicKey, signAllTransactions } = useAppStore.getState()
      const tokenAccounts = get().tokenAccounts
      if (!connection || !publicKey || !signAllTransactions || !tokenAccounts.length) return

      const txBuilder = new TxBuilder({ connection, cluster: 'mainnet', feePayer: publicKey, signAllTransactions })

      migrateAccounts.forEach((tokenAcc) => {
        if (!tokenAcc.publicKey) return
        const ata = getAssociatedTokenAddressSync(tokenAcc.mint, publicKey!, false, tokenAcc.programId)
        const ataExists = !!tokenAccounts.find((acc) => acc.publicKey && acc.publicKey.equals(tokenAcc.publicKey!))
        if (!ataExists)
          txBuilder.addInstruction({
            instructions: [createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, tokenAcc.mint, tokenAcc.programId)]
          })

        if (!tokenAcc.amount.isZero())
          txBuilder.addInstruction({
            instructions: [
              createTransferInstruction(tokenAcc.publicKey, ata, publicKey, BigInt(tokenAcc.amount.toString()), [], tokenAcc.programId)
            ]
          })

        txBuilder.addInstruction({
          instructions: [createCloseAccountInstruction(tokenAcc.publicKey, publicKey, publicKey, [], tokenAcc.programId)]
        })
      })

      if (!txBuilder.allInstructions.length) {
        toastSubject.next({
          status: 'error',
          title: 'Migrate ATA',
          description: 'not ata needs to be migrated'
        })
        return
      }
      txBuilder
        .build()
        .execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, signedTx })
          txProps.onSent?.()
        })
        .catch((e) => {
          toastSubject.next({ txError: e })
          txProps.onError?.()
        })
        .finally(txProps.onFinally)
    },
    reset: () => {
      set(initTokenAccountSate)
    }
  }),
  'useTokenAccountStore'
)
