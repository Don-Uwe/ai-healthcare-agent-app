import { PublicKey, VersionedTransaction, Transaction } from '@solana/web3.js'
import { TxVersion, printSimulate, SOL_INFO } from '@raydium-io/raydium-sdk-v2'
import { createStore, useAppStore, useTokenStore } from '@/store'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject, TOAST_DURATION } from '@/hooks/toast/useTxStatus'
import { ApiSwapV1OutSuccess } from './type'
import { isSolWSol } from '@/utils/token'
import axios from '@/api/axios'
import { getTxMeta } from './swapMeta'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import Decimal from 'decimal.js'
import { TxCallbackProps } from '@/types/tx'
import i18n from '@/i18n'
import { fetchComputePrice } from '@/utils/tx/computeBudget'
import { trimTailingZero } from '@/utils/numberish/formatNumber'
import { getDefaultToastData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import { isSwapSlippageError } from '@/utils/tx/swapError'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

const getSwapComputePrice = async () => {
  const transactionFee = useAppStore.getState().getPriorityFee()
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
          programId: new PublicKey(inputToken.programId ?? TOKEN_PROGRAM_ID),
          mint: new PublicKey(inputToken.address),
          associatedOnly: false
        })

        if (!inputTokenAcc && !isInputSol) {
          console.error('no input token acc')
          return
        }

        const outputTokenAcc = await raydium.account.getCreatedTokenAccount({
          programId: new PublicKey(outputToken.programId ?? TOKEN_PROGRAM_ID),
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
            inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
            outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58()
          }
        )
        if (!success) {
          toastSubject.next({
            title: 'Make Transaction Error',
            description: 'Please try again, or contact us on discord',
            status: 'error'
          })
          onCloseToast && onCloseToast()
          return
        }

        const swapTransactions = data || []
        const allTxBuf = swapTransactions.map((tx) => Buffer.from(tx.transaction, 'base64'))
        const allTx = allTxBuf.map((txBuf) => (isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)))
        printSimulate(allTx as any)
        const signedTxs = await signAllTransactions(allTx)

        const txLength = signedTxs.length
        const { toastId, handler } = getDefaultToastData({
          txLength,
          ...txProps
        })

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

        const processedId: {
          txId: string
          status: 'success' | 'error' | 'sent'
          signedTx: Transaction | VersionedTransaction
        }[] = []

        const getSubTxTitle = (idx: number) => {
          return idx === 0
            ? 'transaction_history.set_up'
            : idx === processedId.length - 1 && processedId.length > 2
              ? 'transaction_history.clean_up'
              : 'transaction_history.name_swap'
        }

        let i = 0
        const checkSendTx = async (): Promise<void> => {
          if (!signedTxs[i]) return
          const tx = signedTxs[i]
          const txId =
            tx instanceof Transaction
              ? await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
              : await connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 0 })
          processedId.push({ txId, signedTx: tx, status: 'sent' })

          if (signedTxs.length === 1) {
            txStatusSubject.next({
              txId,
              ...swapMeta,
              signedTx: tx,
              onClose: onCloseToast,
              isSwap: true,
              mintInfo: [inputToken, outputToken],
              ...txProps
            })
            return
          }
          let timeout = 0
          const subId = connection.onSignature(
            txId,
            (signatureResult) => {
              timeout && window.clearTimeout(timeout)
              const targetTxIdx = processedId.findIndex((tx) => tx.txId === txId)
              if (targetTxIdx > -1) processedId[targetTxIdx].status = signatureResult.err ? 'error' : 'success'
              handleMultiTxRetry(processedId)
              const isSlippageError = isSwapSlippageError(signatureResult)
              handleMultiTxToast({
                toastId,
                processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
                txLength,
                meta: {
                  ...swapMeta,
                  title: isSlippageError ? i18n.t('error.error.swap_slippage_error_title')! : swapMeta.title,
                  description: isSlippageError ? i18n.t('error.error.swap_slippage_error_desc')! : swapMeta.description
                },
                isSwap: true,
                handler,
                getSubTxTitle,
                onCloseToast
              })
              if (!signatureResult.err) checkSendTx()
            },
            'processed'
          )
          connection.getSignatureStatus(txId)
          handleMultiTxRetry(processedId)
          handleMultiTxToast({
            toastId,
            processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
            txLength,
            meta: swapMeta,
            isSwap: true,
            handler,
            getSubTxTitle,
            onCloseToast
          })

          timeout = window.setTimeout(() => {
            connection.removeSignatureListener(subId)
          }, TOAST_DURATION)

          i++
        }
        checkSendTx()
      } catch (e: any) {
        txProps.onError?.()
        if (e.message !== 'tx failed') toastSubject.next({ txError: e })
      } finally {
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
      const { execute } = await raydium.tradeV2.wrapWSol(new Decimal(amount).mul(10 ** SOL_INFO.decimals).toFixed(0))
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
