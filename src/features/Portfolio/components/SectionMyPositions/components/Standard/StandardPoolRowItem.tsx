import { useCallback, useMemo, useState } from 'react'
import { Box, Button, Collapse, GridItem, HStack, VStack, useDisclosure, Skeleton } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import MigrateFromStandardDialog from '@/features/Clmm/MigrateClmmFromStandardDialog/Dialog'
import { FormattedFarmInfoV6 } from '@/hooks/farm/type'
import { FarmPositionInfo } from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchRpcPoolData from '@/hooks/pool/amm/useFetchRpcPoolData'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import ExpandUpIcon from '@/icons/misc/ExpandUpIcon'
import { useAppStore, useFarmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'

import ActionButtons from './ItemDetail/ActionButtons'
import ItemName from './ItemDetail/ItemName'
import PendingRewards from './ItemDetail/PendingRewards'
import StandardMyPosition from './ItemDetail/StandardMyPosition'
import StandardPoolAPR from './ItemDetail/StandardPoolAPR'
import TokenPooledInfo from './ItemDetail/TokenInfo'
import MobileStandardAMMDetailDrawer from './components/MobileStandardAMMDetailDrawer'
import StandardPoolRowStakeFarmHoldItem from './components/StandardPoolRowStakeFarmHoldItem'
import StandardPoolRowStakeFarmItem from './components/StandardPoolRowStakeFarmItem'
import { useEvent } from '@/hooks/useEvent'
import { panelCard } from '@/theme/cssBlocks'
import { FarmBalanceInfo } from '@/hooks/farm/type'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import BN from 'bn.js'
import useMigratePoolConfig from '@/hooks/pool/useMigratePoolConfig'

type PoolItemProps = {
  pool?: FormattedPoolInfoStandardItem
  isLoading: boolean
  position: FarmPositionInfo
  stakedFarmMap: Map<string, FormattedFarmInfoV6>
  allFarmBalances: FarmBalanceInfo[]
}

export default function StandardPoolRowItem({ pool, isLoading, position, stakedFarmMap, allFarmBalances }: PoolItemProps) {
  const { t } = useTranslation()
  const harvestAllFarmAct = useFarmStore((s) => s.harvestAllAct)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isHarvesting, onOpen: onHarvesting, onClose: offHarvesting } = useDisclosure()
  const { isOpen: isMigrateOpen, onOpen: onMigrateOpen, onClose: onMigrateClose } = useDisclosure()
  const { isOpen: isRpcFetching, onOpen: onRpcFetching } = useDisclosure()
  const [refreshTag, setRefreshTag] = useState(0)
  const isMobile = useAppStore((s) => s.isMobile)
  const [allPendingRewards, setAllPendingRewards] = useState<
    Map<string, { mint: ApiV3Token[]; usd: string; amount: string[]; rewardTokenUsd: string[] }>
  >(new Map())
  const updateReward = new Map()
  const { data: migratePoolList } = useMigratePoolConfig({})
  const migrateData = migratePoolList.find((p) => p.lpMint === pool?.lpMint.address)
  const isPc = !isMobile

  const hasStakeFarm = position.hasAmount
  const stakedFarms = position.data.filter((d) => new Decimal(d.lpAmount || 0).gt(0))
  const stakeFarmCount = stakedFarms.length
  const stakedFarmList = stakedFarms.map((farm) => stakedFarmMap.get(farm.farmId)).filter((f) => !!f) as FormattedFarmInfoV6[]

  const [farmInfo, farmLpAmount] = useMemo(() => {
    let farm: FormattedFarmInfoV6 | undefined = undefined
    let farmLpAmount = '0'
    farm = stakedFarmList.find((f) =>
      position.data.some((d) => {
        const isFound = new Decimal(d.lpAmount || 0).gt(0) && f.id === d.farmId
        if (isFound) farmLpAmount = d.lpAmount || '0'
        return isFound
      })
    )
    return [farm, farmLpAmount]
  }, [position.data, stakedFarms])

  const { data: rpcPoolData, mutate } = useFetchRpcPoolData({
    shouldFetch: isRpcFetching,
    poolId: pool?.id,
    refreshInterval: isMigrateOpen ? 1000 * 15 : undefined,
    refreshTag
  })

  const unStakeLpBalance = getTokenBalanceUiAmount({ mint: pool?.lpMint.address || '', decimals: pool?.lpMint.decimals }).rawAmount
  const allLpUiAmount = new Decimal(position.totalLpAmount || 0).add(unStakeLpBalance).div(10 ** (pool?.lpMint.decimals ?? 0))

  const canMigrate = !!migrateData && allLpUiAmount.gt(0)

  const baseRatio = new Decimal(
    rpcPoolData?.baseReserve.div(new BN(10).pow(new BN(rpcPoolData.baseDecimals))).toString() || pool?.mintAmountA || 0
  ).div(rpcPoolData?.lpSupply.div(new BN(10).pow(new BN(rpcPoolData.lpDecimals))).toString() || pool?.lpAmount || 1)
  const quoteRatio = new Decimal(
    rpcPoolData?.quoteReserve.div(new BN(10).pow(new BN(rpcPoolData.quoteDecimals))).toString() || pool?.mintAmountB || 0
  ).div(rpcPoolData?.lpSupply.div(new BN(10).pow(new BN(rpcPoolData.lpDecimals))).toString() || pool?.lpAmount || 1)

  const handleHarvest = useEvent(() => {
    onHarvesting()
    harvestAllFarmAct({
      farmInfoList: stakedFarmList,
      onFinally: offHarvesting
    })
  })

  let positionStatus = ''
  if (!stakedFarms.length && pool && pool?.farmOngoingCount > 0) {
    positionStatus = 'unstaked'
  } else if (pool?.isRewardEnded && !stakedFarmList.some((f) => f.isOngoing)) {
    positionStatus = 'ended'
  }

  const debounceSetRewards = useCallback(
    debounce((rewards: Map<string, { mint: ApiV3Token[]; usd: string; amount: string[]; rewardTokenUsd: string[] }>) => {
      setAllPendingRewards((prev) => {
        const newVal = new Map(Array.from(prev))
        Array.from(rewards.entries()).forEach(([key, value]) => {
          newVal.set(key, value)
        })
        return newVal
      })
    }),
    []
  )

  const handleUpdatePendingRewards = useCallback(
    ({ farmId, reward }: { farmId: string; reward: { mint: ApiV3Token[]; usd: string; amount: string[]; rewardTokenUsd: string[] } }) => {
      updateReward.set(farmId, reward)
      debounceSetRewards(updateReward)
    },
    [debounceSetRewards]
  )

  const currentRewardInfo = useMemo(() => {
    const rewardData: Map<string, { mint: ApiV3Token; amount: string }> = new Map()
    Array.from(allPendingRewards.entries()).map(([farmId, data]) => {
      const f = stakedFarmList.find((f) => f.id === farmId)
      if (!f) return
      return data.amount.map((d, idx) => {
        if (!f.rewardInfos[idx]) return
        const prevData = rewardData.get(f.rewardInfos[idx].mint.address)
        rewardData.set(f.rewardInfos[idx].mint.address, {
          mint: f.rewardInfos[idx].mint,
          amount: new Decimal(prevData?.amount || 0).add(d).toString()
        })
      })
    })
    return Array.from(rewardData.values())
  }, [allPendingRewards, stakedFarmMap])

  const totalPending = Array.from(allPendingRewards.values()).reduce((acc, cur) => {
    return acc.add(cur.usd)
  }, new Decimal(0))

  const pendingRewardsInfo = useMemo(() => {
    const info: { mint: ApiV3Token; amount: string; amountUSD: string }[] = []
    Array.from(allPendingRewards.values()).forEach((r) => {
      r.amount.forEach((amount, idx) => {
        if (amount === '0') return
        const infoIdx = info.findIndex((i) => i.mint.address === r.mint[idx].address)
        if (infoIdx > -1) {
          info[infoIdx].amount = new Decimal(info[infoIdx].amount || 0).add(amount).toFixed(r.mint[idx].decimals)
          info[infoIdx].amountUSD = new Decimal(info[infoIdx].amountUSD || 0).add(r.rewardTokenUsd[idx]).toFixed(4)
        } else {
          info.push({
            mint: r.mint[idx],
            amount,
            amountUSD: r.rewardTokenUsd[idx]
          })
        }
      })
    })
    return info
  }, [allPendingRewards])

  if (!pool) return isLoading ? <Skeleton w="full" height="140px" rounded="lg" /> : null

  const lpAmountUSD = allLpUiAmount.mul(pool.lpPrice ?? 0).toString()
  const [pooledAmountA, pooledAmountB] = [
    allLpUiAmount.mul(baseRatio).mul(0.995).toDecimalPlaces(pool.mintA.decimals, Decimal.ROUND_DOWN).toString(),
    allLpUiAmount.mul(quoteRatio).mul(0.995).toDecimalPlaces(pool.mintB.decimals, Decimal.ROUND_DOWN).toString()
  ]

  const canStake = !unStakeLpBalance.isZero() && stakedFarmList.filter((f) => f.isOngoing).length > 0

  return (
    <Box {...panelCard} py={[4, 5]} px={[3, 8]} pb={isPc && isOpen ? 3 : 5} bg={colors.backgroundLight} borderRadius="xl" w="full">
      <Box
        display={'grid'}
        alignItems="center"
        flexWrap="wrap"
        gridTemplate={[
          `
          "name  name" auto
          "i1    i2  " auto
          "d     d   " auto
          "acts  acts" auto / 1fr 1fr
        `,
          `
          "name  i1  i2   acts" auto 
          "d     d   d    acts" auto / 3fr 1.8fr 1.8fr 5fr
        `,
          `
          "name  i1  i2  d acts" auto / 3fr 1.8fr 1.8fr 9fr 5fr
        `
        ]}
        columnGap={8}
        rowGap={[2, 3]}
      >
        <GridItem flexGrow={1} area="name" maxW={['unset', '200px']}>
          <ItemName
            baseToken={pool.mintA}
            quoteToken={pool.mintB}
            poolName={pool.poolName}
            hasStakeFarm={hasStakeFarm}
            stakeFarmCount={stakeFarmCount}
          />
        </GridItem>

        <GridItem flexGrow={1} area="i1" w={['unset', '92px']} maxW={['unset', '150px']}>
          <StandardMyPosition positionUsd={lpAmountUSD} />
        </GridItem>

        <GridItem flexGrow={1} area="i2" w={['unset', '92px']} maxW={['unset', '150px']}>
          <StandardPoolAPR positionAPR={pool.day.apr} />
        </GridItem>

        <GridItem
          area="d"
          display="grid"
          gridTemplateColumns={['unset', '1fr 1fr']}
          gridTemplateRows={['auto auto', 'unset']}
          columnGap={4}
          rowGap={3}
          justifyItems="stretch"
        >
          <TokenPooledInfo base={{ token: pool.mintA, amount: pooledAmountA }} quote={{ token: pool.mintB, amount: pooledAmountB }} />
          <PendingRewards
            pendingReward={totalPending.toString()}
            rewardInfo={pendingRewardsInfo}
            positionStatus={positionStatus}
            isLoading={isHarvesting}
            onHarvest={handleHarvest}
          />
        </GridItem>

        <GridItem area="acts" ml={['unset', 'auto']}>
          <ActionButtons
            poolId={pool.id}
            farmId={farmInfo?.id}
            hasFarmLp={!new Decimal(farmLpAmount).isZero()}
            canMigrate={canMigrate}
            canStake={!unStakeLpBalance.isZero() && stakedFarmList.filter((f) => f.isOngoing).length > 0}
            onMigrateOpen={() => {
              setRefreshTag(Date.now())
              onRpcFetching()
              onMigrateOpen()
            }}
            canViewMore={Boolean(stakeFarmCount) && !isOpen}
            onClickViewMore={onOpen}
          />
        </GridItem>
      </Box>

      {hasStakeFarm && (
        <Collapse in={isOpen}>
          <VStack mt={4} w="full" align="stretch" gap={3}>
            {stakedFarms.map((stakeFarm) => (
              <StandardPoolRowStakeFarmItem
                key={stakeFarm.farmId}
                hide={isMobile}
                poolId={pool.id}
                farmId={stakeFarm.farmId}
                lpPrice={pool.lpPrice}
                balanceInfo={allFarmBalances.find((f) => f.id === stakeFarm.farmId)}
                onUpdatePendingReward={handleUpdatePendingRewards}
              />
            ))}
          </VStack>

          <Box mt={3}>
            <StandardPoolRowStakeFarmHoldItem lpMint={pool.lpMint} lpPrice={pool.lpPrice} apr={pool.day.apr} />
          </Box>

          <HStack mt={3} justifyItems="center" position="relative" zIndex={1}>
            <Button mx="auto" rightIcon={<ExpandUpIcon />} variant="ghost" size="sm" onClick={onClose}>
              {t('common.view_less')}
            </Button>
          </HStack>
        </Collapse>
      )}

      {hasStakeFarm && isMobile && (
        <MobileStandardAMMDetailDrawer
          isOpen={isOpen}
          onClose={onClose}
          pool={pool}
          stakeFarmCount={stakeFarmCount}
          hasStakeFarm={hasStakeFarm}
          lpAmountUSD={lpAmountUSD}
          stakedFarms={stakedFarms}
          pendingReward={totalPending.toString()}
          positionStatus={positionStatus}
          pooledAmountA={pooledAmountA}
          pooledAmountB={pooledAmountB}
          onUpdatePendingReward={handleUpdatePendingRewards}
          isLoading={isHarvesting}
          onHarvest={handleHarvest}
          canStake={canStake}
          rewardInfo={pendingRewardsInfo}
          allFarmBalances={allFarmBalances}
        />
      )}
      {isMigrateOpen ? (
        <MigrateFromStandardDialog
          isOpen={isMigrateOpen}
          poolInfo={pool}
          migrateClmmConfig={migrateData!}
          farmInfo={farmInfo}
          lpAmount={unStakeLpBalance.toString()}
          farmLpAmount={farmLpAmount}
          pooledAmountA={pooledAmountA}
          pooledAmountB={pooledAmountB}
          currentRewardInfo={currentRewardInfo}
          onClose={onMigrateClose}
          onRefresh={mutate}
        />
      ) : null}
    </Box>
  )
}
