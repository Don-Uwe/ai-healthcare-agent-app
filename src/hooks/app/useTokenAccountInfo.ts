import { useEffect } from 'react'
import shallow from 'zustand/shallow'
import { useAppStore } from '@/store'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'

const accountChangeCbk: (() => void)[] = []
export const addAccChangeCbk = (fn: () => void) => accountChangeCbk.push(fn)
export const removeAccChangeCbk = (fn: () => void) => {
  const idx = accountChangeCbk.findIndex((currentFn) => currentFn === fn)
  accountChangeCbk.splice(idx, 1)
}

function useTokenAccountInfo() {
  const [raydium, connection, publicKey, commitment] = useAppStore((s) => [s.raydium, s.connection, s.publicKey, s.commitment], shallow)

  const { fetchTokenAccountAct, tokenAccounts, tokenAccountRawInfos, reset } = useTokenAccountStore()

  useEffect(() => {
    if (!connection || !publicKey) return
    fetchTokenAccountAct({ connection, owner: publicKey })

    const listenerId = connection.onAccountChange(
      publicKey,
      () => {
        fetchTokenAccountAct({ connection, owner: publicKey, commitment })
        accountChangeCbk.forEach((cb) => cb())
      },
      commitment
    )

    // const listenerId2 = connection.onAccountChange(
    //   publicKey,
    //   () => {
    //     fetchTokenAccountAct({ connection, owner: publicKey, commitment })
    //   },
    //   'finalized'
    // )

    return () => {
      connection.removeAccountChangeListener(listenerId)
      // connection.removeAccountChangeListener(listenerId2)
    }
    // eslint-disable-next-line
  }, [connection?.rpcEndpoint, publicKey])

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
