import { PublicKey, VersionedTransaction, Transaction } from '@solana/web3.js'
import { WSOLMint, SOLMint, TxVersion, printSimulate, SOL_INFO } from '@raydium-io/raydium-sdk-v2'
import { createStore, useAppStore, useTokenStore } from '@/store'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject, multiTxStatusSubject } from '@/hooks/toast/useTxStatus'
import { ApiSwapV1OutSuccess, SolanaFeeInfoJson } from './type'
import { isSolWSol } from '@/utils/token'
import axios from '@/api/axios'
import { v4 as uuid } from 'uuid'
import { getTxMeta } from './swapMeta'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import Decimal from 'decimal.js'
import { TxCallbackProps } from '@/types/tx'
import i18n from '@/i18n'
import { retry } from '@/utils/common'

const getComputePrice = async () => {
  const transactionFee = useAppStore.getState().transactionFee
  if (isNaN(parseFloat(String(transactionFee) || ''))) {
    const json = (await axios.get(`https://solanacompass.com/api/fees?cacheFreshTime=${5 * 60 * 1000}`)) as SolanaFeeInfoJson
    const { avg } = json?.[15] ?? {}
    if (!avg) return undefined
    return {
      units: 600000,
      microLamports: avg
    }
  }
  return {
    units: 600000,
    microLamports: new Decimal(transactionFee as string)
      .mul(10 ** SOL_INFO.decimals)
      .toDecimalPlaces(0)
      .toNumber()
  }
}

interface SwapStore {
  swapTokenAct: (props: { swapResponse: ApiSwapV1OutSuccess } & TxCallbackProps) => Promise<string | string[] | undefined>
  unWrapSolAct: (amount: string) => Promise<string | undefined>
  wrapSolAct: (amount: string) => Promise<string | undefined>
}

export interface ComputeParams {
  inputMint: string
  outputMint: string
  amount: string
}

const initSwapState = {}

