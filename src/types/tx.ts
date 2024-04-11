export interface TxCallbackProps<O = any> {
  onSent?: (props?: O) => void
  onError?: () => void
  onFinally?: (props?: O) => void
  onConfirmed?: () => void
}

export type ToastStatus = 'success' | 'error' | 'info' | 'warning'
