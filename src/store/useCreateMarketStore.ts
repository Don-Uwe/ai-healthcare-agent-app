import { ApiV3Token, getAssociatedPoolKeys, MARKET_STATE_LAYOUT_V3 } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useAppStore, useTokenAccountStore, useTokenStore } from './'
import createStore from './createStore'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import showMultiToast, { generateDefaultIds } from '@/hooks/toast/multiToastUtil'
import { ToastStatus, TxCallbackProps } from '@/types/tx'
import { isValidPublicKey } from '@/utils/publicKey'
import { wSolToSol, solToWSol, solToWsolString } from '@/utils/token'
import { getTxMeta } from './configs/market'
import { v4 as uuid } from 'uuid'

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

      console.log('rpc: get market info')
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
    createMarketAct: async ({ baseToken, quoteToken, orderSize, priceTick, onSuccess, onError, onFinally }) => {
      const { raydium, programIdConfig, connection, txVersion } = useAppStore.getState()
      if (!raydium || !connection) return { txId: [], marketId: '' }
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
      })

      const meta = getTxMeta({
        action: 'create',
        values: { pair: `${solToWsolString(baseToken.symbol)} - ${solToWsolString(quoteToken.symbol)}` }
      })

      let errorCalled = false
      const toastId = uuid()

      let processedId = generateDefaultIds(transactions.length)
      const showToast = () => {
        showMultiToast({
          toastId,
          processedId,
          meta,
          txLength: transactions.length,
          getSubTxTitle(idx) {
            return idx !== transactions.length - 1 ? 'transaction_history.set_up' : 'create_market.create'
          }
        })
      }

      return execute({
        sequentially: true,
        onTxUpdate: (data) => {
          processedId = processedId.map((prev, idx) => ({
            txId: data[idx]?.txId || prev.txId,
            status: !data[idx] || data[idx].status === 'sent' ? 'info' : (data[idx].status as ToastStatus)
          }))
          showToast()

          if (data.some((tx) => tx.status === 'error') && !errorCalled) {
            errorCalled = true
            onError?.()
            return
          }

          if (data.filter((d) => d.status === 'success').length === transactions.length) {
            onSuccess?.(extInfo.address.marketId.toString())
          }
        }
      })
        .then((r) => {
          showToast()
          return { txId: r, marketId: extInfo.address.marketId.toString() || '' }
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ txError: e })
          return { txId: [], marketId: '' }
        })
        .finally(onFinally)
    }
  }),
  'useCreateMarketStore'
)
