import {
  ApiV3Token,
  getAssociatedPoolKeys,
  MARKET_STATE_LAYOUT_V3,
  TxVersion,
  LOOKUP_TABLE_CACHE,
  CreatePoolAddress,
  MarketExtInfo
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey, Transaction, VersionedTransaction, TransactionMessage, SystemProgram } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { useAppStore, useTokenAccountStore, useTokenStore } from './'
import createStore from './createStore'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { TxCallbackProps, TxCallbackPropsGeneric } from '@/types/tx'
import ToPublicKey, { isValidPublicKey } from '@/utils/publicKey'
import { wSolToSol, solToWSol, solToWsolString, wSolToSolString } from '@/utils/token'
import { getTxMeta } from './configs/market'
import { getDefaultToastData, transformProcessData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import logMessage from '@/utils/log'
import { getStorageItem, setStorageItem, deleteStorageItem } from '@/utils/localStorage'
import BN from 'bn.js'
import { getComputeBudgetConfig } from '@/utils/tx/computeBudget'
import { v4 as uuidv4 } from 'uuid'
interface CreateMarketState {
  checkMarketAct: (marketId: string) => Promise<{ isValid: boolean; mintA?: string; mintB?: string }>
  createMarketAct: (
    params: {
      baseToken: ApiV3Token
      quoteToken: ApiV3Token
      orderSize: string | number
      priceTick: string | number
    } & TxCallbackProps
  ) => Promise<{ txId: string[]; marketId: string }>
  createMarketAndPoolAct: (
    params: {
      baseToken: ApiV3Token
      quoteToken: ApiV3Token
      baseAmount: string
      quoteAmount: string
      startTime?: Date
    } & TxCallbackPropsGeneric<CreatePoolAddress & MarketExtInfo['address']>
  ) => Promise<{ txId: string[]; marketId: string }>
}

export const useCreateMarketStore = createStore<CreateMarketState>(
  () => ({
    checkMarketAct: async (marketId) => {
      if (!isValidPublicKey(marketId)) {
        toastSubject.next({ status: 'error', title: 'error', description: `invalid market id: ${marketId}` })
        return { isValid: false }
      }
      const { raydium, connection, programIdConfig } = useAppStore.getState()

      const getTokenBalanceUiAmount = useTokenAccountStore.getState().getTokenBalanceUiAmount
      const tokenMap = useTokenStore.getState().tokenMap
      if (!raydium || !connection) return { isValid: false }
      const { isVerifiedToken, getTokenDecimal } = useTokenStore.getState()

      logMessage('rpc: get market info')
      const marketBufferInfo = await connection.getAccountInfo(new PublicKey(marketId), { commitment: useAppStore.getState().commitment })
      if (!marketBufferInfo?.data) {
        toastSubject.next({ status: 'error', title: 'error', description: `can't find market ${marketId}` })
        return { isValid: false }
      }
      if (!marketBufferInfo.owner.equals(programIdConfig.OPEN_BOOK_PROGRAM)) {
        toastSubject.next({ status: 'error', title: 'error', description: 'market program id is not OpenBook program id' })
        return { isValid: false }
      }
      const { baseMint, quoteMint, baseLotSize, quoteLotSize } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data)
      const [baseDecimals, quoteDecimals] = [await getTokenDecimal(baseMint), await getTokenDecimal(quoteMint)]

      const { id: ammId } = getAssociatedPoolKeys({
        version: 4,
        marketVersion: 3,
        baseMint,
        quoteMint,
        baseDecimals,
        quoteDecimals,
        marketId: new PublicKey(marketId),
        programId: programIdConfig.AMM_V4,
        marketProgramId: programIdConfig.OPEN_BOOK_PROGRAM
      })
      if (!ammId) {
        toastSubject.next({ status: 'error', title: 'error', description: "can't find associated poolKeys for market" })
        return { isValid: false }
      }

      // try {
      // const [mint1, mint2] = baseMint.toBase58() < quoteMint.toBase58() ? [baseMint, quoteMint] : [quoteMint, baseMint]
      // const { data } = await axios.get<ApiV3PageIns<ApiV3PoolInfoStandardItem>>(
      //   BASE_HOST +
      //     POOLS_KEY_BY_MINT_2.replace('{mint1}', mint1.toBase58())
      //       .replace('{mint2}', mint2.toBase58())
      //       .replace('{type}', 'standard')
      //       .replace('{sort}', 'liquidity')
      //       .replace('{order}', 'desc')
      //       .replace('{page_size}', '100')
      //       .replace('{page}', '1')
      // )
      // if (data.data.some((p) => p.marketId === marketId)) {
      //   toastSubject.next({ status: 'error', title: 'error', description: 'Pool already created' })
      //   return { isValid: false }
      // }
      // } catch (e: any) {
      //   toastSubject.next({ status: 'error', title: 'error', description: e.message })
      //   return { isValid: false }
      // }

      if (!isVerifiedToken({ mint: baseMint, tokenInfo: tokenMap.get(baseMint.toString()) })) {
        toastSubject.next({ status: 'error', title: 'error', description: 'base token freeze authority enabled' })
        return { isValid: false }
      }
      if (!isVerifiedToken({ mint: quoteMint, tokenInfo: tokenMap.get(quoteMint.toString()) })) {
        toastSubject.next({ status: 'error', title: 'error', description: 'quote token freeze authority enabled' })
        return { isValid: false }
      }
      if (baseLotSize.isZero()) {
        toastSubject.next({ status: 'error', title: 'error', description: 'Base lot size is zero' })
        return { isValid: false }
      }
      if (quoteLotSize.isZero()) {
        toastSubject.next({ status: 'error', title: 'error', description: 'Quote lot size is zero' })
        return { isValid: false }
      }

      if (getTokenBalanceUiAmount({ mint: wSolToSol(baseMint.toString())!, decimals: baseDecimals }).isZero) {
        toastSubject.next({ status: 'error', title: 'error', description: 'user wallet has no base token' })
        return { isValid: false }
      }
      if (getTokenBalanceUiAmount({ mint: wSolToSol(quoteMint.toString())!, decimals: quoteDecimals }).isZero) {
        toastSubject.next({ status: 'error', title: 'error', description: 'user wallet has no quote token' })
        return { isValid: false }
      }

      const isPoolInitialized = Boolean(
        (await connection.getAccountInfo(new PublicKey(ammId), { commitment: useAppStore.getState().commitment }))?.data.length
      )
      if (isPoolInitialized) {
        toastSubject.next({ status: 'error', title: 'error', description: 'has already init this pool' })
        return { isValid: false }
      }
      return {
        isValid: true,
        mintA: baseMint.toString(),
        mintB: quoteMint.toString()
      }
    },
    createMarketAct: async ({ baseToken, quoteToken, orderSize, priceTick, ...txProps }) => {
      const { raydium, programIdConfig, connection, txVersion } = useAppStore.getState()
      if (!raydium || !connection) return { txId: [], marketId: '' }

      // const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute, transactions, extInfo } = await raydium.marketV2.create({
        baseInfo: {
          mint: new PublicKey(solToWSol(baseToken.address)!),
          decimals: baseToken.decimals
        },
        quoteInfo: {
          mint: new PublicKey(solToWSol(quoteToken.address)!),
          decimals: quoteToken.decimals
        },
        lotSize: Number(orderSize),
        tickSize: Number(priceTick),
        dexProgramId: programIdConfig.OPEN_BOOK_PROGRAM,
        txVersion
        // computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'create',
        values: { pair: `${solToWsolString(baseToken.symbol)} - ${solToWsolString(quoteToken.symbol)}` }
      })

      const txLength = transactions.length
      const { toastId, processedId, handler } = getDefaultToastData({
        txLength,
        ...txProps
      })
      const getSubTxTitle = (idx: number) => (idx !== transactions.length - 1 ? 'transaction_history.set_up' : 'create_market.create')

      return execute({
        sequentially: true,
        onTxUpdate: (data) => {
          handleMultiTxRetry(data)
          handleMultiTxToast({
            toastId,
            processedId: transformProcessData({ processedId, data }),
            txLength,
            meta,
            handler,
            getSubTxTitle
          })
        }
      })
        .then((r) => {
          handleMultiTxToast({
            toastId,
            processedId: transformProcessData({ processedId, data: [] }),
            txLength,
            meta,
            handler,
            getSubTxTitle
          })
          return { txId: r.txIds, marketId: extInfo.address.marketId.toString() || '' }
        })
        .catch((e) => {
          txProps.onError?.()
          toastSubject.next({ txError: e, ...meta })
          return { txId: [], marketId: '' }
        })
        .finally(txProps.onFinally)
    },
    createMarketAndPoolAct: async ({ baseToken, quoteToken, baseAmount, quoteAmount, startTime, ...txProps }) => {
      const { raydium, connection, txVersion, publicKey } = useAppStore.getState()
      if (!raydium || !connection || !publicKey) return { txId: [], marketId: '' }

      if (baseToken.programId === TOKEN_2022_PROGRAM_ID.toBase58() || quoteToken.programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
        toastSubject.next({ status: 'error', title: 'error', description: `Create market and Amm V4 pool do not support token 2022` })
        txProps.onError?.()
        txProps.onFinally?.({} as any)
        return { txId: [], marketId: '' }
      }

      const seedStorageKey = `${publicKey.toBase58().slice(0, 5)}-${baseToken.address.slice(0, 5)}-${quoteToken.address.slice(0, 5)}`
      let assignSeed = getStorageItem(seedStorageKey)
      if (!assignSeed) {
        assignSeed = uuidv4().slice(0, 6)
        setStorageItem(seedStorageKey, assignSeed)
      }

      const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute, transactions, extInfo } = await raydium.liquidity.createMarketAndPoolV4({
        baseMintInfo: {
          mint: new PublicKey(solToWSol(baseToken.address)!),
          decimals: baseToken.decimals
        },
        quoteMintInfo: {
          mint: new PublicKey(solToWSol(quoteToken.address)!),
          decimals: quoteToken.decimals
        },
        lowestFeeMarket: true,
        assignSeed,
        baseAmount: new BN(baseAmount),
        quoteAmount: new BN(quoteAmount),
        startTime: new BN((startTime ? Number(startTime) : Date.now() + 60 * 1000) / 1000),
        txVersion,
        ownerInfo: {
          useSOLBalance: true
        },
        associatedOnly: false,
        computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'createPool',
        values: { mintA: wSolToSolString(baseToken.symbol), mintB: wSolToSolString(quoteToken.symbol) }
      })

      const txLength = transactions.length
      const { toastId, processedId, handler } = getDefaultToastData({
        txLength,
        ...txProps,
        onSent: () => {
          txProps.onSent?.(extInfo.address)
        },
        onConfirmed: () => {
          deleteStorageItem(seedStorageKey)
          txProps.onConfirmed?.()
        }
      })
      const getSubTxTitle = (idx: number) =>
        ['create_standard_pool.step_1_name', 'transaction_history.set_up', 'transaction_history.create_pool'][idx]

      let readyAccounts: string[][] = []
      if (txVersion === TxVersion.V0) {
        readyAccounts = (transactions as VersionedTransaction[]).map((tx) =>
          TransactionMessage.decompile(tx.message, {
            addressLookupTableAccounts: [LOOKUP_TABLE_CACHE['2immgwYNHBbyVQKVGCEkgWpi53bLwWNRMB5G2nbgYV17']]
          })
            .instructions.filter((i) => i.programId.equals(SystemProgram.programId))
            .map((tx) => tx.keys.map((k) => k.pubkey.toBase58())[1])
        )
      } else {
        readyAccounts = (transactions as Transaction[]).map((tx) =>
          tx.instructions.filter((i) => i.programId.equals(SystemProgram.programId)).map((tx) => tx.keys.map((k) => k.pubkey.toBase58())[1])
        )
      }

      const createdAccounts = await raydium.connection.getMultipleAccountsInfo(
        readyAccounts.flat().map((acc) => ToPublicKey(acc)),
        { commitment: 'confirmed' }
      )
      let skipTxCount = 0
      if (!createdAccounts.slice(0, readyAccounts[0].length).some((r) => !r)) skipTxCount++
      if (!createdAccounts.slice(readyAccounts[0].length - 1, -1).some((r) => !r)) skipTxCount++

      return execute({
        sequentially: true,
        skipTxCount,
        onTxUpdate: (data) => {
          handleMultiTxRetry(data)
          handleMultiTxToast({
            toastId,
            processedId: transformProcessData({ processedId, data }),
            txLength,
            meta,
            handler,
            getSubTxTitle
          })
        }
      })
        .then((r) => {
          handleMultiTxToast({
            toastId,
            processedId: transformProcessData({ processedId, data: [] }),
            txLength,
            meta,
            handler,
            getSubTxTitle
          })
          return { txId: r.txIds, marketId: extInfo.address.marketId.toString() || '' }
        })
        .catch((e) => {
          txProps.onError?.()
          toastSubject.next({ txError: e, ...meta })
          return { txId: [], marketId: '' }
        })
        .finally(() => txProps.onFinally?.(extInfo.address))
    }
  }),
  'useCreateMarketStore'
)
