import { useCallback, useEffect, useRef, useMemo } from 'react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxVersion, validateAndParsePublicKey, txToBase64 } from '@raydium-io/raydium-sdk-v2'
import { useAppStore, defaultEndpoint } from '@/store/useAppStore'
import usePrevious from '@/hooks/usePrevious'
import shallow from 'zustand/shallow'
import { isLocal } from '@/utils/common'
import { getDevOnlyStorage } from '@/utils/localStorage'
import { SSRData } from '../../type'
import { toastSubject } from '../toast/useGlobalToast'
import { cancelAllRetry } from '@/utils/common'
import { sendWalletEvent } from '@/api/event'
import { validateTxData, extendTxData } from '@/api/txService'

const toBuffer = (arr: Buffer | Uint8Array | Array<number>): Buffer => {
  if (Buffer.isBuffer(arr)) {
    return arr
  } else if (arr instanceof Uint8Array) {
    return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
  } else {
    return Buffer.from(arr)
  }
}

const localFakePubKey = '_r_f_wallet_'

function useInitConnection(props: SSRData) {
  const { connection } = useConnection()
  const { publicKey: _publicKey, signAllTransactions: _signAllTransactions, wallet, connected } = useWallet()

  const publicKey = useMemo(() => {
    const localPub = getDevOnlyStorage(localFakePubKey)
    if (isLocal() && localPub) {
      try {
        return validateAndParsePublicKey({ publicKey: localPub })
      } catch {
        return _publicKey
      }
    }

    return _publicKey
  }, [_publicKey])

  const signAllTransactions = useMemo(
    () =>
      _signAllTransactions
        ? async <T extends Transaction | VersionedTransaction>(propsTransactions: T[]) => {
            const isV0Tx = useAppStore.getState().txVersion === TxVersion.V0
            let transactions = [...propsTransactions]
            let unsignedTxData = transactions.map(txToBase64)
            if (useAppStore.getState().wallet?.adapter.name?.toLowerCase() === 'walletconnect') {
              const { success, data: extendedTxData } = await extendTxData(unsignedTxData)
              if (success) {
                const allTxBuf = extendedTxData.map((tx) => Buffer.from(tx, 'base64'))
                transactions = allTxBuf.map((txBuf) => (isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf))) as T[]
                unsignedTxData = transactions.map(txToBase64)
              }
            }

            const time = Date.now()
            const allSignedTx = await _signAllTransactions(transactions)
            const allBase64Tx = allSignedTx.map(txToBase64)
            const res = await validateTxData({
              preData: unsignedTxData,
              data: allBase64Tx,
              userSignTime: Date.now() - time
            })
            if (!res.success) throw new Error(res.msg)

            return allSignedTx
          }
        : undefined,
    [_signAllTransactions]
  )

  const { urlConfigs, fetchRpcsAct, initRaydiumAct, raydium } = useAppStore(
    (s) => ({
      urlConfigs: s.urlConfigs,
      fetchRpcsAct: s.fetchRpcsAct,
      initRaydiumAct: s.initRaydiumAct,
      raydium: s.raydium
    }),
    shallow
  )
  const walletRef = useRef(wallet)
  const useWalletRef = useRef<{
    publicKey?: PublicKey | null
  }>({})
  const prevRpcEndPoint = usePrevious(connection.rpcEndpoint)
  const preUrlConfigs = usePrevious(urlConfigs)

  const isRpcChanged = !!prevRpcEndPoint && prevRpcEndPoint !== connection.rpcEndpoint
  const isUrlConfigChanged = urlConfigs !== preUrlConfigs
  const isNeedReload = isRpcChanged || isUrlConfigChanged

  useWalletRef.current = { publicKey }

  const showConnect = useCallback(
    (key: PublicKey) => {
      toastSubject.next({
        title: `${wallet?.adapter.name} wallet connected`,
        description: `Wallet ${key}`,
        status: 'success'
      })
    },
    [wallet]
  )

  const showDisconnect = useCallback(() => {
    toastSubject.next({
      title: `${wallet?.adapter.name} wallet disconnected`,
      status: 'warning'
    })
  }, [wallet])

  // fetch rpc nodes
  useEffect(() => {
    if (!useAppStore.getState().rpcs?.length) {
      fetchRpcsAct()
    }
  }, [fetchRpcsAct, urlConfigs.BASE_HOST])

  // register wallet connect/disconnect toast
  useEffect(() => {
    wallet?.adapter.once('connect', showConnect)
    wallet?.adapter.once('disconnect', showDisconnect)
    walletRef.current = wallet || walletRef.current

    return () => {
      wallet?.adapter.off('connect', showConnect)
      wallet?.adapter.off('disconnect', showDisconnect)
    }
  }, [wallet, showConnect, showDisconnect])

  // init raydium sdk or update connection action
  useEffect(() => {
    if (!connection || connection.rpcEndpoint === defaultEndpoint) return

    useAppStore.setState({ connection, signAllTransactions }, false, { type: 'useInitConnection' } as any)
    // raydium sdk initialization can be done with connection only, if url or rpc changed, re-init
    if (raydium && !isNeedReload) {
      raydium.setConnection(connection)
      return
    }

    const ssrReloadData = isNeedReload ? {} : props

    initRaydiumAct({ connection, ...ssrReloadData })
    // eslint-disable-next-line
  }, [initRaydiumAct, connection?.rpcEndpoint, raydium, signAllTransactions, isNeedReload])

  // update publickey/signAllTransactions in raydium sdk
  useEffect(() => {
    // if user connected wallet, update pubk
    if (raydium) {
      raydium.setOwner(publicKey || undefined)
      raydium.setSignAllTransactions(signAllTransactions)
    }
  }, [raydium, publicKey, signAllTransactions])

  // update publickey/wallet in app store
  useEffect(() => {
    const payload = {
      connected: !!useWalletRef.current.publicKey,
      publicKey: useWalletRef.current.publicKey || undefined,
      wallet: walletRef.current || undefined
    }
    useAppStore.setState(payload, false, { type: 'useInitConnection', payload } as any)
  }, [publicKey?.toBase58(), wallet?.adapter.name])

  useEffect(() => cancelAllRetry, [connection.rpcEndpoint])
  useEffect(() => {
    if (!wallet) return
    if (wallet.adapter.name === 'SafePal') useAppStore.setState({ txVersion: TxVersion.LEGACY })
    return () => useAppStore.setState({ txVersion: TxVersion.V0 })
  }, [wallet?.adapter.name])

  useEffect(() => {
    if (connected && publicKey) {
      sendWalletEvent({
        type: 'connectWallet',
        connectStatus: 'success',
        walletName: wallet?.adapter.name || 'unknown'
      })
    }
  }, [publicKey, connected, wallet?.adapter.name])
}

export default useInitConnection
