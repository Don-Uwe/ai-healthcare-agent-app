import { ToastStatus } from '@/types/tx'
import { isClient } from '../common'

const HISTORY_KEY = '_r_tx_history_'

interface RecordProps {
  status: ToastStatus
  title: string
  description: string
  txId: string
  owner?: string
  mintInfo?: { address: string; logoURI: string; symbol: string }[]
  subTx?: { txId?: string; name: string; status: ToastStatus; date: number }[]
  txValues?: Record<string, any>
  time: number
  isMultiSig?: boolean
  cleanLocalStorage?: boolean
}
export const setTxRecord = (props: Omit<RecordProps, 'time'>): boolean => {
  if (!isClient()) return false
  // props.description = props.description?.replaceAll(/(<([^>]+)>)/gi, '')
  const raw = localStorage.getItem(HISTORY_KEY) || '[]'
  let storageData: RecordProps[] = []

  try {
    storageData = JSON.parse(raw)
  } catch {
    // if error means storage data damage
    localStorage.removeItem(HISTORY_KEY)
  }

  try {
    // if tx data > 1.5 MB || set up clean
    if (props.cleanLocalStorage || new Blob([raw]).size > 1024 * 1024 * 1.5) {
      storageData = storageData.slice(Math.floor(storageData.length / 4), storageData.length)
      console.log('clean tx storage data done!')
    }
  } catch {
    console.error('clean tx storage data error')
  }

  const foundIdx = storageData.findIndex((data) => data.txId === props.txId)
  if (foundIdx > -1) {
    storageData[foundIdx] = {
      ...props,
      mintInfo: props.mintInfo || [],
      time: Date.now()
    }
  } else {
    storageData.push({
      ...props,
      mintInfo: props.mintInfo || [],
      time: Date.now()
    })
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(storageData))
    return true
  } catch (err: any) {
    if (err.message.includes('exceeded the quota') && !props.cleanLocalStorage) {
      setTxRecord({
        ...props,
        cleanLocalStorage: true
      })
    }
    return false
  }
}

export const getTxAllRecord = (): RecordProps[] => {
  if (!isClient()) return []
  const raw = localStorage.getItem(HISTORY_KEY) || '[]'
  let storageData: RecordProps[] = []
  try {
    storageData = JSON.parse(raw)
    return storageData.reverse()
  } catch {
    return []
  }
}
