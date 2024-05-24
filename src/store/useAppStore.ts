import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  EpochInfo,
  clusterApiUrl,
  Commitment
} from '@solana/web3.js'
import {
  Raydium,
  RaydiumLoadParams,
  API_URLS,
  API_URL_CONFIG,
  ProgramIdConfig,
  ALL_PROGRAM_ID,
  JupTokenType,
  TxBuilder,
  TxBuildData,
  TxV0BuildData,
  MultiTxBuildData,
  MultiTxV0BuildData,
  Owner,
  AvailabilityCheckAPI3,
  TxVersion,
  TokenInfo
} from '@raydium-io/raydium-sdk-v2'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { Wallet } from '@solana/wallet-adapter-react'
import createStore from './createStore'
import { useTokenStore } from './useTokenStore'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import axios from '@/api/axios'
import { isValidUrl } from '@/utils/url'
import { setStorageItem, getStorageItem } from '@/utils/localStorage'
import { retry, isProdEnv } from '@/utils/common'
import { compare } from 'compare-versions'

export const defaultNetWork = WalletAdapterNetwork.Mainnet // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
export const defaultEndpoint = clusterApiUrl(defaultNetWork) // You can also provide a custom RPC endpoint
export const APR_MODE_KEY = '_r_apr_'
export const EXPLORER_KEY = '_r_explorer_'
export const supportedExplorers = [
  {
    name: 'Solscan',
    icon: '/images/explorer-solscan.png',
    host: 'https://solscan.io'
  },
  {
    name: 'Explorer',
    icon: '/images/explorer-solana.png',
    host: 'https://explorer.solana.com'
  },
  {
    name: 'SolanaFM',
    icon: '/images/explorer-solanaFM.png',
    host: 'https://solana.fm'
  }
]

const RPC_URL_KEY = '_r_rpc_'
const RPC_URL_PROD_KEY = '_r_rpc_pro_'
export const FEE_KEY = '_r_fee_'
export const PRIORITY_LEVEL_KEY = '_r_fee_level_'
export const PRIORITY_MODE_KEY = '_r_fee_mode_'
export const SLIPPAGE_KEY = '_r_slippage_'
export const USER_ADDED_KEY = '_r_u_added_'
export enum PriorityLevel {
  Fast,
  Turbo,
  Ultra
}
export enum PriorityMode {
  MaxCap,
  Exact
}

interface RpcItem {
  url: string
  ws?: string
  weight: number
  batch: boolean
  name: string
}

interface AppState {
  raydium?: Raydium
  connection?: Connection
  signAllTransactions?: (<T extends Transaction | VersionedTransaction>(transaction: T[]) => Promise<T[]>) | undefined
  publicKey?: PublicKey
  explorerUrl: string
  isMobile: boolean
  isLaptop: boolean
  aprMode: 'M' | 'D'
  wallet?: Wallet
  initialing: boolean
  connected: boolean
  chainTimeOffset: number
  blockSlotCountForSecond: number
  commitment: Commitment

  rpcNodeUrl?: string
  wsNodeUrl?: string
  rpcs: RpcItem[]
  urlConfigs: typeof API_URLS & {
    SWAP_HOST: string
    SWAP_COMPUTE: string
    SWAP_TX: string
  }
  programIdConfig: typeof ALL_PROGRAM_ID

  jupTokenType: JupTokenType
  displayTokenSettings: { official: boolean; jup: boolean; userAdded: boolean }

  featureDisabled: Partial<AvailabilityCheckAPI3>

  slippage: number
  epochInfo?: EpochInfo
  txVersion: TxVersion
  tokenAccLoaded: boolean

  appVersion: string
  needRefresh: boolean

  priorityLevel: PriorityLevel
  priorityMode: PriorityMode
  transactionFee?: string
  feeConfig: Partial<Record<PriorityLevel, number>>

