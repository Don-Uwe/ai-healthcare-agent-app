import i18n from '@/i18n'
import { multiTxStatusSubject } from './useTxStatus'
import { ToastStatus } from '@/types/tx'

export const generateDefaultIds = (length: number): { txId: string; status: ToastStatus }[] =>
  new Array(length).fill({ txId: '', status: 'info' })

export default function showMultiToast({
  toastId,
  processedId,
  meta,
  getSubTxTitle,
  txLength
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
