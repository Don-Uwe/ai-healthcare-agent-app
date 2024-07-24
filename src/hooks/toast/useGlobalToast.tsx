import { ToastPosition, useToast, UseToastOptions, ToastId } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Subject } from 'rxjs'

import { Toast } from '@/components/Toast'
import { v4 as uuid } from 'uuid'

export interface RenderProps extends UseToastOptions {
  /**
   * Function to close the toast
   */
  onClose(): void
}

export const toastSubject = new Subject<
  UseToastOptions & {
    detail?: ReactNode
    txError?: Error
    noRpc?: boolean
    // update usage
    update?: boolean
    close?: boolean
    onClose?: () => void
  }
>()

const toastConfig = {
  duration: 8000,
  isClosable: true,
  position: 'bottom-right' as ToastPosition,
  containerStyle: {
    maxWidth: '300px',
    '& .chakra-alert__desc': {
      wordBreak: 'break-word'
    }
  }
}

const userClosedToastIds = new Map<string | number, string>()

function useGlobalToast() {
  const toast = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const sub = toastSubject.asObservable().subscribe(({ id, update, close, txError, noRpc, ...data }) => {
      id = id ?? uuid()
      const handleClose = (props: RenderProps) => {
        data.onClose?.()
        toast.close(props.id as ToastId)
        userClosedToastIds.set(props.id as ToastId, status)
      }
      const status = data.status === 'error' || data.status === 'success' || data.status === 'warning' ? data.status : 'info'
      if (close) {
        if (id) {
          toast.close(id)
          userClosedToastIds.set(id as ToastId, status)
        }
        return
      }
      if (id && userClosedToastIds.has(id) && userClosedToastIds.get(id) === status) return
      if (update && id && toast.isActive(id)) {
        toast.update(id, {
          duration: data.duration || toastConfig.duration,
          position: data.position || toastConfig.position,
          ...data,
          render: (props: RenderProps) => (
            <Toast state={{ ...toastConfig, ...data, status }} id={props.id!} onClose={() => handleClose(props)} />
          )
        })
        return
      }
      if (txError) {
        const errorMsg =
          txError.message.includes("versioned transactions isn't supported") ||
          txError.message.includes('.serializeMessage') ||
          txError.message.includes('forEach')
            ? 'Transaction cancelled\nThis wallet might not support Versioned Transaction, turn it off and try again.'
            : txError.message

        toast({
          id,
          duration: data.duration || toastConfig.duration,
          position: data.position || toastConfig.position,
          status: 'error',
          ...data,
          render: (props: RenderProps) => {
            return (
              <Toast
                state={{
                  ...toastConfig,
                  ...data,
                  title: data.title ? `${data.title} ${t('transaction.failed')}` : t('transaction.failed'),
                  description: errorMsg,
                  status: 'error'
                }}
                id={props.id!}
                onClose={() => handleClose(props)}
              />
            )
          }
        })
        return
      }
      if (noRpc) {
        toast({
          id,
          duration: data.duration || toastConfig.duration,
          position: data.position || toastConfig.position,
          status: 'error',
          render: (props: RenderProps) => (
            <Toast
              state={{ ...toastConfig, ...data, status: 'error', title: 'Error', description: 'No Rpc Connection' }}
              id={props.id!}
              onClose={() => handleClose(props)}
            />
          )
        })
        return
      }
      toast({
        id,
        duration: data.duration || toastConfig.duration,
        position: data.position || toastConfig.position,
        ...data,
        render: (props: RenderProps) => (
          <Toast
            state={{
              ...toastConfig,
              ...data,
              status: data.status === 'error' || data.status === 'info' || data.status === 'warning' ? data.status : 'success'
            }}
            id={props.id!}
            onClose={() => handleClose(props)}
          />
        )
      })
    })

    return () => sub.unsubscribe()
  }, [toast])
}

export default useGlobalToast
