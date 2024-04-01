import { useEffect, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SignatureResult, Context } from '@solana/web3.js'
import { Flex, Box } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { Subject } from 'rxjs'

import { useAppStore } from '@/store/useAppStore'
import ExternalLink from '@/icons/misc/ExternalLink'
import { setTxRecord } from '@/utils/tx/historyTxStatus'

import { toastSubject } from './useGlobalToast'
import { colors } from '@/theme/cssVariables/colors'
import CircleCheck from '@/icons/misc/CircleCheck'
import CircleError from '@/icons/misc/CircleError'
import CircleInfo from '@/icons/misc/CircleInfo'
import { ToastStatus } from '@/types/tx'

export interface TxMeta {
  title?: string | ReactNode
  description?: string | ReactNode
  txHistoryTitle?: string
  txHistoryDesc?: string
}

export const txStatusSubject = new Subject<
  TxMeta & {
    txId: string
    txValues?: Record<string, any>
    mintInfo?: ApiV3Token[]
    hideResultToast?: boolean
    update?: boolean
    skipWatchSignature?: boolean
    onConfirmed?: (signatureResult: SignatureResult, context: Context) => void
    onError?: (signatureResult: SignatureResult, context: Context) => void
    onSuccess?: () => void
    onClose?: () => void
  }
>()

export const multiTxStatusSubject = new Subject<
  TxMeta & {
    toastId: string
    status?: ToastStatus
    update?: boolean
    subTxIds: (TxMeta & { txId: string; status?: ToastStatus })[]
    txValues?: Record<string, any>
    mintInfo?: ApiV3Token[]
    duration?: number
    skipWatchSignature?: boolean

    onError?: (signatureResult: SignatureResult, context: Context) => void
    onSuccess?: () => void
    onClose?: () => void
  }
>()

const subscribeMap = new Map<string, number>()

