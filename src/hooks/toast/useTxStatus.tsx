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
    onConfirmed?: (signatureResult: SignatureResult, context: Context) => void
    onError?: (signatureResult: SignatureResult, context: Context) => void
    onSuccess?: (signatureResult: SignatureResult, context: Context) => void
  }
>()

export const multiTxStatusSubject = new Subject<
  TxMeta & {
    toastId: string
    subTxIds: (TxMeta & { txId: string; status?: 'success' | 'error' })[]
    txValues?: Record<string, any>
    mintInfo?: ApiV3Token[]

    onError?: (signatureResult: SignatureResult, context: Context) => void
    onSuccess?: (signatureResult: SignatureResult, context: Context) => void
  }
>()

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
          onConfirmed,
          onError,
          onSuccess
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
            duration: 60 * 1000 * 2
          })

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

          connection.onSignature(
            txId,
            (signatureResult, context) => {
              onConfirmed?.(signatureResult, context)
              if (signatureResult.err) {
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
                    detail: renderDetail('error')
                  })

                onError?.(signatureResult, context)
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
                  status: 'success'
                })

                onSuccess?.(signatureResult, context)
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
        ({ toastId, subTxIds, title, txHistoryTitle, description, txHistoryDesc = '', txValues, mintInfo = [], onError, onSuccess }) => {
          const owner = useAppStore.getState().publicKey?.toBase58()
          const isMultisigWallet = useAppStore.getState().wallet?.adapter.name === 'SquadsX'
          const txStatus: Record<string, 'success' | 'error'> = {}

          subTxIds.forEach((tx) => {
            if (tx.status) txStatus[tx.txId] = tx.status
          })

          const renderDetail = () => {
            return (
              <Flex flexDirection="column" gap="3">
                {subTxIds.map(({ txId, title = t('transaction.title') }) => (
                  <Box
                    key={txId}
                    bg={colors.backgroundDark}
                    borderRadius="8px"
                    p={3}
                    ml="-30px"
                    cursor={'pointer'}
                    opacity={txStatus[txId] ? 1 : 0.5}
                    onClick={() => window.open(`${explorerUrl}/tx/${txId}`)}
                  >
                    <Flex alignItems="center" gap="2">
                      {txStatus[txId] === 'error' ? <CircleError /> : <CircleCheck fill={colors.secondary} />}
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
            title: title || `${t('transaction.title')} ${t('transaction.sent')}`,
            description,
            detail: renderDetail(),
            status: 'info',
            duration: 1000 * 30
          })

          setTxRecord({
            status: 'info',
            title: txHistoryTitle || 'transaction.title',
            description: txHistoryDesc,
            txId: toastId,
            owner,
            mintInfo,
            txValues,
            subTx: subTxIds.map(({ txId, txHistoryTitle }) => ({
              txId,
              name: txHistoryTitle || '',
              status: 'success',
              date: Date.now()
            })),
            isMultiSig: isMultisigWallet
          })

          subTxIds.forEach(({ txId }) => {
            connection.onSignature(
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
                    detail: renderDetail()
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
                    status: 'success'
                  })

                  if (Object.values(txStatus).length === subTxIds.length) onSuccess?.(signatureResult, context)

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
