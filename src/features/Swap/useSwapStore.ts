import { PublicKey, VersionedTransaction, Transaction } from '@solana/web3.js'
import { SOLMint, TxVersion, printSimulate, SOL_INFO } from '@raydium-io/raydium-sdk-v2'
import { createStore, useAppStore, useTokenStore } from '@/store'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject } from '@/hooks/toast/useTxStatus'
import showMultiToast from '@/hooks/toast/multiToastUtil'
import { ApiSwapV1OutSuccess } from './type'
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
import { fetchComputePrice } from '@/utils/tx/computeBudget'
import { ToastStatus } from '@/types/tx'
import { trimTailingZero } from '@/utils/numberish/formatNumber'

const getSwapComputePrice = async () => {
  const transactionFee = useAppStore.getState().transactionFee
  if (isNaN(parseFloat(String(transactionFee) || ''))) {
    const json = await fetchComputePrice()
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
  swapTokenAct: (
    props: { swapResponse: ApiSwapV1OutSuccess; wrapSol?: boolean; unwrapSol?: boolean; onCloseToast?: () => void } & TxCallbackProps
  ) => Promise<string | string[] | undefined>
  unWrapSolAct: (props: { amount: string; onClose?: () => void; onSent?: () => void; onError?: () => void }) => Promise<string | undefined>
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

    swapTokenAct: async ({ swapResponse, wrapSol, unwrapSol = false, onCloseToast, ...txProps }) => {
      const { publicKey, raydium, txVersion, connection, signAllTransactions, urlConfigs } = useAppStore.getState()
      if (!raydium || !connection) {
        console.error('no connection')
        return
      }
      if (!publicKey || !signAllTransactions) {
        console.error('no wallet')
        return
      }

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

        const computeData = await getSwapComputePrice()

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
            computeUnitPriceMicroLamports: new Decimal(computeData?.microLamports || 0).toFixed(0),
            swapResponse,
            txVersion: isV0Tx ? 'V0' : 'LEGACY',
            wrapSol: isInputSol,
            unwrapSol,
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
            symbolA: getMintSymbol({ mint: inputToken, transformSol: wrapSol }),
            amountB: formatLocaleStr(
              new Decimal(swapResponse.data.outputAmount).div(10 ** (outputToken.decimals || 0)).toString(),
              outputToken.decimals
            )!,
            symbolB: getMintSymbol({ mint: outputToken, transformSol: unwrapSol })
          }
        })
        const toastId = uuid()
        const processedId: { txId: string; status: 'success' | 'error' | 'info' }[] = []
        for (let i = 0; i < signedTxs.length; i++) {
          processedId.push({
            txId: '',
            status: 'info'
          })
        }
        let swapDone = false
        const showToast = (processedId: { txId: string; status: ToastStatus }[]) => {
          if (swapDone) return
          if (signedTxs.length <= 1) {
            if (processedId[0].status !== 'info') return
            txStatusSubject.next({
              txId: processedId[0].txId,
              ...swapMeta,
              mintInfo: [inputToken, outputToken],
              onClose: onCloseToast,
              onConfirmed: () => {
                txProps.onConfirmed?.()
                processedId[0].status = 'success'
              },
              onError: () => {
                txProps.onError?.()
                processedId[0].status = 'error'
              },
              update: true
            })
          } else {
            showMultiToast({
              toastId,
              processedId,
              meta: swapMeta,
              txLength: signedTxs.length,
              onClose: onCloseToast,
              getSubTxTitle(idx: number) {
                return idx === 0
                  ? 'transaction_history.set_up'
                  : idx === processedId.length - 1 && processedId.length > 2
                  ? 'transaction_history.clean_up'
                  : 'transaction_history.name_swap'
              }
            })
          }
        }

        const subscribedTx = new Set<string>()

        const subscribeTx = (txId: string) => {
          if (subscribedTx.has(txId) || processedId.length <= 1) return
          subscribedTx.add(txId)
          connection.onSignature(
            txId,
            (signatureResult) => {
              const idx = processedId.findIndex((p) => p.txId === txId)
              if (processedId[idx]) {
                processedId[idx].status = !signatureResult.err ? 'success' : 'error'
              }
            },
            'confirmed'
          )
          connection.getSignatureStatus(txId)
        }

        const checkStatus = (idx: number) => {
          if (processedId[idx].status !== 'info') {
            showToast(processedId)

            if (processedId[idx].status === 'error') {
              // 1 failed
              swapDone = true
              throw new Error('tx failed')
            }

            if (idx === signedTxs.length - 1) {
              // all success
              swapDone = true
              return
            }
          }
        }

        // eslint-disable-next-line
        // @ts-ignore
        connection._confirmTransactionInitialTimeout = 3000
        for await (const [idx, tx] of signedTxs.entries()) {
          if (swapDone) return
          await retry(
            async () => {
              checkStatus(idx)
              if (swapDone || processedId[idx].status !== 'info') return
              const txId =
                tx instanceof Transaction
                  ? await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
                  : await connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 0 })
              processedId[idx].txId = txId
              showToast(processedId)
              subscribeTx(txId)
              checkStatus(idx)
              if (swapDone) return
              throw new Error('sending')
            },
            {
              retryCount: 40,
              interval: 3000,
              errorMsg: i18n.t('transaction.send_failed', { title: swapMeta.title }) as string,
              onError: (errorMsg?: string) => {
                if (errorMsg !== 'tx failed') {
                  swapDone = true
                  toastSubject.next({ id: signedTxs.length > 1 ? toastId : processedId[0].txId, close: true })
                }
              }
            }
          )
        }
      } catch (e: any) {
        txProps.onError?.()
        if (e.message !== 'tx failed') toastSubject.next({ txError: e })
      } finally {
        // eslint-disable-next-line
        // @ts-ignore
        connection._confirmTransactionInitialTimeout = 30 * 1000
        txProps.onFinally?.()
      }
      return ''
    },

    unWrapSolAct: async ({ amount, onSent, onError, ...txProps }): Promise<string | undefined> => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const { execute } = await raydium.tradeV2.unWrapWSol({
        amount
        // computeBudgetConfig: await getComputeBudgetConfig()
      })

      const values = { amount: trimTailingZero(new Decimal(amount).div(10 ** SOL_INFO.decimals).toFixed(SOL_INFO.decimals)) }
      const meta = {
        title: i18n.t('swap.unwrap_all_wsol', values),
        description: i18n.t('swap.unwrap_all_wsol_desc', values),
        txHistoryTitle: 'swap.unwrap_all_wsol',
        txHistoryDesc: 'swap.unwrap_all_wsol_desc',
        txValues: values
      }

      return execute()
        .then(({ txId, signedTx }) => {
          onSent?.()
          txStatusSubject.next({ txId, signedTx, ...meta, ...txProps })
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ txError: e, ...meta })
          return ''
        })
    },

    wrapSolAct: async (amount: string): Promise<string | undefined> => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const { execute } = await raydium.tradeV2.wrapWSol(raydium.decimalAmount({ mint: SOLMint, amount })!)
      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, signedTx })
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
