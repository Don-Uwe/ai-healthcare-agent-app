import { useCallback, useEffect, useRef, useMemo } from 'react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { validateAndParsePublicKey } from '@raydium-io/raydium-sdk-v2'
import { useAppStore, defaultEndpoint } from '@/store/useAppStore'
import usePrevious from '@/hooks/usePrevious'
import shallow from 'zustand/shallow'
import { isLocal } from '@/utils/common'
import { getDevOnlyStorage } from '@/utils/localStorage'
import { SSRData } from '../../type'
import { toastSubject } from '../toast/useGlobalToast'
import { cancelAllRetry } from '@/utils/common'

const localFakePubKey = '_r_f_wallet_'

function useInitConnection(props: SSRData) {
  const { connection } = useConnection()
  const { publicKey: _publicKey, signAllTransactions, wallet } = useWallet()

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
    signAllTransactions?: (<T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>) | undefined
  }>({})
  const prevRpcEndPoint = usePrevious(connection.rpcEndpoint)
  const preUrlConfigs = usePrevious(urlConfigs)

  const isRpcChanged = !!prevRpcEndPoint && prevRpcEndPoint !== connection.rpcEndpoint
  const isUrlConfigChanged = urlConfigs !== preUrlConfigs
  const isNeedReload = isRpcChanged || isUrlConfigChanged

  useWalletRef.current = { publicKey, signAllTransactions }

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
}

export default useInitConnection