export const useSwapStore = createStore<SwapStore>(
  () => ({
    ...initSwapState,

    swapTokenAct: async ({ swapResponse, ...txProps }) => {
      const { publicKey, raydium, txVersion, connection, signAllTransactions, urlConfigs } = useAppStore.getState()
      if (!raydium || !connection) {
        console.error('no connection')
        return
      }
      if (!publicKey || !signAllTransactions) {
        console.error('no wallet')
        return
      }
      // eslint-disable-next-line
      // @ts-ignore
      connection._confirmTransactionInitialTimeout = 3000

      try {
        const tokenMap = useTokenStore.getState().tokenMap
        const [inputToken, outputToken] = [tokenMap.get(swapResponse.data.inputMint)!, tokenMap.get(swapResponse.data.outputMint)!]
        const [isInputSol, isOutputSol] = [isSolWSol(swapResponse.data.inputMint), isSolWSol(swapResponse.data.outputMint)]

        const inputTokenAcc = await raydium.account.getCreatedTokenAccount({
          mint: new PublicKey(inputToken.address)
        })

        if (!inputTokenAcc && !isInputSol) {
          console.error('no input token acc')
          return
        }

        const outputTokenAcc = await raydium.account.getCreatedTokenAccount({
          mint: new PublicKey(outputToken.address)
        })

        const computeData = await getComputePrice()

        const isV0Tx = txVersion === TxVersion.V0
        const {
          data,
          success
        }: {
          id: string
          success: true
          version: 'V1'
          msg?: string
          data?: { transaction: string }[]
        } = await axios.post(
          `${urlConfigs.SWAP_HOST}${urlConfigs.SWAP_TX}${swapResponse.data.swapType === 'BaseIn' ? 'swap-base-in' : 'swap-base-out'}`,
          {
            wallet: publicKey.toBase58(),
            computeUnitPriceMicroLamports: String(computeData?.microLamports || ''),
            swapResponse,
            txVersion: isV0Tx ? 'V0' : 'LEGACY',
            wrapSol: isInputSol,
            unwrapSol: isOutputSol,
            inputAccount: inputTokenAcc?.toBase58(),
            outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58()
          }
        )

        if (!success) return
        const swapTransactions = data || []
        const allTxBuf = swapTransactions.map((tx) => Buffer.from(tx.transaction, 'base64'))
        const allTx = allTxBuf.map((txBuf) => (isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)))
        printSimulate(allTx as any)
        const signedTxs = await signAllTransactions(allTx)

        const swapMeta = getTxMeta({
          action: 'swap',
          values: {
            amountA: formatLocaleStr(
              new Decimal(swapResponse.data.inputAmount).div(10 ** (inputToken.decimals || 0)).toString(),
              inputToken.decimals
            )!,
            symbolA: getMintSymbol({ mint: inputToken, transformSol: true }),
            amountB: formatLocaleStr(
              new Decimal(swapResponse.data.outputAmount).div(10 ** (outputToken.decimals || 0)).toString(),
              outputToken.decimals
            )!,
            symbolB: getMintSymbol({ mint: outputToken, transformSol: true })
          }
        })
        const id = uuid()
        toastSubject.next({
          id,
          status: 'info',
          title: swapMeta.title + ' ' + i18n.t('transaction.sending'),
          description: swapMeta.description,
          duration: 1000 * 60 * 2 + 1000 * 6
        })
        const processedId = await retry<string[]>(
          async () => {
            const processedId: string[] = []
            for await (const tx of signedTxs) {
              const txId =
                tx instanceof Transaction
                  ? await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 1 })
                  : await connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 1 })
              processedId.push(txId)

              const res = await connection.confirmTransaction(txId, 'processed')
              if (res.value.err) {
                console.log('tx error:', res)
                throw new Error('tx failed')
              }
            }
            return processedId
          },
          {
            retryCount: 40,
            interval: 3000,
            errorMsg: i18n.t('transaction.send_failed', { title: swapMeta.title }) as string,
            onError: () =>
              toastSubject.next({
                id,
                close: true
              })
          }
        )

        toastSubject.next({
          id,
          close: true
        })

        txProps.onSuccess?.()
        if (processedId.length <= 1) {
          txStatusSubject.next({ txId: processedId[0], ...swapMeta, mintInfo: [inputToken, outputToken], onConfirmed: txProps.onConfirmed })
        } else {
          multiTxStatusSubject.next({
            toastId: uuid(),
            ...swapMeta,
            subTxIds: processedId.map((txId, idx) => {
              const titleKey =
                idx === 0
                  ? 'transaction_history.set_up'
                  : idx === processedId.length - 1 && processedId.length > 2
                  ? 'transaction_history.clean_up'
                  : 'transaction_history.name_swap'
              return {
                txId,
                status: 'success',
                title: i18n.t(titleKey),
                txHistoryTitle: titleKey
              }
            })
          })
        }
      } catch (e: any) {
        txProps.onError?.()
        toastSubject.next({ txError: e })
      } finally {
        // eslint-disable-next-line
        // @ts-ignore
        connection._confirmTransactionInitialTimeout = 30 * 1000
        txProps.onFinally?.()
      }
      return ''
    },

    unWrapSolAct: async (amount: string): Promise<string | undefined> => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const { execute } = await raydium.tradeV2.unWrapWSol(raydium.decimalAmount({ mint: WSOLMint, amount })!)

      return execute()
        .then((txId) => {
          txStatusSubject.next({ txId })
          return txId
        })
        .catch((e) => {
          toastSubject.next({ txError: e })
          return ''
        })
    },

    wrapSolAct: async (amount: string): Promise<string | undefined> => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const { execute } = await raydium.tradeV2.wrapWSol(raydium.decimalAmount({ mint: SOLMint, amount })!)
      return execute()
        .then((txId) => {
          txStatusSubject.next({ txId })
          return txId
        })
        .catch((e) => {
          toastSubject.next({ txError: e })
          return ''
        })
    }
  }),
  'useSwapStore'
)
