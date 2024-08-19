import { VersionedTransaction, Transaction } from '@solana/web3.js'
import { retry, idToIntervalRecord, cancelRetry } from '@/utils/common'
import { useAppStore } from '@/store'
import axios from '@/api/axios'
import { txToBase64 } from '@raydium-io/raydium-sdk-v2'

const retryRecord = new Map<
  string,
  {
    done: boolean
  }
>()

export default function retryTx({ tx, id }: { tx: Transaction | VersionedTransaction; id: string }) {
  const { connection, urlConfigs } = useAppStore.getState()
  if (retryRecord.has(id)) return
  const sendApi = () => {
    try {
      axios
        .post(
          `${urlConfigs.SERVICE_BASE_HOST}${urlConfigs.SEND_TRANSACTION}`,
          {
            data: [txToBase64(tx)]
          },
          { skipError: true }
        )
        .catch((e) => {
          console.error('send tx to be error', e.message)
        })
    } catch {
      console.error('send tx to be error')
    }
  }
  sendApi()
  if (!connection) return
  retryRecord.set(id, {
    done: false
  })
  retry(
    async () => {
      if (retryRecord.get(id)!.done) return true
      try {
        tx instanceof Transaction
          ? await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
          : await connection.sendTransaction(tx, { skipPreflight: true, maxRetries: 0 })
      } catch {
        console.error('send tx to rpc error')
      }
      sendApi()

      throw new Error('sending')
    },
    {
      id,
      retryCount: 60,
      interval: 2000,
      sleepTime: 2000
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
