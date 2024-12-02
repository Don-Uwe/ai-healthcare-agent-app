import { useCallback, useMemo, useRef, useState } from 'react'
import { Box, Button, Collapse, Flex, GridItem, HStack, Text, VStack, useDisclosure, Skeleton } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import BN from 'bn.js'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import MigrateFromStandardDialog from '@/features/Clmm/MigrateClmmFromStandardDialog/Dialog'
import { FormattedFarmInfoV6 } from '@/hooks/farm/type'
import { FarmPositionInfo } from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchRpcPoolData from '@/hooks/pool/amm/useFetchRpcPoolData'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import ExpandUpIcon from '@/icons/misc/ExpandUpIcon'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import { useFarmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'

import ActionButtons from './ItemDetail/ActionButtons'
import ItemName from './ItemDetail/ItemName'
import PendingRewards from './ItemDetail/PendingRewards'
import PendingFees from './ItemDetail/PendingFees'
import StandardMyPosition from './ItemDetail/StandardMyPosition'
import LockedPosition from './ItemDetail/LockedPosition'
import StandardPoolAPR from './ItemDetail/StandardPoolAPR'
import TokenPooledInfo from './ItemDetail/TokenInfo'
import { FarmTitleBadge } from './ItemDetail/FarmTitleBadge'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import LockPercentCircle from '@/components/LockPercentCircle'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import MobileStandardAMMDetailDrawer from './components/MobileStandardAMMDetailDrawer'
import MobileLockedAMMDetailDrawer from './components/MobileLockedAMMDetailDrawer'
import StandardPoolRowStakeFarmHoldItem from './components/StandardPoolRowStakeFarmHoldItem'
import StandardPoolRowStakeFarmItem from './components/StandardPoolRowStakeFarmItem'
import ClaimFeesModal from './components/ClaimFeesModal'
import { useEvent } from '@/hooks/useEvent'
import { panelCard } from '@/theme/cssBlocks'
import { FarmBalanceInfo } from '@/hooks/farm/type'
import useMigratePoolConfig from '@/hooks/pool/useMigratePoolConfig'
import { CpmmLockData } from '@/hooks/portfolio/cpmm/useLockCpmmBalance'
import toApr from '@/utils/numberish/toApr'
import { formatToRawLocaleStr, formatCurrency } from '@/utils/numberish/formatter'
import { routeToPage } from '@/utils/routeTools'
import { Desktop, Mobile } from '@/components/MobileDesktop'

type PoolItemProps = {
  pool?: FormattedPoolInfoStandardItem
  isLoading: boolean
  position: FarmPositionInfo
  stakedFarmMap: Map<string, FormattedFarmInfoV6>
  allFarmBalances: FarmBalanceInfo[]
  lockInfo: CpmmLockData[]
}

export default function StandardPoolRowItem({ pool, isLoading, position, stakedFarmMap, allFarmBalances, lockInfo }: PoolItemProps) {
  const { t } = useTranslation()
  const harvestAllFarmAct = useFarmStore((s) => s.harvestAllAct)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isHarvesting, onOpen: onHarvesting, onClose: offHarvesting } = useDisclosure()
  const { isOpen: isMigrateOpen, onOpen: onMigrateOpen, onClose: onMigrateClose } = useDisclosure()
  const { isOpen: isClaimModalOpen, onOpen: onClaimModalOpen, onClose: onClaimModalClose } = useDisclosure()
  const { isOpen: isRpcFetching, onOpen: onRpcFetching } = useDisclosure()
  const { isOpen: isLockedDrawerOpen, onOpen: onLockedDrawerOpen, onClose: onLockedDrawerClose } = useDisclosure()
  const [refreshTag, setRefreshTag] = useState(0)
  const lockInfoRef = useRef<CpmmLockData | undefined>()
  const [selectedLockedInfo, setSelectedLockedInfo] = useState<CpmmLockData | null>(null)

  const [allPendingRewards, setAllPendingRewards] = useState<
    Map<string, { mint: ApiV3Token[]; usd: string; amount: string[]; rewardTokenUsd: string[] }>
  >(new Map())
  const updateReward = new Map()
  const { data: migratePoolList } = useMigratePoolConfig({})
  const migrateData = migratePoolList.find((p) => p.lpMint === pool?.lpMint.address)

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

  const handleClaimModalOpen = useEvent((info?: CpmmLockData) => {
    lockInfoRef.current = info
    onClaimModalOpen()
  })

  const { data: rpcPoolData, mutate } = useFetchRpcPoolData({
    shouldFetch: isRpcFetching,
    poolId: pool?.id,
    refreshInterval: isMigrateOpen ? 1000 * 15 : undefined,
    refreshTag
  })

  const unStakeLpBalance = getTokenBalanceUiAmount({ mint: pool?.lpMint.address || '', decimals: pool?.lpMint.decimals }).rawAmount
  const allLpUiAmount = new Decimal(position.totalLpAmount || 0).add(unStakeLpBalance).div(10 ** (pool?.lpMint.decimals ?? 0))

  const canMigrate = !!migrateData && allLpUiAmount.gt(0)

  const isEmptyLp = allLpUiAmount.isZero() && farmLpAmount === '0'

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

  const handleOpenLockedDrawer = useCallback((lockedInfo: CpmmLockData | null) => {
    setSelectedLockedInfo(lockedInfo)
    onLockedDrawerOpen()
  }, [])

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

  const hasFarm = pool?.farmOngoingCount > 0 || pool?.farmUpcomingCount > 0
  let positionStatus = ''
  if (!stakedFarms.length && pool && hasFarm) {
    positionStatus = 'unstaked'
  } else if (pool?.isRewardEnded && !stakedFarmList.some((f) => f.isOngoing) && !totalPending.isZero()) {
    positionStatus = 'ended'
  }

  const lpAmountUSD = allLpUiAmount.mul(pool.lpPrice ?? 0).toString()
  const [pooledAmountA, pooledAmountB] = [
    allLpUiAmount.mul(baseRatio).mul(0.995).toDecimalPlaces(pool.mintA.decimals, Decimal.ROUND_DOWN).toString(),
    allLpUiAmount.mul(quoteRatio).mul(0.995).toDecimalPlaces(pool.mintB.decimals, Decimal.ROUND_DOWN).toString()
  ]

  const canStake = !unStakeLpBalance.isZero() && (pool.farmOngoingCount > 0 || pool.farmUpcomingCount > 0)

  const isPartialLiquidityLocked = (lockInfo.length > 0 && !isEmptyLp) || lockInfo.length > 1
  const isAllLiquidityLocked = lockInfo.length > 0 && isEmptyLp
  const hasFarmLp = !new Decimal(farmLpAmount).isZero()
  const canViewMore = Boolean(stakeFarmCount) && !isOpen

  return (
    <Box {...panelCard} bg={colors.backgroundLight} borderRadius="xl" w="full" py={[4, 0]}>
      <Mobile>
        <Box px={3}>
          <Flex gap={1} direction="column">
            <Flex justifyContent="space-between">
              <Flex alignItems="center" gap={2}>
                <TokenAvatarPair size="sm" token1={pool.mintA} token2={pool.mintB} />
                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium" whiteSpace={'nowrap'}>
                  {pool.poolName?.replace(' - ', '/')}
                </Text>
                {hasStakeFarm && stakeFarmCount !== 0 && <FarmTitleBadge stakeFarmCount={stakeFarmCount} />}
              </Flex>
              <Flex gap={2}>
                <Button
                  variant="outline"
                  size="xs"
                  w={9}
                  h={6}
                  onClick={() => {
                    hasFarmLp
                      ? routeToPage('decrease-liquidity', {
                          queryProps: {
                            mode: 'unstake',
                            pool_id: pool.id,
                            farm_id: farmInfo?.id
                          }
                        })
                      : routeToPage('decrease-liquidity', {
                          queryProps: {
                            mode: 'remove',
                            pool_id: pool.id
                          }
                        })
                  }}
                >
                  <MinusIcon color={colors.secondary} />
                </Button>
                <Button
                  size="xs"
                  w={9}
                  h={6}
                  onClick={() => {
                    routeToPage('increase-liquidity', {
                      queryProps: {
                        mode: 'add',
                        pool_id: pool.id
                      }
                    })
                  }}
                >
                  <PlusIcon />
                </Button>
                {canMigrate ? (
                  <Button size="xs" w={16} h={6} onClick={onMigrateOpen}>
                    {t('portfolio.stake_item_migrate_button')}
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    w={16}
                    h={6}
                    isDisabled={!canStake}
                    onClick={() => {
                      routeToPage('increase-liquidity', {
                        queryProps: {
                          mode: 'stake',
                          pool_id: pool.id
                        }
                      })
                    }}
                  >
                    {t('portfolio.stake_item_stake_button')}
                  </Button>
                )}
              </Flex>
            </Flex>
            <Flex alignItems="center" gap={1}>
              <Text fontSize="xs" color={colors.lightPurple} opacity={0.5}>
                {t('field.apr')}:
              </Text>
              <Text fontSize="xs" color={colors.textPrimary} fontWeight="medium">
                ~{formatToRawLocaleStr(toApr({ val: pool.day.apr, multiply: false }))}
              </Text>
              <QuestionToolTip
                iconProps={{
                  fill: colors.lightPurple
                }}
                iconType="info"
                label={t('liquidity.APR_tooltip')}
              />
            </Flex>
          </Flex>
          <Flex
            borderRadius="md"
            justifyContent="space-between"
            p={3}
            mt={4}
            alignItems={'center'}
            bg={isAllLiquidityLocked ? colors.modalContainerBg : colors.backgroundDark}
            onClick={() => {
              isAllLiquidityLocked ? handleOpenLockedDrawer(lockInfo[0]) : onOpen()
            }}
          >
            <Flex direction="column" gap={2} fontSize="sm">
              <Flex justify="flex-start" align="flex-start" gap={2}>
                <Text color={colors.textSecondary}>
                  {isAllLiquidityLocked ? t('liquidity.locked_position') : t('liquidity.my_position')}
                </Text>
                <Text color={colors.textPrimary} fontWeight="medium">
                  {formatCurrency(isAllLiquidityLocked ? lockInfo[0].positionInfo.usdValue : lpAmountUSD, {
                    symbol: '$',
                    abbreviated: true,
                    decimalPlaces: 2
                  })}
                </Text>
                {isAllLiquidityLocked && lockInfo[0].positionInfo.tvlPercentage > 5 && (
                  <LockPercentCircle
                    value={lockInfo[0].positionInfo.tvlPercentage}
                    iconProps={{
                      width: 10,
                      height: 10
                    }}
                  />
                )}
              </Flex>
              <Flex justify="flex-start" align={'flex-start'} gap={2}>
                <Text color={colors.textSecondary}>{t('amm.pending_reward')}</Text>
                <Text color={colors.textPrimary} fontWeight="medium">
                  {formatCurrency(isAllLiquidityLocked ? lockInfo[0].positionInfo.unclaimedFee.usdValue : totalPending.toString(), {
                    symbol: '$',
                    abbreviated: true,
                    decimalPlaces: 2
                  })}
                </Text>
              </Flex>
            </Flex>
            <ChevronRightIcon color={colors.secondary} />
          </Flex>
        </Box>
        {isPartialLiquidityLocked &&
          (isAllLiquidityLocked ? lockInfo.slice(1, lockInfo.length) : lockInfo).map((info, idx) => (
            <Box key={idx} px={3}>
              <Flex
                borderRadius="md"
                justifyContent="space-between"
                p={3}
                mt={2}
                alignItems={'center'}
                bg={colors.modalContainerBg}
                onClick={() => {
                  handleOpenLockedDrawer(info)
                }}
              >
                <Flex direction="column" gap={2} fontSize="sm">
                  <Flex justify="flex-start" align="flex-start" gap={2}>
                    <Text color={colors.textSecondary}>{t('liquidity.locked_position')}</Text>
                    <Text color={colors.textPrimary} fontWeight="medium">
                      {formatCurrency(info.positionInfo.usdValue, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                    {info.positionInfo.tvlPercentage > 5 && (
                      <LockPercentCircle
                        value={info.positionInfo.tvlPercentage}
                        iconProps={{
                          width: 10,
                          height: 10
                        }}
                      />
                    )}
                  </Flex>
                  <Flex justify="flex-start" align={'flex-start'} gap={2}>
                    <Text color={colors.textSecondary}>{t('amm.pending_reward')}</Text>
                    <Text color={colors.textPrimary} fontWeight="medium">
                      {formatCurrency(info.positionInfo.unclaimedFee.usdValue, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
                    </Text>
                  </Flex>
                </Flex>
                <ChevronRightIcon color={colors.secondary} />
              </Flex>
            </Box>
          ))}
        {hasStakeFarm && (
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
        {(isPartialLiquidityLocked || isAllLiquidityLocked) && selectedLockedInfo && (
          <MobileLockedAMMDetailDrawer
            isOpen={isLockedDrawerOpen}
            onClose={onLockedDrawerClose}
            pool={pool}
            lockInfo={selectedLockedInfo}
            stakeFarmCount={stakeFarmCount}
            hasStakeFarm={hasStakeFarm}
            onHarvest={handleClaimModalOpen}
          />
        )}
      </Mobile>
      <Desktop>
        <Box
          {...(isAllLiquidityLocked && { bg: colors.modalContainerBg })}
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
          "name  i1  i2  d acts" auto / 3fr 1.8fr 1.8fr 9fr minmax(200px, 5fr)
        `
          ]}
          columnGap={8}
          rowGap={[2, 3]}
          py={[2, 3]}
          px={[3, 8]}
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
            {isAllLiquidityLocked ? (
              <LockedPosition positionUsd={lockInfo[0].positionInfo.usdValue} burnPercent={lockInfo[0].positionInfo.tvlPercentage} />
            ) : (
              <StandardMyPosition positionUsd={lpAmountUSD} />
            )}
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
            <TokenPooledInfo
              base={{ token: pool.mintA, amount: isAllLiquidityLocked ? lockInfo[0].positionInfo.amountA : pooledAmountA }}
              quote={{ token: pool.mintB, amount: isAllLiquidityLocked ? lockInfo[0].positionInfo.amountB : pooledAmountB }}
            />
            {isAllLiquidityLocked ? (
              <PendingFees
                pendingFee={lockInfo[0].positionInfo.unclaimedFee.usdValue}
                poolInfo={pool}
                lockData={lockInfo[0]}
                onHarvest={handleClaimModalOpen}
              />
            ) : hasFarm ? (
              <PendingRewards
                pendingReward={totalPending.toString()}
                rewardInfo={pendingRewardsInfo}
                positionStatus={positionStatus}
                isLoading={isHarvesting}
                onHarvest={handleHarvest}
              />
            ) : null}
          </GridItem>

          <GridItem area="acts" ml={['unset', 'auto']}>
            <ActionButtons
              poolId={pool.id}
              farmId={farmInfo?.id}
              hasFarmLp={hasFarmLp}
              canMigrate={canMigrate}
              canStake={canStake}
              onMigrateOpen={() => {
                setRefreshTag(Date.now())
                onRpcFetching()
                onMigrateOpen()
              }}
              canViewMore={canViewMore}
              onClickViewMore={onOpen}
              isLocked={isAllLiquidityLocked}
            />
          </GridItem>
        </Box>
        {hasStakeFarm && (
          <Box px={[3, 8]}>
            <Collapse in={isOpen}>
              <VStack mt={[2, 1]} w="full" align="stretch" gap={3}>
                {stakedFarms.map((stakeFarm) => {
                  let balanceInfo = allFarmBalances.find((f) => f.id === stakeFarm.farmId)
                  const v1Balance = position.data.find((p) => p.version === 'V1' && p.lpAmount !== '0' && p.farmId === stakeFarm.farmId)
                  if (balanceInfo && v1Balance && balanceInfo.vault !== v1Balance.userVault) {
                    balanceInfo = {
                      ...balanceInfo,
                      deposited: new Decimal(balanceInfo.deposited)
                        .add(v1Balance.lpAmount)
                        .div(10 ** pool.lpMint.decimals)
                        .toString()
                    }
                  }

                  return (
                    <StandardPoolRowStakeFarmItem
                      key={stakeFarm.farmId}
                      poolId={pool.id}
                      farmId={stakeFarm.farmId}
                      lpPrice={pool.lpPrice}
                      balanceInfo={balanceInfo}
                      onUpdatePendingReward={handleUpdatePendingRewards}
                    />
                  )
                })}
              </VStack>
              <Box mt={3}>
                <StandardPoolRowStakeFarmHoldItem lpMint={pool.lpMint} lpPrice={pool.lpPrice} apr={pool.day.apr} />
              </Box>
              <HStack mt={3} pb={[2, 3]} justifyItems="center" position="relative" zIndex={1}>
                <Button mx="auto" rightIcon={<ExpandUpIcon />} variant="ghost" size="sm" onClick={onClose}>
                  {t('common.view_less')}
                </Button>
              </HStack>
            </Collapse>
          </Box>
        )}
        {isPartialLiquidityLocked &&
          (isAllLiquidityLocked ? lockInfo.slice(1, lockInfo.length) : lockInfo).map((info, idx) => (
            <Box
              key={idx}
              bg={colors.modalContainerBg}
              display={'grid'}
              alignItems="center"
              flexWrap="wrap"
              gridTemplate={[
                `
          "i1    i2  " auto
          "d     d   " auto / 1fr 1fr
        `,
                `
          "i1  i2  .   ." auto
          "d     d   d    ." auto / 3fr 1.8fr 1.8fr 5fr
        `,
                `
          ".  i1  i2  d ." auto / 3fr 1.8fr 1.8fr 9fr minmax(200px, 5fr)
        `
              ]}
              columnGap={8}
              rowGap={[2, 3]}
              py={[2, 3]}
              px={[3, 8]}
            >
              <GridItem flexGrow={1} area="i1" w={['unset', '92px']} maxW={['unset', '150px']}>
                <LockedPosition positionUsd={info.positionInfo.usdValue} burnPercent={info.positionInfo.tvlPercentage} />
              </GridItem>
              <GridItem flexGrow={1} area="i2" w={['unset', '92px']} maxW={['unset', '150px']}>
                <StandardPoolAPR positionAPR={pool.day.apr} isLocked={true} />
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
                <TokenPooledInfo
                  base={{ token: pool.mintA, amount: info.positionInfo.amountA }}
                  quote={{ token: pool.mintB, amount: info.positionInfo.amountB }}
                />
                <PendingFees
                  pendingFee={info.positionInfo.unclaimedFee.usdValue}
                  poolInfo={pool}
                  lockData={info}
                  onHarvest={handleClaimModalOpen}
                />
              </GridItem>
            </Box>
          ))}
      </Desktop>
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
          userAuxiliaryLedgers={position.hasV1Data ? [position.data.find((p) => p.version === 'V1')!.userVault] : undefined}
          onClose={onMigrateClose}
          onRefresh={mutate}
        />
      ) : null}
      {isClaimModalOpen && lockInfoRef.current ? (
        <ClaimFeesModal isOpen={isClaimModalOpen} onClose={onClaimModalClose} poolInfo={pool} lockData={lockInfoRef.current} />
      ) : null}
    </Box>
  )
}
