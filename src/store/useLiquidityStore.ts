import {
  ApiV3PoolInfoStandardItem,
  ApiV3PoolInfoStandardItemCpmm,
  ApiV3PoolInfoConcentratedItem,
  CreateCpmmPoolAddress,
  ApiV3Token,
  FormatFarmInfoOutV6,
  toToken,
  TokenAmount,
  Percent,
  getCpmmPdaAmmConfigId,
  CpmmConfigInfoLayout
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import createStore from './createStore'
import { useAppStore } from './useAppStore'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject } from '@/hooks/toast/useTxStatus'
import { getDefaultToastData, transformProcessData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import { TxCallbackProps } from '@/types/tx'
import { formatLocaleStr } from '@/utils/numberish/formatter'

import { getTxMeta } from './configs/liquidity'
import { getMintSymbol } from '@/utils/token'
import getEphemeralSigners from '@/utils/tx/getEphemeralSigners'
import { getPoolName } from '@/features/Pools/util'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { getComputeBudgetConfig } from '@/utils/tx/computeBudget'

export const LIQUIDITY_SLIPPAGE_KEY = '_r_lqd_slippage_'

interface LiquidityStore {
  newCreatedPool?: CreateCpmmPoolAddress
  createPoolFee: string
  slippage: number
  addLiquidityAct: (
    params: {
      poolInfo: ApiV3PoolInfoStandardItem
      amountA: string
      amountB: string
      fixedSide: 'a' | 'b'
    } & TxCallbackProps
  ) => Promise<string>
  addCpmmLiquidityAct: (
    params: {
      poolInfo: ApiV3PoolInfoStandardItemCpmm
      inputAmount: string
      anotherAmount: string
      liquidity: string
      baseIn: boolean
    } & TxCallbackProps
  ) => Promise<string>
  removeLiquidityAct: (
    params: {
      poolInfo: ApiV3PoolInfoStandardItem
      amount: string
      config?: {
        bypassAssociatedCheck?: boolean
      }
    } & TxCallbackProps
  ) => Promise<string>
  removeCpmmLiquidityAct: (
    params: {
      poolInfo: ApiV3PoolInfoStandardItemCpmm
      lpAmount: string
      amountA: string
      amountB: string
      config?: {
        bypassAssociatedCheck?: boolean
      }
    } & TxCallbackProps
  ) => Promise<string>
  createPoolAct: (
    params: {
      pool: {
        mintA: ApiV3Token
        mintB: ApiV3Token
      }
      baseAmount: string
      quoteAmount: string
      startTime?: Date
    } & TxCallbackProps
  ) => Promise<string>

  migrateToClmmAct: (
    params: {
      poolInfo: ApiV3PoolInfoStandardItem
      clmmPoolInfo: ApiV3PoolInfoConcentratedItem
      removeLpAmount: BN
      userAuxiliaryLedgers?: PublicKey[]
      createPositionInfo: {
        tickLower: number
        tickUpper: number
        baseAmount: BN
        otherAmountMax: BN
      }
      farmInfo?: FormatFarmInfoOutV6
      userFarmLpAmount?: BN
      base: 'MintA' | 'MintB'
    } & TxCallbackProps
  ) => Promise<string>

  computePairAmount: (params: {
    pool: ApiV3PoolInfoStandardItem | ApiV3PoolInfoStandardItemCpmm
    baseReserve: BN
    quoteReserve: BN
    amount: string
    baseIn: boolean
  }) => Promise<{
    output: string
    maxOutput: string
    liquidity: BN
  }>

  getCreatePoolFeeAct: () => Promise<void>

  resetComputeStateAct: () => void
}

const initLiquiditySate = {
  createPoolFee: '',
  slippage: 0.025
}

export const useLiquidityStore = createStore<LiquidityStore>(
  (set, get) => ({
    ...initLiquiditySate,

    addCpmmLiquidityAct: async ({ onSent, onError, onFinally, ...params }) => {
      const { raydium, txVersion, getEpochInfo } = useAppStore.getState()
      if (!raydium) return ''
      const baseIn = params.baseIn
      const computeBudgetConfig = await getComputeBudgetConfig()

      const percentSlippage = new Percent(get().slippage * 10000, 10000)
      const rpcData = await raydium.cpmm.getRpcPoolInfo(params.poolInfo.id)

      const computeResult = raydium.cpmm.computePairAmount({
        baseIn: params.baseIn,
        amount: params.inputAmount,
        slippage: new Percent(0),
        epochInfo: (await getEpochInfo())!,
        baseReserve: rpcData.baseReserve,
        quoteReserve: rpcData.quoteReserve,
        poolInfo: {
          ...params.poolInfo,
          lpAmount: new Decimal(rpcData.lpAmount.toString()).div(10 ** rpcData.lpDecimals).toNumber()
        } as ApiV3PoolInfoStandardItemCpmm
      })
      const { execute } = await raydium.cpmm.addLiquidity({
        ...params,
        inputAmount: new BN(new Decimal(params.inputAmount).mul(10 ** params.poolInfo[baseIn ? 'mintA' : 'mintB'].decimals).toFixed(0)),
        slippage: percentSlippage,
        computeResult: {
          ...computeResult,
          liquidity: new Percent(new BN(1)).sub(percentSlippage).mul(computeResult.liquidity).quotient
        },
        txVersion,
        computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'addLiquidity',
        values: {
          amountA: formatLocaleStr(
            baseIn ? params.inputAmount : params.anotherAmount,
            params.poolInfo[baseIn ? 'mintA' : 'mintB'].decimals
          )!,
          symbolA: getMintSymbol({ mint: params.poolInfo.mintA, transformSol: true }),
          amountB: formatLocaleStr(
            baseIn ? params.anotherAmount : params.inputAmount,
            params.poolInfo[baseIn ? 'mintB' : 'mintA'].decimals
          )!,
          symbolB: getMintSymbol({ mint: params.poolInfo.mintB, transformSol: true })
        }
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({
            txId,
            ...meta,
            signedTx,
            mintInfo: [params.poolInfo.mintA, params.poolInfo.mintB],
            onError,
            onConfirmed: params.onConfirmed
          })
          onSent?.()
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ ...meta, txError: e })
          return ''
        })
        .finally(onFinally)
    },

    addLiquidityAct: async ({ onSent, onError, onFinally, ...params }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) return ''
      const { execute } = await raydium.liquidity.addLiquidity({
        ...params,
        amountInA: new TokenAmount(
          toToken(params.poolInfo.mintA),
          new Decimal(params.amountA).mul(10 ** params.poolInfo.mintA.decimals).toFixed(0)
        ),
        amountInB: new TokenAmount(
          toToken(params.poolInfo.mintB),
          new Decimal(params.amountB).mul(10 ** params.poolInfo.mintB.decimals).toFixed(0)
        ),
        txVersion,
        computeBudgetConfig: await getComputeBudgetConfig()
      })

      const meta = getTxMeta({
        action: 'addLiquidity',
        values: {
          amountA: formatLocaleStr(params.amountA, params.poolInfo.mintA.decimals)!,
          symbolA: getMintSymbol({ mint: params.poolInfo.mintA, transformSol: true }),
          amountB: formatLocaleStr(params.amountB, params.poolInfo.mintB.decimals)!,
          symbolB: getMintSymbol({ mint: params.poolInfo.mintB, transformSol: true })
        }
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({
            txId,
            ...meta,
            signedTx,
            mintInfo: [params.poolInfo.mintA, params.poolInfo.mintB],
            onError,
            onConfirmed: params.onConfirmed
          })
          onSent?.()
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ ...meta, txError: e })
          return ''
        })
        .finally(onFinally)
    },

    removeLiquidityAct: async ({ onSent, onError, onFinally, ...params }) => {
      const { raydium, txVersion } = useAppStore.getState()

      if (!raydium) return ''
      const computeBudgetConfig = await getComputeBudgetConfig()
      const { poolInfo, amount, config } = params
      const { execute } = await raydium.liquidity.removeLiquidity({
        poolInfo,
        amountIn: new BN(amount),
        config,
        txVersion,
        computeBudgetConfig
      })

      const percent = new Decimal(amount).div(10 ** poolInfo.lpMint.decimals).div(poolInfo?.lpAmount || 1)

      const meta = getTxMeta({
        action: 'removeLiquidity',
        values: {
          amountA: formatLocaleStr(percent.mul(poolInfo?.mintAmountA || 0).toString(), params.poolInfo.mintA.decimals)!,
          symbolA: getMintSymbol({ mint: params.poolInfo.mintA, transformSol: true }),
          amountB: formatLocaleStr(percent.mul(poolInfo?.mintAmountB || 0).toString(), params.poolInfo.mintB.decimals)!,
          symbolB: getMintSymbol({ mint: params.poolInfo.mintB, transformSol: true })
        }
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: [params.poolInfo.mintA, params.poolInfo.mintB], onError })
          onSent?.()
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ ...meta, txError: e })
          return ''
        })
        .finally(onFinally)
    },

    removeCpmmLiquidityAct: async ({ onSent, onError, onFinally, ...params }) => {
      const { raydium, txVersion } = useAppStore.getState()

      if (!raydium) return ''
      const { poolInfo, lpAmount, amountA, amountB } = params
      const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute } = await raydium.cpmm.withdrawLiquidity({
        poolInfo,
        lpAmount: new BN(lpAmount),
        slippage: new Percent(get().slippage * 10000, 10000),
        txVersion,
        computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'removeLiquidity',
        values: {
          amountA: formatLocaleStr(amountA, params.poolInfo.mintA.decimals)!,
          symbolA: getMintSymbol({ mint: params.poolInfo.mintA, transformSol: true }),
          amountB: formatLocaleStr(amountB, params.poolInfo.mintB.decimals)!,
          symbolB: getMintSymbol({ mint: params.poolInfo.mintB, transformSol: true })
        }
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: [params.poolInfo.mintA, params.poolInfo.mintB], onError })
          onSent?.()
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ ...meta, txError: e })
          return ''
        })
        .finally(onFinally)
    },

    createPoolAct: async ({ pool, baseAmount, quoteAmount, startTime, onSent, onError, onFinally, onConfirmed }) => {
      const { raydium, programIdConfig, txVersion } = useAppStore.getState()
      if (!raydium) return ''
      const computeBudgetConfig = await getComputeBudgetConfig()

      const { execute, extInfo } = await raydium.cpmm.createPool({
        programId: programIdConfig.CREATE_CPMM_POOL_PROGRAM,
        poolFeeAccount: programIdConfig.CREATE_CPMM_POOL_FEE_ACC,
        mintA: pool.mintA,
        mintB: pool.mintB,
        mintAAmount: new BN(baseAmount),
        mintBAmount: new BN(quoteAmount),
        startTime: new BN((startTime ? Number(startTime) : Date.now() + 60 * 1000) / 1000),
        ownerInfo: {
          useSOLBalance: true
        },
        associatedOnly: false,
        txVersion,
        computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'createPool',
        values: {
          mintA: getMintSymbol({ mint: pool.mintA, transformSol: true }),
          mintB: getMintSymbol({ mint: pool.mintB, transformSol: true })
        }
      })

      const handleConfirmed = () => {
        onConfirmed?.()
        set({ newCreatedPool: extInfo.address })
      }

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({
            txId,
            ...meta,
            signedTx,
            mintInfo: [pool.mintA, pool.mintB],
            onSent,
            onError,
            onConfirmed: handleConfirmed
          })
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ txError: e })
          return ''
        })
        .finally(onFinally)
    },

    migrateToClmmAct: async ({ onSent, onError, onFinally, onConfirmed, ...params }) => {
      const { raydium, txVersion, wallet, connection, signAllTransactions } = useAppStore.getState()
      if (!raydium || !connection || !signAllTransactions) return ''

      const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute, transactions } = await raydium.liquidity.removeAllLpAndCreateClmmPosition({
        ...params,
        createPositionInfo: {
          ...params.createPositionInfo,
          tickLower: Math.min(params.createPositionInfo.tickLower, params.createPositionInfo.tickUpper),
          tickUpper: Math.max(params.createPositionInfo.tickLower, params.createPositionInfo.tickUpper)
        },
        computeBudgetConfig,
        getEphemeralSigners: wallet ? await getEphemeralSigners(wallet) : undefined,
        txVersion
      })

      const removeMeta = getTxMeta({
        action: 'removeLpBeforeMigrate'
      })

      const migrateMeta = getTxMeta({
        action: 'migrateToClmm',
        values: { mint: getPoolName(params.poolInfo) }
      })

      const txLength = transactions.length
      const { toastId, processedId, handler } = getDefaultToastData({
        txLength,
        onSent,
        onError,
        onFinally,
        onConfirmed
      })
      const getSubTxTitle = (idx: number) => (idx === transactions.length - 1 ? migrateMeta.title : removeMeta.title)

      return execute({
        sequentially: true,
        onTxUpdate: (data) => {
          handleMultiTxRetry(data)
          handleMultiTxToast({
            toastId,
            processedId: transformProcessData({ processedId, data }),
            txLength,
            meta: migrateMeta,
            handler,
            getSubTxTitle
          })
        }
      })
        .then(({ txIds }) => {
          handleMultiTxToast({
            toastId,
            processedId: transformProcessData({ processedId, data: [] }),
            txLength,
            meta: migrateMeta,
            handler,
            getSubTxTitle
          })
          return txIds[0]
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ txError: e, ...migrateMeta })
          return ''
        })
    },

    computePairAmount: async ({ pool, amount, baseIn, baseReserve, quoteReserve }) => {
      const { raydium, programIdConfig, getEpochInfo } = useAppStore.getState()
      if (!raydium)
        return {
          output: '0',
          maxOutput: '0',
          liquidity: new BN(0)
        }

      const isCpmm = pool.programId === programIdConfig.CREATE_CPMM_POOL_PROGRAM.toBase58()
      const params = {
        poolInfo: pool,
        amount,
        baseIn,
        slippage: new Percent(get().slippage * 10000, 10000)
      }

      const r = isCpmm
        ? raydium.cpmm.computePairAmount({
            ...params,
            slippage: new Percent(0),
            epochInfo: (await getEpochInfo())!,
            poolInfo: params.poolInfo as ApiV3PoolInfoStandardItemCpmm,
            baseReserve,
            quoteReserve
          })
        : raydium.liquidity.computePairAmount({
            ...params,
            poolInfo: {
              ...params.poolInfo,
              mintAmountA: new Decimal(baseReserve.toString()).div(10 ** pool.mintA.decimals).toNumber(),
              mintAmountB: new Decimal(quoteReserve.toString()).div(10 ** pool.mintB.decimals).toNumber()
            } as ApiV3PoolInfoStandardItem
          })

      const outputMint = baseIn ? pool.mintB : pool.mintA

      return {
        output:
          r.anotherAmount instanceof TokenAmount
            ? r.anotherAmount.toExact()
            : new Decimal(r.anotherAmount.amount.toString())
                .div(10 ** outputMint.decimals)
                .toDecimalPlaces(outputMint.decimals)
                .toString(),
        maxOutput:
          r.maxAnotherAmount instanceof TokenAmount
            ? r.maxAnotherAmount.toExact()
            : new Decimal(r.maxAnotherAmount.amount.toString())
                .div(10 ** outputMint.decimals)
                .toDecimalPlaces(outputMint.decimals)
                .toString(),
        liquidity: r.liquidity
      }
    },

    getCreatePoolFeeAct: async () => {
      const { connection, programIdConfig } = useAppStore.getState()
      if (!connection || get().createPoolFee) return
      const configId = getCpmmPdaAmmConfigId(programIdConfig.CREATE_CPMM_POOL_PROGRAM, 0)
      const r = await connection.getAccountInfo(configId.publicKey, useAppStore.getState().commitment)
      if (r) {
        set({ createPoolFee: new Decimal(CpmmConfigInfoLayout.decode(r.data).createPoolFee.toString()).div(10 ** 9).toString() })
      }
    },

    resetComputeStateAct: () => {
      set({}, false, { type: 'resetComputeStateAct' })
    }
  }),
  'useLiquidityStore'
)
