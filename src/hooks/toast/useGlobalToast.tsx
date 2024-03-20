import { ToastPosition, useToast, UseToastOptions } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Subject } from 'rxjs'

import { Toast } from '@/components/Toast'

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
  }
>()

const toastConfig = {
  duration: 5000,
  isClosable: true,
  position: 'bottom-right' as ToastPosition,
  containerStyle: {
    maxWidth: '300px',
    '& .chakra-alert__desc': {
      wordBreak: 'break-word'
    }
  }
}

function useGlobalToast() {
  const toast = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const sub = toastSubject.asObservable().subscribe(({ id, update, close, txError, noRpc, ...data }) => {
      if (close) {
        id && toast.close(id)
        return
      }
      if (update && id && toast.isActive(id)) {
        if (!id) return
        toast.update(id, {
          duration: data.duration || toastConfig.duration,
          position: data.position || toastConfig.position,
          ...data,
          render: (props: RenderProps) => (
            <Toast
              state={{ ...toastConfig, ...data, status: data.status === 'error' ? data.status : 'success' }}
              id={props.id!}
              onClose={props.onClose}
            />
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
                onClose={props.onClose}
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
              onClose={props.onClose}
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
            state={{ ...toastConfig, ...data, status: data.status === 'error' || data.status === 'info' ? data.status : 'success' }}
            id={props.id!}
            onClose={props.onClose}
          />
        )
      })
    })

    return () => sub.unsubscribe()
  }, [toast])
}

export default useGlobalToast