function useTxStatus() {
  const { t } = useTranslation()
  const connection = useAppStore((s) => s.connection)
  const explorerUrl = useAppStore((s) => s.explorerUrl)

  useEffect(() => {
    if (!connection) return
    const sub = txStatusSubject
      .asObservable()
      .subscribe(
        ({
          txId,
          title,
          txHistoryTitle,
          description,
          txHistoryDesc = '',
          txValues,
          mintInfo = [],
          hideResultToast,
          update,
          skipWatchSignature,
          onConfirmed,
          onError,
          onSuccess,
          onClose
        }) => {
          const owner = useAppStore.getState().publicKey?.toBase58()
          const isMultisigWallet = useAppStore.getState().wallet?.adapter.name === 'SquadsX'

          const renderDetail = (status = '') => {
            if (isMultisigWallet) return null
            return (
              <Flex
                gap="1"
                alignItems="center"
                onClick={() => window.open(`${explorerUrl}/tx/${txId}`)}
                cursor={'pointer'}
                opacity={status ? 1 : 0.5}
              >
                {t('transaction.view_detail')}
                <ExternalLink cursor="pointer" />
              </Flex>
            )
          }

          // show initial tx send toast
          toastSubject.next({
            id: txId,
            title: title || `${t('transaction.title')} ${t('transaction.sent')}`,
            description: isMultisigWallet
              ? `${description} ${t('transaction.multisig_wallet_initiation')}`
              : description || `${explorerUrl}/tx/${txId}`,
            detail: renderDetail(),
            status: 'info',
            duration: 2 * 60 * 1000,
            update,
            onClose
          })
          onSuccess?.()

          setTxRecord({
            status: 'info',
            title: txHistoryTitle || 'transaction.title',
            description: txHistoryDesc || '',
            txId,
            owner,
            mintInfo,
            txValues,
            isMultiSig: isMultisigWallet
          })

          if (subscribeMap.has(txId)) return
          if (!txId || skipWatchSignature) return
          const subId = connection.onSignature(
            txId,
            (signatureResult, context) => {
              if (signatureResult.err) {
                onError?.(signatureResult, context)
                // update toast status to error
                !hideResultToast &&
                  toastSubject.next({
                    id: txId,
                    update: true,
                    title:
                      (isMultisigWallet ? `${title} ${t('transaction.multisig_wallet_initiation')}` : title) +
                      ` ${t('transaction.failed')}`,
                    status: 'error',
                    description: description || `${explorerUrl}/tx/${txId}`,
                    detail: renderDetail('error'),
                    onClose
                  })
                setTxRecord({
                  status: 'error',
                  title: txHistoryTitle || 'transaction.title',
                  description: txHistoryDesc || '',
                  txId,
                  owner,
                  mintInfo,
                  txValues,
                  isMultiSig: isMultisigWallet
                })
              } else {
                onConfirmed?.(signatureResult, context)
                if (hideResultToast) return
                // update toast status to success
                toastSubject.next({
                  id: txId,
                  update: true,
                  title: isMultisigWallet
                    ? t('transaction.multisig_wallet_initiated')
                    : `${title || t('transaction.title')} ${t('transaction.confirmed')}`,
                  description: isMultisigWallet ? t('transaction.multisig_wallet_desc') : description || `${explorerUrl}/tx/${txId}`,
                  detail: renderDetail('success'),
                  status: 'success',
                  onClose
                })

                setTxRecord({
                  status: 'success',
                  title: txHistoryTitle || 'transaction.title',
                  description: txHistoryDesc || '',
                  txId,
                  owner,
                  mintInfo,
                  txValues,
                  isMultiSig: isMultisigWallet
                })
              }
            },
            'processed'
          )

          subscribeMap.set(txId, subId)
          connection.getSignatureStatus(txId)
        }
      )

    return () => {
      sub?.unsubscribe()
    }
  }, [connection])

  useEffect(() => {
    if (!connection) return
    const sub = multiTxStatusSubject
      .asObservable()
      .subscribe(
        ({
          toastId,
          subTxIds,
          status,
          title,
          txHistoryTitle,
          description,
          txHistoryDesc = '',
          txValues,
          mintInfo = [],
          update,
          duration,
          skipWatchSignature,
          onError,
          onSuccess,
          onClose
        }) => {
          const owner = useAppStore.getState().publicKey?.toBase58()
          const isMultisigWallet = useAppStore.getState().wallet?.adapter.name === 'SquadsX'
          const txStatus: Record<string, ToastStatus> = {}

          subTxIds.forEach((tx) => {
            if (tx.status) txStatus[tx.txId] = tx.status
          })

          const renderDetail = () => {
            return (
              <Flex flexDirection="column" gap="3">
                {subTxIds.map(({ txId, title = t('transaction.title') }, idx) => (
                  <Box
                    key={txId || `${toastId}-${idx}`}
                    bg={colors.backgroundDark}
                    borderRadius="8px"
                    p={3}
                    ml="-30px"
                    cursor={txId ? 'pointer' : 'default'}
                    opacity={txId ? 1 : 0.5}
                    onClick={txId ? () => window.open(`${explorerUrl}/tx/${txId}`) : undefined}
                  >
                    <Flex alignItems="center" gap="2">
                      {txStatus[txId] === 'error' ? (
                        <CircleError />
                      ) : txStatus[txId] === 'info' ? (
                        <CircleInfo width="16px" height="16px" />
                      ) : (
                        <CircleCheck fill={colors.secondary} />
                      )}
                      <Box
                        fontSize={14}
                        fontWeight={400}
                        color={colors.textSecondary}
                        textOverflow="ellipsis"
                        whiteSpace="pre-wrap"
                        overflow="hidden"
                      >
                        {title || t('transaction.title')}
                        {isMultisigWallet
                          ? txStatus[txId] === 'success'
                            ? `${t('transaction.multisig_wallet_initiated')} ${t('transaction.multisig_wallet_desc')}`
                            : t('transaction.multisig_wallet_initiation')
                          : null}
                      </Box>
                    </Flex>
                    {isMultisigWallet ? null : (
                      <Flex gap="1" alignItems="center" opacity="0.5">
                        {t('transaction.view_detail')}
                        <ExternalLink cursor="pointer" />
                      </Flex>
                    )}
                  </Box>
                ))}
              </Flex>
            )
          }
          // show initial tx send toast
          toastSubject.next({
            id: toastId,
            update,
            title: title || `${t('transaction.title')} ${t('transaction.sent')}`,
            description,
            detail: renderDetail(),
            status: status || 'info',
            duration: duration || 2 * 60 * 1000,
            onClose
          })

          setTxRecord({
            status: status || 'info',
            title: txHistoryTitle || 'transaction.title',
            description: txHistoryDesc,
            txId: toastId,
            owner,
            mintInfo,
            txValues,
            subTx: subTxIds.map(({ txId, txHistoryTitle, status }) => ({
              txId,
              name: txHistoryTitle || '',
              status: status ?? 'info',
              date: Date.now()
            })),
            isMultiSig: isMultisigWallet
          })

          if (!skipWatchSignature)
            subTxIds.forEach(({ txId }) => {
              if (subscribeMap.has(txId)) return
              const subId = connection.onSignature(
                txId,
                (signatureResult, context) => {
                  txStatus[txId] = signatureResult.err ? 'error' : 'success'
                  if (signatureResult.err) {
                    // update toast status to error
                    toastSubject.next({
                      id: toastId,
                      update: true,
                      title:
                        (isMultisigWallet ? `${title} ${t('transaction.multisig_wallet_initiation')}` : title || t('transaction.title')) +
                        t('transaction.failed'),
                      status: 'error',
                      description,
                      detail: renderDetail(),
                      onClose
                    })

                    onError?.(signatureResult, context)
                    setTxRecord({
                      status: 'success',
                      title: txHistoryTitle || 'transaction.failed',
                      description: txHistoryDesc,
                      txId: toastId,
                      owner,
                      mintInfo,
                      txValues,
                      subTx: subTxIds.map(({ txId: tx, txHistoryTitle }) => ({
                        txId: tx,
                        name: txHistoryTitle || '',
                        status: txId === tx ? 'error' : 'success',
                        date: Date.now()
                      })),
                      isMultiSig: isMultisigWallet
                    })
                  } else {
                    // update toast status to success
                    toastSubject.next({
                      id: toastId,
                      update: true,
                      title: isMultisigWallet
                        ? t('transaction.multisig_wallet_initiated')
                        : title
                        ? `${title} ${t('transaction.confirmed')}`
                        : `${t('transaction.title')} ${t('transaction.confirmed')}`,
                      description,
                      detail: renderDetail(),
                      status: 'success',
                      onClose
                    })

                    if (Object.values(txStatus).length === subTxIds.length) onSuccess?.()

                    setTxRecord({
                      status: 'success',
                      title: txHistoryTitle || 'transaction.failed',
                      description: txHistoryDesc,
                      txId: toastId,
                      owner,
                      mintInfo,
                      txValues,
                      subTx: subTxIds.map(({ txId: tx, txHistoryTitle }) => ({
                        txId: tx,
                        name: txHistoryTitle || '',
                        status: 'success',
                        date: Date.now()
                      })),
                      isMultiSig: isMultisigWallet
                    })
                  }
                },
                'processed'
              )
              subscribeMap.set(txId, subId)
              connection.getSignatureStatus(txId)
            })
        }
      )

    return () => {
      sub?.unsubscribe()
    }
  }, [connection])
}

export default useTxStatus
