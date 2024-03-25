import { isClient } from '../common'

const HISTORY_KEY = '_r_tx_history_'

interface RecordProps {
  status: 'error' | 'success' | 'info'
  title: string
  description: string
  txId: string
  owner?: string
  mintInfo?: { address: string; logoURI: string; symbol: string }[]
  subTx?: { txId?: string; name: string; status: 'error' | 'success'; date: number }[]
  txValues?: Record<string, any>
  time: number
  isMultiSig?: boolean
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
    localStorage.setItem(HISTORY_KEY, JSON.stringify(storageData))
    return true
  } catch {
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
