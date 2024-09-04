import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, GridItem, HStack, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import Button from '@/components/Button'
import Tabs from '@/components/Tabs'
import { colors } from '@/theme/cssVariables'
import { useAppStore } from '@/store/useAppStore'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { ClmmMyPositionTabContent } from './TabClmm'
import MyPositionTabStaked from './TabStaked'
import MyPositionTabStandard from './TabStandard'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { Select } from '@/components/Select'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import useAllPositionInfo, { PositionTabValues } from '@/hooks/portfolio/useAllPositionInfo'
import { panelCard } from '@/theme/cssBlocks'
import { formatCurrency } from '@/utils/numberish/formatter'
import { useEvent } from '@/hooks/useEvent'
import TokenAvatar from '@/components/TokenAvatar'
import { getMintSymbol } from '@/utils/token'

export default function SectionMyPositions() {
  const { t } = useTranslation()
  const { query } = useRouter()
  const [refreshTag, setRefreshTag] = useState(Date.now())
  const circleRef = useRef<IntervalCircleHandler>(null)
  const tabs: {
    value: PositionTabValues
    label: string
  }[] = [
    {
      value: 'concentrated',
      label: t('portfolio.section_positions_tab_clmm')
    },
    {
      value: 'standard',
      label: t('portfolio.section_positions_tab_standard')
    },
    {
      value: 'staked RAY',
      label: t('portfolio.section_positions_tab_staking')
    }
  ]
  const connected = useAppStore((s) => s.connected)
  const owner = useAppStore((s) => s.publicKey)

  const defaultTab = (query.tab as string) || tabs[0].value

  const [currentTab, setCurrentTab] = useStateWithUrl(defaultTab, 'position_tab', {
    fromUrl: (v) => v,
    toUrl: (v) => v
  })

  const onTabChange = (tab: any) => {
    setCurrentTab(tab)
  }

  const isFocusClmmTab = currentTab === tabs[0].value
  const isFocusStandardTab = currentTab === tabs[1].value
  const isFocusStake = currentTab === tabs[2].value

  const noRewardClmmPos = useRef<Set<string>>(new Set())
  const setNoRewardClmmPos = useEvent((poolId: string, isDelete?: boolean) => {
    if (isDelete) {
      noRewardClmmPos.current.delete(poolId)
      return
    }
    noRewardClmmPos.current.add(poolId)
  })

  useEffect(
    () => () => {
      noRewardClmmPos.current.clear()
    },
    [owner?.toBase58()]
  )

  const {
    handleHarvest,
    handleRefresh,
    farmLpBasedData,
    stakedFarmMap,
    allFarmBalances,
    clmmBalanceInfo,
    clmmLockInfo,
    isClmmLoading,
    isFarmLoading,
    rewardState,
    isSending
  } = useAllPositionInfo({})

  const currentRewardState = rewardState[currentTab as PositionTabValues]

  const handleRefreshAll = useEvent(() => {
    handleRefresh()
    setRefreshTag(Date.now())
  })

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    handleRefreshAll()
  })

  return (
    <>
      <Grid
        gridTemplate={[
          `
          "title  tabs  " auto
          "action action" auto / 1fr 1fr
        `,
          //   `
          //   "title " auto
          //   "tabs  " auto
          //   "action" auto / 1fr
          // `,
          `
          "title title " auto
          "tabs  action" auto / 1fr 1fr
        `
        ]}
        columnGap={3}
        rowGap={[3, 2]}
        mb={3}
        mt={6}
        alignItems={'center'}
      >
        <GridItem area={'title'}>
          <Flex gap="2" alignItems="center">
            <Heading id="my-position" fontSize={['lg', 'xl']} fontWeight="500" color={colors.textPrimary}>
              {t('portfolio.section_positions')}
            </Heading>
            <IntervalCircle
              componentRef={circleRef}
              svgWidth={18}
              strokeWidth={2}
              trackStrokeColor={colors.secondary}
              trackStrokeOpacity={0.5}
              filledTrackStrokeColor={colors.secondary}
              onClick={handleClick}
              onEnd={handleRefreshAll}
            />
          </Flex>
        </GridItem>
        <GridItem area="tabs" justifySelf={['right', 'left']}>
          <Desktop>
            <Tabs size="md" variant="rounded" items={tabs} onChange={onTabChange} value={currentTab} />
          </Desktop>
          <Mobile>
            <Select variant="roundedFilledFlowDark" items={tabs} onChange={onTabChange} value={currentTab} />
          </Mobile>
        </GridItem>
        <GridItem area={'action'} justifySelf={['stretch', 'stretch', 'right']}>
          {connected ? (
            <Box py="6px" px={4} bg={colors.transparentContainerBg} borderRadius="12px">
              <HStack justify={'space-between'} gap={8}>
                <Flex gap={[0, 2]} direction={['column', 'row']} fontSize={['xs', 'sm']} align={['start', 'center']}>
                  <Text whiteSpace={'nowrap'} color={colors.textSecondary}>
                    {t('portfolio.harvest_all_label')}
                  </Text>
                  <HStack>
                    <Flex gap="2" alignItems="center" whiteSpace={'nowrap'} color={colors.textPrimary} fontWeight={500}>
                      {formatCurrency(currentRewardState.pendingReward, { symbol: '$', maximumDecimalTrailingZeroes: 4 })}
                      {currentRewardState.rewardInfo.length > 0 ? (
                        <QuestionToolTip
                          label={
                            <>
                              {currentRewardState.rewardInfo.map((r) => (
                                <Flex key={r.mint.address} alignItems="center" gap="1" my="2">
                                  <TokenAvatar key={`pool-reward-${r.mint.address}`} size={'sm'} token={r.mint} />
                                  <Text color={colors.textPrimary}>
                                    {formatCurrency(r.amount, {
                                      maximumDecimalTrailingZeroes: 5
                                    })}
                                  </Text>
                                  <Text>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
                                  <Text color={colors.textPrimary}>({formatCurrency(r.amountUSD, { symbol: '$', decimalPlaces: 4 })})</Text>
                                </Flex>
                              ))}
                            </>
                          }
                          iconType="info"
                          iconProps={{ width: 18, height: 18, fill: colors.textSecondary }}
                        />
                      ) : null}
                    </Flex>
                  </HStack>
                </Flex>
                <Button
                  size={['sm', 'md']}
                  isLoading={isSending}
                  isDisabled={!currentRewardState.isReady}
                  onClick={() => handleHarvest({ tab: currentTab as PositionTabValues, zeroClmmPos: noRewardClmmPos.current })}
                >
                  {t('portfolio.harvest_all_button')}
                </Button>
              </HStack>
            </Box>
          ) : null}
        </GridItem>
      </Grid>
      {connected ? (
        isFocusClmmTab ? (
          <ClmmMyPositionTabContent
            isLoading={isClmmLoading}
            clmmBalanceInfo={clmmBalanceInfo}
            lockInfo={clmmLockInfo}
            setNoRewardClmmPos={setNoRewardClmmPos}
            refreshTag={refreshTag}
          />
        ) : isFocusStandardTab ? (
          <MyPositionTabStandard
            isLoading={isFarmLoading}
            allFarmBalances={allFarmBalances}
            lpBasedData={farmLpBasedData}
            stakedFarmMap={stakedFarmMap}
            refreshTag={refreshTag}
          />
        ) : isFocusStake ? (
          <MyPositionTabStaked allFarmBalances={allFarmBalances} farmLpBasedData={farmLpBasedData} refreshTag={refreshTag} />
        ) : null
      ) : (
        <SimpleGrid {...panelCard} placeItems={'center'} bg={colors.backgroundLight} borderRadius="12px" py={12}>
          <Text my={8} color={colors.textTertiary} fontSize={['sm', 'md']}>
            {t('wallet.connected_hint.portfolio_position')}
          </Text>
        </SimpleGrid>
      )}
    </>
  )
}