  getPriorityFee: () => string | undefined
  getEpochInfo: () => Promise<EpochInfo | undefined>
  initRaydiumAct: (payload: RaydiumLoadParams) => Promise<void>
  fetchChainTimeAct: () => void
  fetchRpcsAct: () => Promise<void>
  fetchBlockSlotCountAct: () => Promise<void>
  setUrlConfigAct: (urls: API_URL_CONFIG) => void
  setProgramIdConfigAct: (urls: ProgramIdConfig) => void
  setRpcUrlAct: (url: string, skipToast?: boolean, skipError?: boolean) => Promise<boolean>
  setAprModeAct: (mode: 'M' | 'D') => void
  checkAppVersionAct: () => Promise<void>
  fetchPriorityFeeAct: () => Promise<void>

  buildMultipleTx: (props: {
    txBuildDataList: (TxBuildData | TxV0BuildData)[]
  }) => Promise<MultiTxBuildData | MultiTxV0BuildData | undefined>
}

const appInitState = {
  raydium: undefined,
  initialing: false,
  connected: false,
  chainTimeOffset: 0,
  blockSlotCountForSecond: 0,
  explorerUrl: supportedExplorers[0].host,
  isMobile: false,
  isLaptop: false,
  aprMode: 'M' as 'M' | 'D',
  rpcs: [],
  urlConfigs: API_URLS,
  programIdConfig: ALL_PROGRAM_ID,
  jupTokenType: JupTokenType.Strict,
  displayTokenSettings: {
    official: true,
    jup: true,
    userAdded: true
  },
  featureDisabled: {},
  slippage: 0.005,
  txVersion: TxVersion.V0,
  appVersion: 'V3.0.2',
  needRefresh: false,
  tokenAccLoaded: false,
  commitment: 'confirmed' as Commitment,

  priorityLevel: PriorityLevel.Turbo,
  priorityMode: PriorityMode.MaxCap,
  feeConfig: {},
  transactionFee: '0.0003'
}

let rpcLoading = false
let epochInfoCache = {
  time: 0,
  loading: false
}

