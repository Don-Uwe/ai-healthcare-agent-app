import { useCallback, useMemo } from 'react'
import { CREATE_CPMM_POOL_PROGRAM } from '@raydium-io/raydium-sdk-v2'
import useFetchAccLpMint from '@/hooks/token/useFetchAccLpMint'
import useFetchPoolByLpMint from '@/hooks/pool/useFetchPoolByLpMint'
import Decimal from 'decimal.js'
import { FormattedPoolInfoStandardItemCpmm } from '@/hooks/pool/type'

export type LockCpmmPoolInfo = FormattedPoolInfoStandardItemCpmm & {
  baseRatio: Decimal
  quoteRatio: Decimal
}

export default function useLockableCpmmLp() {
  const { noneZeroLpMintList, isLoading: isLpLoading, mutate: mutateLp } = useFetchAccLpMint({})
  const {
    formattedData,
    isLoading: isPoolLoading,
    mutate: mutatePool
  } = useFetchPoolByLpMint({
    lpMintList: noneZeroLpMintList.map((p) => p.address.toBase58()),
    keepPreviousData: true,
    refreshInterval: 30 * 1000
  })

  const poolData = useMemo(
    () =>
      formattedData
        ?.filter((p) => p.programId === CREATE_CPMM_POOL_PROGRAM.toBase58())
        .map(
          (p) =>
            ({
              ...p,
              baseRatio: new Decimal(p.mintAmountA).div(p.lpAmount || 1),
              quoteRatio: new Decimal(p.mintAmountB).div(p.lpAmount || 1)
            } as unknown as LockCpmmPoolInfo)
        ),
    [formattedData]
  )

  const mutate = useCallback(() => {
    mutateLp()
    mutatePool()
  }, [mutateLp, mutatePool])

  const cpmmLpData = poolData?.length
    ? noneZeroLpMintList.filter((lp) => poolData.some((p) => p.lpMint.address === lp.address.toBase58()))
    : []

  return {
    isLoading: isLpLoading || isPoolLoading,
    data: cpmmLpData,
    poolData: poolData || [],
    mutate
  }
}
