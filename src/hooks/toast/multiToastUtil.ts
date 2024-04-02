import i18n from '@/i18n'
import { txStatusSubject, multiTxStatusSubject } from './useTxStatus'
import { ToastStatus, TxCallbackProps } from '@/types/tx'
import { v4 as uuid } from 'uuid'

const toastStatusSet = new Set<string>(['success', 'error', 'info'])
export type ProcessedId = { txId: string; status: ToastStatus }[]

export const generateDefaultIds = (length: number): ProcessedId => new Array(length).fill({ txId: '', status: 'info' })

export const getDefaultToastData = ({ txLength, ...txProps }: { txLength: number } & TxCallbackProps) => ({
  processedId: generateDefaultIds(txLength),
  toastId: uuid(),
  handler: callBackHandler({ transactionLength: txLength, ...txProps })
})

export const transformProcessData = ({
  data,
  processedId
}: {
  data: { txId: string; status: string }[]
  processedId: ProcessedId
}): ProcessedId =>
  processedId.map((prev, idx) => ({
    txId: data[idx]?.txId || prev.txId,
    status: !data[idx] || !toastStatusSet.has(data[idx].status) ? 'info' : (data[idx].status as ToastStatus)
  }))

export const handleMultiTxToast = (
  props: {
    toastId: string
    processedId: ProcessedId
    txLength: number
    meta: {
      title: string
      description: JSX.Element
      txHistoryTitle: string
      txHistoryDesc: string
      txValues: Record<string, unknown>
    }
    getSubTxTitle: (idx: number) => string
    handler: (
      processedId: {
        txId: string
        status: ToastStatus
      }[]
    ) => void
  } & TxCallbackProps
) => {
  const { toastId, txLength, processedId, meta, getSubTxTitle, handler, ...txProps } = props
  if (txLength <= 1) {
    if (processedId[0].txId)
      txStatusSubject.next({
        txId: processedId[0].txId,
        update: true,
        ...meta,
        onError: txProps.onError,
        onConfirmed: txProps.onConfirmed || txProps.onSent
      })
    return
  }

  const isError = processedId.some((t) => t.status === 'error')
  const isSuccess = processedId.filter((s) => s.status === 'success').length >= (props.txLength ?? props.processedId.length)

  multiTxStatusSubject.next({
    toastId,
    skipWatchSignature: true,
    update: true,
    status: isError ? 'error' : isSuccess ? 'success' : 'info',
    ...meta,
    title: props.meta.title + (isError ? ` ${i18n.t('transaction.failed')}` : ''),
    duration: isError || isSuccess ? 8000 : undefined,
    subTxIds: processedId.map((tx, idx) => {
      const titleKey = getSubTxTitle(idx)
      return {
        txId: tx.txId,
        status: tx.status,
        title: i18n.t(titleKey),
        txHistoryTitle: titleKey
      }
    })
  })
  handler(processedId)
}

export default function showMultiToast({
  toastId,
  processedId,
  meta,
  getSubTxTitle,
  txLength,
  onClose
}: {
  toastId: string
  processedId: {
    txId: string
    status: ToastStatus
  }[]
  meta: {
    title: string
    description: JSX.Element
    txHistoryTitle: string
    txHistoryDesc: string
    txValues: Record<string, unknown>
  }
  getSubTxTitle: (idx: number) => string
  txLength?: number
  onClose?: () => void
}) {
  const isError = processedId.some((t) => t.status === 'error')
  const isSuccess = processedId.filter((s) => s.status === 'success').length >= (txLength ?? processedId.length)

  multiTxStatusSubject.next({
    toastId,
    skipWatchSignature: true,
    update: true,
    status: isError ? 'error' : isSuccess ? 'success' : 'info',
    ...meta,
    title: meta.title + (isError ? ` ${i18n.t('transaction.failed')}` : ''),
    duration: isError || isSuccess ? 8000 : undefined,
    onClose,
    subTxIds: processedId.map((tx, idx) => {
      const titleKey = getSubTxTitle(idx)
      return {
        txId: tx.txId,
        status: tx.status,
        title: i18n.t(titleKey),
        txHistoryTitle: titleKey
      }
    })
  })
}

export const callBackHandler = ({
  transactionLength,
  ...callbackProps
}: {
  transactionLength: number
} & TxCallbackProps) => {
  let [successCalled, errorCalled, finallyCalled, confirmedCalled] = [false, false, false, false]

  return (
    processedId: {
      txId: string
      status: ToastStatus
    }[]
  ) => {
    if (processedId.some((tx) => tx.status === 'error')) {
      if (!errorCalled) callbackProps?.onError?.()
      if (!finallyCalled) callbackProps?.onFinally?.()
      errorCalled = true
      finallyCalled = true
      return
    }

    if (processedId.length === transactionLength) {
      if (!successCalled) callbackProps?.onSent?.()
      if (!finallyCalled) callbackProps?.onFinally?.()
      successCalled = true
      finallyCalled = true
    }

    if (processedId.filter((d) => d.status === 'success').length === transactionLength) {
      if (!confirmedCalled) callbackProps?.onConfirmed?.()
      confirmedCalled = true
    }
  }
}
