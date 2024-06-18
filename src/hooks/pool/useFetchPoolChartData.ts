import useFetchPoolChartLiquidity from './useFetchPoolChartLiquidity'
import useFetchPoolChartVolume, { TimeType } from './useFetchPoolChartVolume'

export default function useFetchPoolChartData({
  category,
  timeType,
  poolAddress,
  baseMint,
  refreshInterval
}: {
  category: 'liquidity' | 'volume'
  timeType: TimeType
  poolAddress?: string
  baseMint?: string
  refreshInterval?: number
}) {
  const {
    data: liquidityData,
    isEmptyResult: isEmptyLiquidityResult,
    isLoading: isLiquidityLoading
  } = useFetchPoolChartLiquidity({
    disable: category !== 'liquidity',
    id: poolAddress,
    refreshInterval
  })

  const {
    data: volumeData,
    isEmptyResult: isEmptyVolumeResult,
    isLoading: isVolumeLoading
  } = useFetchPoolChartVolume({
    disable: category !== 'volume',
    poolAddress,
    baseMint,
    timeType,
    refreshInterval
  })
  return {
    data:
      category === 'liquidity'
        ? liquidityData.map((i) => ({ time: Number(i.time) * 1000 /* ms */, v: Number(i.liquidity) }))
        : volumeData.map((i) => ({ time: Number(i.time) * 1000 /* ms */, v: i.value })),
    isEmptyResult: category === 'liquidity' ? isEmptyLiquidityResult : isEmptyVolumeResult,
    isLoading: category === 'liquidity' ? isLiquidityLoading : isVolumeLoading
  }
}
