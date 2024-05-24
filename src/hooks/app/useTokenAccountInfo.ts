import { useEffect } from 'react'
import shallow from 'zustand/shallow'
import { useAppStore } from '@/store'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'
import { isDocumentVisible } from '@/utils/common'

const accountChangeCbk: (() => void)[] = []
export const addAccChangeCbk = (fn: () => void) => accountChangeCbk.push(fn)
export const removeAccChangeCbk = (fn: () => void) => {
  const idx = accountChangeCbk.findIndex((currentFn) => currentFn === fn)
  accountChangeCbk.splice(idx, 1)
}

function useTokenAccountInfo() {
  const [raydium, connection, publicKey, commitment] = useAppStore((s) => [s.raydium, s.connection, s.publicKey, s.commitment], shallow)

  const { fetchTokenAccountAct, tokenAccounts, tokenAccountRawInfos, refreshTokenAccTime, reset } = useTokenAccountStore()

  useEffect(() => {
    if (!connection || !publicKey) return
    fetchTokenAccountAct({})

    let timeoutId = 0

    const listenerId = connection.onAccountChange(
      publicKey,
      () => {
        fetchTokenAccountAct({ commitment, forceFetch: true })
        accountChangeCbk.forEach((cb) => cb())
        if (timeoutId) window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(() => {
          fetchTokenAccountAct({ commitment })
          accountChangeCbk.forEach((cb) => cb())
        }, 6 * 1000)
      },
      commitment
    )

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      connection.removeAccountChangeListener(listenerId)
    }
    // eslint-disable-next-line
  }, [connection?.rpcEndpoint, publicKey])

  useEffect(() => {
    if (!connection || !publicKey) return

    const intervalId = window.setInterval(() => {
      if (!isDocumentVisible()) return
      fetchTokenAccountAct({})
    }, 3 * 60 * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
    // eslint-disable-next-line
  }, [connection?.rpcEndpoint, publicKey, refreshTokenAccTime])

  useEffect(() => {
    if (raydium) {
      raydium.account.updateTokenAccount({
        tokenAccounts,
        tokenAccountRawInfos
      })
    }
  }, [raydium, tokenAccounts, tokenAccountRawInfos])

  useEffect(() => {
    if (!publicKey) reset()
  }, [publicKey, reset])
}

export default useTokenAccountInfo