export const useAppStore = createStore<AppState>(
  (set, get) => ({
    ...appInitState,
    initRaydiumAct: async (payload) => {
      const action = { type: 'initRaydiumAct' }
      const { initialing, urlConfigs, rpcNodeUrl, jupTokenType, displayTokenSettings } = get()
      if (initialing || !rpcNodeUrl) return
      const connection = payload.connection || new Connection(rpcNodeUrl)
      set({ initialing: true }, false, action)
      const isDev = window.location.host === 'localhost:3002'

      const raydium = await Raydium.load({
        ...payload,
        connection,
        urlConfigs: {
          ...urlConfigs,
          BASE_HOST: !isProdEnv() ? getStorageItem('_r_api_host_') || urlConfigs.BASE_HOST : urlConfigs.BASE_HOST
        },
        jupTokenType,
        logRequests: !isDev,
        disableFeatureCheck: true
      })
      useTokenStore.getState().extraLoadedTokenList.forEach((t) => {
        const existed = raydium.token.tokenMap.has(t.address)
        if (!existed) {
          raydium.token.tokenList.push(t)
          raydium.token.tokenMap.set(t.address, t)
          raydium.token.mintGroup.official.add(t.address)
        }
      })
      const tokenMap = new Map(Array.from(raydium.token.tokenMap))
      const tokenList = (JSON.parse(JSON.stringify(raydium.token.tokenList)) as TokenInfo[]).map((t) => {
        if (t.type === 'jupiter') {
          const newInfo = { ...t, logoURI: t.logoURI ? `https://wsrv.nl/?w=48&h=48&url=${t.logoURI}` : t.logoURI }
          tokenMap.set(t.address, newInfo)
          return newInfo
        }
        return t
      })
      useTokenStore.setState(
        {
          tokenList,
          displayTokenList: tokenList.filter((token) => {
            return (
              (displayTokenSettings.official && raydium.token.mintGroup.official.has(token.address)) ||
              (displayTokenSettings.jup && raydium.token.mintGroup.jup.has(token.address))
            )
          }),
          tokenMap,
          mintGroup: raydium.token.mintGroup,
          whiteListMap: new Set(Array.from(raydium.token.whiteListMap))
        },
        false,
        action
      )
      set({ raydium, initialing: false, connected: !!(payload.owner || get().publicKey) }, false, action)
      set(
        {
          featureDisabled: {
            swap: raydium.availability.swap === false,
            createConcentratedPosition: raydium.availability.createConcentratedPosition === false,
            addConcentratedPosition: raydium.availability.addConcentratedPosition === false,
            addStandardPosition: raydium.availability.addStandardPosition === false,
            removeConcentratedPosition: raydium.availability.removeConcentratedPosition === false,
            removeStandardPosition: raydium.availability.removeStandardPosition === false,
            addFarm: raydium.availability.addFarm === false,
            removeFarm: raydium.availability.removeFarm === false
          }
        },
        false,
        action
      )

      setTimeout(() => {
        get().fetchChainTimeAct()
      }, 1000)
    },
    fetchChainTimeAct: () => {
      const { urlConfigs } = get()
      axios
        .get<{ offset: number }>(`${urlConfigs.BASE_HOST}${urlConfigs.CHAIN_TIME}`)
        .then((data) => {
          set({ chainTimeOffset: isNaN(data?.data.offset) ? 0 : data.data.offset * 1000 }, false, { type: 'fetchChainTimeAct' })
        })
        .catch(() => {
          set({ chainTimeOffset: 0 }, false, { type: 'fetchChainTimeAct' })
        })
    },
    fetchBlockSlotCountAct: async () => {
      const { raydium, connection } = get()
      if (!raydium || !connection) return
      const blockSlotCountForSecond = await raydium.api.getBlockSlotCountForSecond(connection.rpcEndpoint)
      set({ blockSlotCountForSecond }, false, { type: 'fetchBlockSlotCountAct' })
    },
    setUrlConfigAct: (urls) => {
      set({ urlConfigs: { ...get().urlConfigs, ...urls } }, false, { type: 'setUrlConfigAct' })
    },
    setProgramIdConfigAct: (urls) => {
      set({ programIdConfig: { ...get().programIdConfig, ...urls } }, false, { type: 'setProgramIdConfigAct' })
    },
    fetchRpcsAct: async () => {
      const { urlConfigs, setRpcUrlAct } = get()
      if (rpcLoading) return
      rpcLoading = true
      try {
        const {
          data: { rpcs }
        } = await axios.get<{ rpcs: RpcItem[] }>(urlConfigs.BASE_HOST + urlConfigs.RPCS)
        set({ rpcs }, false, { type: 'fetchRpcsAct' })

        let i = 0
        const checkAndSetRpcNode = async () => {
          const success = await setRpcUrlAct(rpcs[i].url, true, i !== rpcs.length - 1)
          if (!success) {
            i++
            checkAndSetRpcNode()
          }
        }

        const localRpc = getStorageItem(isProdEnv() ? RPC_URL_PROD_KEY : RPC_URL_KEY)
        if (localRpc && isValidUrl(localRpc)) {
          const success = await setRpcUrlAct(localRpc, true, true)
          if (!success) checkAndSetRpcNode()
        } else {
          checkAndSetRpcNode()
        }
      } finally {
        rpcLoading = false
      }
    },
    setRpcUrlAct: async (url, skipToast, skipError) => {
      if (url === get().rpcNodeUrl) {
        toastSubject.next({
          status: 'info',
          title: 'Switch Rpc Node',
          description: 'Rpc node already in use'
        })
        return true
      }
      try {
        if (!isValidUrl(url)) throw new Error('invalid url')
        await retry<Promise<EpochInfo>>(() => axios.post(url, { method: 'getEpochInfo' }, { skipError: true }), { retryCount: 6 })
        const rpcNode = get().rpcs.find((r) => r.url === url)
        set({ rpcNodeUrl: url, wsNodeUrl: rpcNode?.ws, tokenAccLoaded: false }, false, { type: 'setRpcUrlAct' })
        setStorageItem(RPC_URL_KEY, url)
        if (!skipToast)
          toastSubject.next({
            status: 'success',
            title: 'Switch Rpc Node Success',
            description: 'Rpc node switched'
          })
        return true
      } catch {
        if (!skipError)
          toastSubject.next({
            status: 'error',
            title: 'Switch Rpc Node error',
            description: 'Invalid rpc node'
          })
        return false
      }
    },
    setAprModeAct: (mode) => {
      setStorageItem(APR_MODE_KEY, mode)
      set({ aprMode: mode })
    },
    checkAppVersionAct: async () => {
      const { urlConfigs, appVersion } = get()
      const res = await axios.get<{
        latest: string
        least: string
      }>(`${urlConfigs.BASE_HOST}${urlConfigs.VERSION}`)
      set({ needRefresh: compare(appVersion, res.data.latest, '<') })
    },

    fetchPriorityFeeAct: async () => {
      const { urlConfigs } = get()
      const { data } = await axios.get<{
        default: {
          h: number
          m: number
          vh: number
        }
      }>(`${urlConfigs.BASE_HOST}${urlConfigs.PRIORITY_FEE}`)
      set({
        feeConfig: {
          [PriorityLevel.Fast]: data.default.m / 10 ** 9,
          [PriorityLevel.Turbo]: data.default.h / 10 ** 9,
          [PriorityLevel.Ultra]: data.default.vh / 10 ** 9
        }
      })
    },

    getPriorityFee: () => {
      const { priorityMode, priorityLevel, transactionFee, feeConfig } = get()
      if (priorityMode === PriorityMode.Exact) return transactionFee ? String(transactionFee) : transactionFee
      if (feeConfig[priorityLevel] === undefined || transactionFee === undefined) return String(feeConfig[PriorityLevel.Turbo] ?? 0)
      return String(Math.min(Number(transactionFee), feeConfig[priorityLevel]!))
    },

    buildMultipleTx: async ({ txBuildDataList }) => {
      if (!txBuildDataList.length) return

      const { connection, publicKey: owner, signAllTransactions } = get()
      if (!connection) {
        toastSubject.next({
          title: 'No connection',
          description: 'please check rpc connection',
          status: 'error'
        })
        return
      }
      if (!owner) {
        toastSubject.next({
          title: 'No Wallet',
          description: 'please connect wallet',
          status: 'error'
        })
        return
      }

      const currentBuildData = [...txBuildDataList]
      const txBuilder = new TxBuilder({
        connection,
        feePayer: owner,
        cluster: 'mainnet',
        owner: new Owner(owner),
        signAllTransactions
      })

      const firstBuildData = currentBuildData.shift()!
      if (firstBuildData.transaction instanceof VersionedTransaction) {
        txBuilder.addInstruction({
          instructions: TransactionMessage.decompile(firstBuildData.transaction.message).instructions,
          ...firstBuildData
        })
        return txBuilder.buildV0MultiTx({
          buildProps: (firstBuildData as TxV0BuildData).buildProps,
          extraPreBuildData: currentBuildData as TxV0BuildData[]
        })
      }
      txBuilder.addInstruction({
        instructions: firstBuildData.transaction.instructions,
        ...firstBuildData
      })
      return txBuilder.buildMultiTx({ extraPreBuildData: currentBuildData as TxBuildData[] })
    },
    getEpochInfo: async () => {
      const [connection, epochInfo] = [get().connection, get().epochInfo]
      if (!connection) return undefined
      if (epochInfo && Date.now() - epochInfoCache.time <= 30 * 1000) return epochInfo
      if (epochInfoCache.loading) return epochInfo
      epochInfoCache.loading = true
      const newEpochInfo = await retry<Promise<EpochInfo>>(() => connection.getEpochInfo())
      epochInfoCache = { time: Date.now(), loading: false }
      set({ epochInfo: newEpochInfo }, false, { type: 'useAppStore.getEpochInfo' })
      return newEpochInfo
    },
    reset: () => set(appInitState)
  }),
  'useAppStore'
)
