import {
  TxBuildData,
  TxV0BuildData,
  MakeMultiTxData,
  ApiClmmConfigInfo,
  ClmmPositionLayout,
  InitRewardsParams,
  Price,
  TickUtils,
  PoolUtils,
  ReturnTypeGetPriceAndTick,
  ApiV3Token,
  SetRewardsParams,
  ClmmKeys,
  ApiV3PoolInfoConcentratedItem,
  MakeTxData,
  OpenPositionFromBaseExtInfo,
  toToken,
  solToWSolToken,
  TxVersion
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import createStore from '@/store/createStore'
import { useAppStore, useTokenAccountStore } from '@/store'
import { isSolWSol } from '@/utils/token'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject } from '@/hooks/toast/useTxStatus'
import { getDefaultToastData, transformProcessData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import getEphemeralSigners from '@/utils/tx/getEphemeralSigners'
import { getMintSymbol } from '@/utils/token'

import { CLMM_FEE_CONFIGS, getTxMeta } from './configs/clmm'
import { TxCallbackProps } from '../types/tx'
import { getComputeBudgetConfig } from '@/utils/tx/computeBudget'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'

import BN from 'bn.js'
import Decimal from 'decimal.js'

export type CreatePoolBuildData =
  | TxBuildData<{ mockPoolInfo: ApiV3PoolInfoConcentratedItem; address: ClmmKeys }>
  | TxV0BuildData<{ mockPoolInfo: ApiV3PoolInfoConcentratedItem; address: ClmmKeys }>

interface ClmmState {
  positionLoading: boolean

  clmmFeeConfigs: Record<string, ApiClmmConfigInfo>
  currentPoolInfo?: ApiV3PoolInfoConcentratedItem
  currentPoolLoading: boolean
  rewardWhiteListMints: PublicKey[]

  harvestAllAct: (
    props: {
      allPoolInfo: Record<string, ApiV3PoolInfoConcentratedItem>
      allPositions: Record<string, ClmmPositionLayout[]>
      programId?: string
      execute?: boolean
    } & TxCallbackProps
  ) => Promise<{ txId: string; buildData?: MakeMultiTxData<TxVersion> }>
  openPositionAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      poolKeys?: ClmmKeys
      tickLower: number
      tickUpper: number
      baseAmount: string
      otherAmountMax: string
      base: 'MintA' | 'MintB'
      createPoolBuildData?: CreatePoolBuildData
      onCloseToast?: () => void
    } & TxCallbackProps<{
      txId: string
      buildData: TxBuildData<OpenPositionFromBaseExtInfo> | TxV0BuildData<OpenPositionFromBaseExtInfo>
    }>
  ) => Promise<{
    txId: string
    buildData?: MakeTxData<TxVersion.LEGACY, OpenPositionFromBaseExtInfo> | MakeTxData<TxVersion.V0, OpenPositionFromBaseExtInfo>
  }>
  closePositionAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
    } & TxCallbackProps
  ) => Promise<string>
  removeLiquidityAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      liquidity: number | string | BN
      amountMinA: number | string | BN
      amountMinB: number | string | BN
      needRefresh?: boolean
      harvest?: boolean
    } & TxCallbackProps
  ) => Promise<string>
  increaseLiquidityAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      liquidity: BN
      amountMaxA: number | string | BN
      amountMaxB: number | string | BN
    } & TxCallbackProps
  ) => Promise<string>
  fetchAmmConfigsAct: () => void
  createClmmPool: (props: {
    config: ApiClmmConfigInfo
    token1: ApiV3Token
    token2: ApiV3Token
    price: string
    startTime?: number
    execute?: boolean
    forerunCreate?: boolean
  }) => Promise<{
    txId: string
    buildData?:
      | MakeTxData<
          TxVersion.LEGACY,
          {
            mockPoolInfo: ApiV3PoolInfoConcentratedItem
            address: ClmmKeys
          }
        >
      | MakeTxData<
          TxVersion.V0,
          {
            mockPoolInfo: ApiV3PoolInfoConcentratedItem
            address: ClmmKeys
          }
        >
  }>

  createFarm: (props: Pick<InitRewardsParams, 'poolInfo' | 'rewardInfos'> & TxCallbackProps) => Promise<string>

  convertPoolPrice: (props: { pool: ApiV3PoolInfoConcentratedItem; price: string | number }) => Price | undefined
  getPriceAndTick: (props: {
    pool?: ApiV3PoolInfoConcentratedItem
    price: string
    baseIn: boolean
    decimals?: number
  }) => ReturnTypeGetPriceAndTick | undefined
  getTickPrice: (props: { pool?: ApiV3PoolInfoConcentratedItem; tick: number; baseIn: boolean }) => ReturnTypeGetPriceAndTick | undefined
  computePairAmount: (props: {
    pool?: ApiV3PoolInfoConcentratedItem
    inputA: boolean
    tickLower?: number
    tickUpper?: number
    amount: string
  }) => Promise<
    | {
        amountSlippageA: Decimal
        amountSlippageB: Decimal
        amountA: Decimal
        amountB: Decimal
        liquidity: BN
      }
    | undefined
  >

  loadAddRewardWhiteListAct: (props?: { checkFetch: boolean }) => void
  setRewardsAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      rewardInfos: SetRewardsParams['rewardInfos']
      newRewardInfos: SetRewardsParams['rewardInfos']
    } & TxCallbackProps
  ) => Promise<string>
  reset: () => void
}

