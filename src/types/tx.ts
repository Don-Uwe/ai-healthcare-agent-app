export interface TxCallbackProps<O = any> {
  onSuccess?: (props?: O) => void
  onError?: () => void
  onFinally?: (props?: O) => void
  onConfirmed?: () => void
}
