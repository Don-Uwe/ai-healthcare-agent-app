import { VersionedTransaction, Transaction } from '@solana/web3.js'
import { retry, idToIntervalRecord, cancelRetry } from '@/utils/common'
import { useAppStore } from '@/store'

const retryRecord = new Map<
  string,
  {
    done: boolean
  }
>()

export default function retryTx({ tx, id }: { tx: Transaction | VersionedTransaction; id: string }) {
  const connection = useAppStore.getState().connection
  if (!connection || retryRecord.has(id)) return
  retryRecord.set(id, {
    done: false
  })
  retry(
    async () => {
      if (retryRecord.get(id)!.done) return true
      tx instanceof Transaction
        ? await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
        : await connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 0 })
      throw new Error('sending')
    },
    {
      id,
      retryCount: 40,
      interval: 3000,
      sleepTime: 3000
    }
  ).catch((e) => {
    console.error('retry failed', e.message)
  })
}

export const cancelRetryTx = (txId: string) => {
  cancelRetry(idToIntervalRecord.get(txId))
  retryRecord.set(txId, { done: true })
}

export const handleMultiTxRetry = (
  processedData: {
    txId: string
    status: 'success' | 'error' | 'sent'
    signedTx: Transaction | VersionedTransaction
  }[]
) => {
  processedData.forEach((data) => {
    if (data.status === 'sent') {
      retryTx({ tx: data.signedTx, id: data.txId })
      return
    }
    cancelRetryTx(data.txId)
  })
}