const clmmInitState = {
  positionLoading: false,
  currentPoolLoading: true,
  clmmFeeConfigs: {},
  rewardWhiteListMints: []
}

export const useClmmStore = createStore<ClmmState>(
  (set, get) => ({
    ...clmmInitState,
    harvestAllAct: async ({ allPoolInfo, allPositions, programId, execute, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) {
        toastSubject.next({ noRpc: true })
        return { txId: '' }
      }
      const buildData = await raydium.clmm.harvestAllRewards({
        allPoolInfo,
        allPositions,
        ownerInfo: {},
        programId: programId ? new PublicKey(programId) : undefined,
        txVersion
        // computeBudgetConfig: execute ? await getComputeBudgetConfig() : undefined
      })
      if (execute) {
        const meta = getTxMeta({
          action: 'harvest',
          values: { symbol: 'Clmm farms' }
        })

        const txLength = buildData.transactions.length
        const { toastId, processedId, handler } = getDefaultToastData({
          txLength,
          ...txProps
        })
        const getSubTxTitle = () => meta.txHistoryTitle

        buildData
          .execute({
            sequentially: true,
            onTxUpdate: (data) => {
              handleMultiTxRetry(data)
              handleMultiTxToast({
                toastId,
                processedId: transformProcessData({ processedId, data }),
                txLength,
                meta,
                handler,
                getSubTxTitle
              })
            }
          })
          .then(() => {
            handleMultiTxToast({
              toastId,
              processedId: transformProcessData({ processedId, data: [] }),
              txLength,
              meta,
              handler,
              getSubTxTitle
            })
            return { txId: '', buildData }
          })
          .catch((e) => {
            txProps.onError?.()
            toastSubject.next({ ...meta, txError: e })
            return { txId: '' }
          })
          .finally(txProps.onFinally)
      }
      return {
        txId: '',
        buildData
      }
    },

    openPositionAct: async ({
      poolInfo,
      poolKeys,
      base,
      tickLower,
      tickUpper,
      baseAmount,
      otherAmountMax,
      createPoolBuildData,
      onCloseToast,
      ...txProps
    }) => {
      const { raydium, wallet, txVersion } = useAppStore.getState()
      if (!raydium) {
        toastSubject.next({ noRpc: true })
        return { txId: '' }
      }
      if (!poolInfo) return { txId: '' }

      try {
        const computeBudgetConfig = await getComputeBudgetConfig()
        const buildData = await raydium.clmm.openPositionFromBase({
          poolInfo,
          poolKeys,
          tickLower: Math.min(tickLower, tickUpper),
          tickUpper: Math.max(tickLower, tickUpper),
          base,
          ownerInfo: {
            useSOLBalance: isSolWSol(poolInfo.mintA.address) || isSolWSol(poolInfo.mintB.address)
          },
          baseAmount: new BN(baseAmount),
          otherAmountMax: new BN(otherAmountMax),
          getEphemeralSigners: wallet ? await getEphemeralSigners(wallet) : undefined,
          computeBudgetConfig,
          txVersion
        })

        const [amountA, amountB] = base === 'MintA' ? [baseAmount, otherAmountMax] : [otherAmountMax, baseAmount]
        const meta = getTxMeta({
          action: 'openPosition',
          values: {
            amountA:
              new Decimal(amountA || 0)
                .div(10 ** poolInfo.mintA.decimals)
                .toDecimalPlaces(poolInfo.mintA.decimals)
                .toString() || 0,
            symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
            amountB:
              new Decimal(amountB || 0)
                .div(10 ** poolInfo.mintB.decimals)
                .toDecimalPlaces(poolInfo.mintB.decimals)
                .toString() || 0,
            symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
          }
        })

        const mintInfo = [poolInfo.mintA, poolInfo.mintB]

        if (!buildData) {
          txProps.onError?.()
          return { txId: '' }
        }

        // create pool and open position
        if (createPoolBuildData) {
          const createPoolMeta = getTxMeta({
            action: 'createPool',
            values: {}
          })
          const { execute, transactions } =
            txVersion === TxVersion.LEGACY
              ? await createPoolBuildData.builder.buildMultiTx({ extraPreBuildData: [buildData as TxBuildData<Record<string, any>>] })
              : await createPoolBuildData.builder.buildV0MultiTx({ extraPreBuildData: [buildData as TxV0BuildData<Record<string, any>>] })

          const txLength = transactions.length
          const { toastId, processedId, handler } = getDefaultToastData({
            txLength,
            ...txProps
          })

          const getSubTxTitle = (idx: number) => (idx !== transactions.length - 1 ? 'transaction_history.set_up' : 'create_market.create')

          return execute({
            sequentially: true,
            onTxUpdate: (data) => {
              handleMultiTxRetry(data)
              handleMultiTxToast({
                toastId,
                processedId: transformProcessData({ processedId, data }),
                txLength,
                meta,
                handler,
                getSubTxTitle
              })
            }
          })
            .then(() => {
              handleMultiTxToast({
                toastId,
                processedId: transformProcessData({ processedId, data: [] }),
                txLength,
                meta,
                handler,
                getSubTxTitle
              })
              return { txId: '', buildData }
            })
            .catch((e) => {
              toastSubject.next({ txError: e, ...createPoolMeta })
              txProps.onError?.()
              txProps.onFinally?.()
              return { txId: '' }
            })
            .finally(txLength > 1 ? undefined : txProps.onFinally)
        }

        return buildData
          .execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              ...meta,
              mintInfo,
              signedTx,
              onClose: onCloseToast,
              onError: txProps.onError,
              onConfirmed: txProps.onConfirmed
            })
            txProps.onSent?.({ txId, buildData })
            return { txId, buildData }
          })
          .catch((e) => {
            txProps.onError?.()
            toastSubject.next({ txError: e, ...meta })
            return { txId: '' }
          })
          .finally(txProps.onFinally)
      } catch (e: any) {
        txProps.onError?.()
        txProps.onFinally?.()
        console.error(e.message)
        return { txId: '' }
      }
    },

    removeLiquidityAct: async ({
      poolInfo,
      position,
      liquidity,
      amountMinA,
      amountMinB,
      needRefresh,
      harvest,
      onSent,
      onError,
      onFinally,
      onConfirmed
    }) => {
      const { raydium, txVersion, slippage } = useAppStore.getState()
      if (!raydium) return ''

      try {
        const computeBudgetConfig = await getComputeBudgetConfig()
        const { execute } = await raydium.clmm.decreaseLiquidity({
          poolInfo,
          ownerPosition: position,
          ownerInfo: {
            useSOLBalance: true,
            closePosition: position.liquidity.eq(new BN(liquidity))
          },
          liquidity: new BN(liquidity),
          amountMinA: new BN(
            new Decimal(amountMinA.toString())
              .mul(1 - slippage)
              .mul(10 ** poolInfo.mintA.decimals)
              .toFixed(0)
          ),
          amountMinB: new BN(
            new Decimal(amountMinB.toString())
              .mul(1 - slippage)
              .mul(10 ** poolInfo.mintB.decimals)
              .toFixed(0)
          ),
          computeBudgetConfig,
          txVersion
        })

        const meta = getTxMeta({
          action: harvest ? 'harvest' : 'removeLiquidity',
          values: {
            amountA: amountMinA || 0,
            symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
            amountB: amountMinB || 0,
            symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
          }
        })

        return execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              ...meta,
              mintInfo: [poolInfo.mintA, poolInfo.mintB],
              signedTx,
              onError,
              onSent,
              onConfirmed: () => {
                onConfirmed?.()
                if (needRefresh) setTimeout(() => useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() }), 500)
              }
            })
            return txId
          })
          .catch((e) => {
            onError?.()
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(() => onFinally?.())
      } catch {
        onError?.()
        onFinally?.()
        return ''
      }
    },

    closePositionAct: async ({ poolInfo, position, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) return ''
      try {
        const { execute } = await raydium.clmm.closePosition({
          poolInfo,
          ownerPosition: position,
          txVersion
        })

        const meta = getTxMeta({
          action: 'closePosition',
          values: {
            mint: position.nftMint.toBase58().slice(0, 6).toUpperCase()
          }
        })

        return execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              signedTx,
              ...meta,
              ...txProps
            })
            return txId
          })
          .catch((e) => {
            txProps.onError?.()
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      } catch {
        txProps.onError?.()
        txProps.onFinally?.()
        return ''
      }
    },

    increaseLiquidityAct: async ({ poolInfo, position, liquidity, amountMaxA, amountMaxB, ...txProps }) => {
      const { raydium, txVersion, slippage } = useAppStore.getState()
      if (!raydium) return ''
      try {
        const computeBudgetConfig = await getComputeBudgetConfig()
        const { execute } = await raydium.clmm.increasePositionFromLiquidity({
          poolInfo,
          ownerPosition: position,
          ownerInfo: {
            useSOLBalance: isSolWSol(poolInfo.mintA.address) || isSolWSol(poolInfo.mintB.address)
          },
          liquidity: new BN(new Decimal(liquidity.toString()).mul(1 - slippage).toFixed(0)),
          amountMaxA: new BN(amountMaxA),
          amountMaxB: new BN(amountMaxB),
          checkCreateATAOwner: true,
          computeBudgetConfig,
          txVersion
        })

        const meta = getTxMeta({
          action: 'increaseLiquidity',
          values: {
            amountA: new Decimal(amountMaxA.toString())
              .div(10 ** poolInfo.mintA.decimals)
              .toDecimalPlaces(poolInfo.mintA.decimals)
              .toString(),
            symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
            amountB: new Decimal(amountMaxB.toString())
              .div(10 ** poolInfo.mintB.decimals)
              .toDecimalPlaces(poolInfo.mintB.decimals)
              .toString(),
            symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
          }
        })

        return execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              ...meta,
              signedTx,
              mintInfo: [poolInfo.mintA, poolInfo.mintB],
              onSent: txProps.onSent,
              onConfirmed: () => {
                setTimeout(() => {
                  useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() })
                }, 500)
              }
            })
            return txId
          })
          .catch((e) => {
            txProps.onError?.()
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      } catch {
        txProps.onError?.()
        txProps.onFinally?.()
        return ''
      }
    },

    setRewardsAct: async ({ poolInfo, rewardInfos, newRewardInfos, onConfirmed, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium || rewardInfos.length + newRewardInfos.length < 1) return ''
      const allBuildData: (
        | TxV0BuildData<{
            address: Record<string, PublicKey>
          }>
        | TxBuildData<{
            address: Record<string, PublicKey>
          }>
      )[] = []

      const meta = getTxMeta({
        action: 'updateRewards',
        values: {
          pool: poolInfo.id.slice(0, 6)
        }
      })
      const computeBudgetConfig = await getComputeBudgetConfig()
      if (rewardInfos.length) {
        const setRewardsBuildData = await raydium.clmm.setRewards({
          poolInfo,
          ownerInfo: { useSOLBalance: true },
          rewardInfos,
          computeBudgetConfig,
          txVersion
        })

        if (!newRewardInfos.length)
          return setRewardsBuildData
            .execute()
            .then(({ txId, signedTx }) => {
              txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: newRewardInfos.map((r) => r.mint), onConfirmed })
              return txId
            })
            .catch((e) => {
              txProps.onError?.()
              toastSubject.next({ txError: e })
              return ''
            })
            .finally(txProps.onFinally)
        allBuildData.push(setRewardsBuildData)
      }
      if (newRewardInfos.length) {
        const initRewardBuildData = await raydium.clmm.initRewards({
          poolInfo,
          ownerInfo: { useSOLBalance: true },
          checkCreateATAOwner: true,
          rewardInfos: newRewardInfos,
          computeBudgetConfig,
          txVersion
        })

        if (!rewardInfos.length)
          return initRewardBuildData
            .execute()
            .then(({ txId }) => {
              txStatusSubject.next({ txId, ...meta, mintInfo: rewardInfos.map((r) => r.mint), onConfirmed })
              return txId
            })
            .catch((e) => {
              txProps.onError?.()
              toastSubject.next({ txError: e })
              return ''
            })
            .finally(txProps.onFinally)
        allBuildData.push(initRewardBuildData)
      }
      const builder0 = allBuildData[0].builder
      const res = await builder0.addInstruction(allBuildData[1].builder.AllTxData).build()
      if (!res) {
        txProps.onError?.()
        txProps.onFinally?.()
        return ''
      }
      const mints = new Map()
      rewardInfos.forEach((r) => mints.set(r.mint.address, r.mint))
      newRewardInfos.forEach((r) => mints.set(r.mint.address, r.mint))
      return res
        .execute()
        .then(({ txId }) => {
          txStatusSubject.next({ txId, ...txProps, ...meta, mintInfo: Array.from(mints.values()) })
          return txId
        })
        .catch((e) => {
          txProps.onError?.()
          toastSubject.next({ txError: e })
          return ''
        })
        .finally(txProps.onFinally)
    },

    createClmmPool: async ({ token1, token2, config, price, startTime, execute, forerunCreate }) => {
      const { raydium, publicKey, txVersion, chainTimeOffset, programIdConfig } = useAppStore.getState()
      if (!raydium || !publicKey) {
        toastSubject.next({ noRpc: true })
        return { txId: '' }
      }
      try {
        const computeBudgetConfig = forerunCreate ? undefined : await getComputeBudgetConfig()
        const buildData = await raydium.clmm.createPool({
          programId: programIdConfig.CLMM_PROGRAM_ID,
          mint1: { ...token1, address: token1.address },
          mint2: { ...token2, address: token2.address },
          ammConfig: { ...config, id: new PublicKey(config.id), fundOwner: '' },
          initialPrice: new Decimal(price),
          startTime: new BN(startTime || Math.floor((Date.now() + chainTimeOffset) / 1000)),
          computeBudgetConfig,
          forerunCreate,
          txVersion
        })
        const { execute: executeTx } = buildData
        if (execute) {
          const meta = getTxMeta({
            action: 'createPool',
            values: {}
          })

          return executeTx()
            .then(({ txId, signedTx }) => {
              txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: [token1, token2] })
              return { txId, buildData }
            })
            .catch((e) => {
              toastSubject.next({ txError: e })
              return { txId: '' }
            })
        }
        return { txId: '', buildData }
      } catch (e: any) {
        toastSubject.next({
          status: 'error',
          title: 'Error',
          description: e.message.includes('byte array longer than') ? 'Current price out of range' : e.message
        })
        return { txId: '' }
      }
    },

    createFarm: async ({ poolInfo, rewardInfos, onSent, onError, onFinally, onConfirmed }) => {
      const { raydium, publicKey, txVersion } = useAppStore.getState()
      if (!raydium || !publicKey) return ''
      const { execute } = await raydium.clmm.initRewards({
        poolInfo,
        rewardInfos: rewardInfos.map((r) => ({ ...r, mint: solToWSolToken(r.mint) })),
        ownerInfo: {
          useSOLBalance: true
        },
        checkCreateATAOwner: true,
        txVersion
      })

      const meta = getTxMeta({
        action: 'createFarm',
        values: { poolId: `${poolInfo.id.slice(0, 4)}...${poolInfo.id.slice(-4)}` }
      })
      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: rewardInfos.map((r) => r.mint), onConfirmed })
          onSent?.()
          return txId
        })
        .catch((e) => {
          toastSubject.next({ txError: e })
          onError?.()
          return ''
        })
        .finally(onFinally)
    },

    fetchAmmConfigsAct: async () => {
      const { raydium } = useAppStore.getState()
      if (Object.keys(get().clmmFeeConfigs).length || !raydium) return
      try {
        const res = await raydium.api.getClmmConfigs()
        const apiRes = res.reduce(
          (acc, cur) => ({
            ...acc,
            [cur.id]: cur
          }),
          {}
        )
        set({ clmmFeeConfigs: apiRes || CLMM_FEE_CONFIGS }, false, { type: 'fetchAmmConfigsAct' })
      } catch {
        set({ clmmFeeConfigs: CLMM_FEE_CONFIGS }, false, { type: 'fetchAmmConfigsAct' })
      }
    },

    // store related utils
    convertPoolPrice: ({ pool, price }) => {
      const p = new Decimal(price ?? '0').clamp(
        1 / 10 ** Math.max(pool.mintA?.decimals ?? 0, pool.mintB?.decimals ?? 0, new Decimal(price).decimalPlaces()),
        Number.MAX_SAFE_INTEGER
      )
      return new Price({
        baseToken: toToken(pool.mintA),
        denominator: new BN(10).pow(new BN(20 + pool.mintA!.decimals)),
        quoteToken: toToken(pool.mintB),
        numerator: p.mul(new Decimal(10 ** (20 + pool.mintB!.decimals))).toFixed(0)
      })
    },
    getPriceAndTick: ({ pool, price, baseIn }) => {
      if (!pool) return
      try {
        const p = new Decimal(price || '0').clamp(1 / 10 ** Math.max(pool.mintA.decimals, pool.mintB.decimals), Number.MAX_SAFE_INTEGER)
        return TickUtils.getPriceAndTick({
          poolInfo: pool,
          price: p,
          baseIn
        })
      } catch (e: any) {
        toastSubject.next({
          status: 'error',
          title: 'error',
          description: e.message.includes('not within the supported sqrtPrice range') ? 'Price for tick overflow' : e.message
        })
      }
    },
    getTickPrice: ({ pool, tick, baseIn }) => {
      if (!pool) return
      try {
        return TickUtils.getTickPrice({
          poolInfo: pool,
          tick,
          baseIn
        })
      } catch (e: any) {
        toastSubject.next({
          status: 'error',
          title: 'error',
          description: e.message
        })
      }
    },
    computePairAmount: async ({ pool, inputA, tickLower, tickUpper, amount }) => {
      const [connection, getEpochInfo, slippage] = [
        useAppStore.getState().connection,
        useAppStore.getState().getEpochInfo,
        useAppStore.getState().slippage
      ]
      const poolInfo = pool
      const epochInfo = await getEpochInfo()
      if (!poolInfo || !connection || tickLower === undefined || tickLower === undefined || !epochInfo) {
        return
      }
      const [decimalA, decimalB] = [poolInfo.mintA?.decimals ?? 6, poolInfo.mintB?.decimals ?? 6]
      const res = await PoolUtils.getLiquidityAmountOutFromAmountIn({
        poolInfo,
        slippage: 0,
        inputA,
        tickUpper: Math.max(tickLower, tickUpper!),
        tickLower: Math.min(tickLower, tickUpper!),
        amount: new BN(new Decimal(amount || '0').mul(10 ** (inputA ? decimalA : decimalB)).toFixed(0)),
        add: true,
        amountHasFee: true,
        epochInfo: epochInfo!
      })
      return {
        amountA: new Decimal(res.amountA.amount.toString()).div(10 ** decimalA),
        amountSlippageA: new Decimal(res.amountSlippageA.amount.toString()).mul(1 + slippage).div(10 ** decimalA),
        amountB: new Decimal(res.amountB.amount.toString()).div(10 ** decimalB),
        amountSlippageB: new Decimal(res.amountSlippageB.amount.toString()).mul(1 + slippage).div(10 ** decimalB),
        liquidity: res.liquidity,
        calResult: res
      }
    },
    loadAddRewardWhiteListAct: async (props) => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return ''
      const { checkFetch } = props || {}
      if (checkFetch && get().rewardWhiteListMints.length > 0) return
      raydium.clmm.getWhiteListMint({ programId: useAppStore.getState().programIdConfig.CLMM_PROGRAM_ID }).then((data) => {
        set({ rewardWhiteListMints: data }, false, { type: 'loadAddRewardWhiteListAct' })
      })
    },
    reset: () => set(clmmInitState)
  }),
  'useClmmStore'
)
