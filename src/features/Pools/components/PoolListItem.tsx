import {
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  Highlight,
  HStack,
  Image,
  Tag,
  Text,
  useColorMode,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import router from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressChip from '@/components/AddressChip'
import Button from '@/components/Button'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import PanelCard from '@/components/PanelCard'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import Tooltip from '@/components/Tooltip'
import { AprKey, FormattedPoolInfoItem } from '@/hooks/pool/type'
import ChartInfoIcon from '@/icons/misc/ChartInfoIcon'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import PulseIcon from '@/icons/misc/PulseIcon'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import StarIcon from '@/icons/misc/StarIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { poolListGrid } from '../cssBlocks'
import { TimeBase } from '../Pools'
import { getFavoritePoolCache, setFavoritePoolCache, toAPRPercent } from '../util'
import PoolDetailMobileDrawer from './PoolDetailMobileDrawer'
import PoolListItemAprDetailPopoverContent from './PoolListItemAprDetailPopoverContent'
import { aprColors, PoolListItemAprLine } from './PoolListItemAprLine'
import { PoolListItemAprPie } from './PoolListItemAprPie'
import { PoolListItemRewardStack } from './PoolListItemRewardStack'

export default function PoolListItem({
  styleType = 'list',
  index,
  timeBase,
  pool,
  field,
  onOpenChart
}: {
  styleType?: string
  index: number
  timeBase: TimeBase
  pool: FormattedPoolInfoItem
  field: AprKey
  onOpenChart?(): void
}) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const [isFavorite, setIsFavoriteState] = useState(getFavoritePoolCache().has(pool.id))

  const [baseToken, quoteToken] = useMemo(
    () => [
      { ...pool.mintA, priority: 3 },
      { ...pool.mintB, priority: 3 }
    ],
    [pool.mintA.address, pool.mintB.address]
  )

  const { isOpen: isPoolDetailOpen, onOpen: onPoolDetailOpen, onClose: onPoolDetailClose } = useDisclosure()

  const timeData = useMemo(() => pool[field], [pool, field])

  const onFavoriteClick = () => {
    setIsFavoriteState((v) => !v)
    setFavoritePoolCache(pool.id)
  }

  const onPoolClick = useCallback(() => {
    isMobile && onPoolDetailOpen()
  }, [isMobile, onPoolDetailOpen])

  const onClickDeposit = useCallback(() => {
    const isStandard = pool.type === 'Standard'
    router.push({
      pathname: isStandard ? '/liquidity/increase' : '/clmm/create-position',
      query: {
        ...(isStandard ? { mode: 'add' } : {}),
        pool_id: pool.id
      }
    })
  }, [pool])

  const feeApr = pool?.allApr[field].find((s) => s.isTradingFee)
  const rewardApr = pool?.allApr[field].filter((s) => !s.isTradingFee && !!s.token) || []
  const aprData = useMemo(
    () => ({
      fee: {
        apr: feeApr?.apr || 0,
        percentInTotal: feeApr?.percent || 0
      },
      rewards:
        rewardApr.map((r) => ({
          apr: r.apr,
          percentInTotal: r.percent,
          mint: r.token!
        })) || [],
      apr: rewardApr.reduce((acc, cur) => acc + cur.apr, 0) + (feeApr?.apr || 0)
    }),
    [pool, field]
  )

  return (
    <>
      {styleType === 'list' ? (
        <Box pl={[0, 6]} px={4} py={3} background={index % 2 ? colors.backgroundTransparent07 : ''} sx={poolListGrid} onClick={onPoolClick}>
          <Flex align="center" gap={[2, 4]}>
            <Desktop>
              <Center width={6} height={6}>
                <StarIcon selected={isFavorite} onClick={onFavoriteClick} style={{ cursor: 'pointer', minWidth: '16px' }} />
              </Center>
            </Desktop>
            <Mobile>
              <Box position={'relative'}>
                <Box
                  bg={isFavorite ? colors.selectActiveSecondary : 'transparent'}
                  borderRadius={'0px 8px 8px 0px'}
                  position="absolute"
                  top={'50%'}
                  left={-4}
                  width={'2.5px'}
                  height={5}
                  transform={'auto'}
                  translateY={'-50%'}
                ></Box>
              </Box>
            </Mobile>

            <Tooltip
              label={
                <Box py={0.5}>
                  <AddressChip address={pool.id} renderLabel={`${t('common.pool_id')}:`} mb="2" textProps={{ fontSize: 'xs' }} />
                  <AddressChip
                    address={baseToken.address}
                    renderLabel={<TokenAvatar token={baseToken} size="xs" />}
                    textProps={{ fontSize: 'xs' }}
                  />
                  <AddressChip
                    address={quoteToken.address}
                    renderLabel={<TokenAvatar token={quoteToken} size="xs" />}
                    textProps={{ fontSize: 'xs' }}
                  />
                </Box>
              }
            >
              <Grid
                gridTemplate={[
                  `
                  "a n" auto
                  "t t" auto / auto 1fr`,
                  `
                  "a t" auto
                  "n n" auto / auto 1fr`,
                  `
                  "a n" auto
                  "a t" auto / auto 1fr`
                ]}
                columnGap={[1, 2]}
                rowGap={[0.5, 0]}
                alignItems="center"
              >
                {/* token pair avatar*/}
                <GridItem area="a">
                  <TokenAvatarPair token1={baseToken} token2={quoteToken} size={['sm', 'smi', 'md']} />
                </GridItem>

                {/* name */}
                <GridItem area="n">
                  <Text color={isLight ? colors.textSecondary : colors.textPrimary} fontSize={['md', 'lg']} fontWeight="500">
                    {pool.poolName.replaceAll(/\s+/g, '')}
                  </Text>
                </GridItem>

                {/* tags */}
                <GridItem area="t">
                  <HStack align="center">
                    <Tag size="sm" variant="rounded">
                      {formatToRawLocaleStr(toPercentString(pool.feeRate * 100))}
                    </Tag>

                    {pool.isOpenBook && (
                      <Tooltip label="This pool shares liquidity to the OpenBook order-book">
                        <Flex alignItems="center">
                          <Tag size="sm" variant="rounded">
                            <OpenBookIcon />
                          </Tag>
                        </Flex>
                      </Tooltip>
                    )}
                  </HStack>
                </GridItem>
              </Grid>
            </Tooltip>
          </Flex>

          <Desktop>
            <Text as={'span'} fontSize={['sm', 'lg']} textAlign={'right'}>
              {formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 0 })}
            </Text>
          </Desktop>

          <Text as={'span'} fontSize={['sm', 'lg']} textAlign={'right'}>
            {formatCurrency(timeData.volume, { symbol: '$', abbreviated: isMobile, decimalPlaces: 0 })}
          </Text>

          <Desktop>
            <Text as={'span'} fontSize={['sm', 'lg']} textAlign={'right'}>
              {formatCurrency(timeData.volumeFee, { symbol: '$', decimalPlaces: 0 })}
            </Text>
          </Desktop>
          <Tooltip
            isContentCard
            placement="top-end"
            label={
              <PoolListItemAprDetailPopoverContent
                rewardType={pool.rewardDefaultPoolInfos === 'Ecosystem' ? t('badge.ecosystem') : ''}
                aprData={aprData}
                weeklyRewards={pool.weeklyRewards}
              />
            }
          >
            <HStack flexDirection={['column', 'column', 'row']} gap={[1, 2, 5]} alignItems={['revert', 'revert', 'center']}>
              <Box width={['unset', '80px', '100px']}>
                <Text fontSize={['md', 'lg', 'xl']} fontWeight={500} whiteSpace="nowrap" align={['revert', 'revert', 'right']}>
                  {formatToRawLocaleStr(toAPRPercent(timeData.apr))}
                </Text>
                <PoolListItemAprLine aprData={aprData} />
              </Box>
              <Desktop>
                {/* Reward stack */}
                <Flex>
                  {pool.weeklyRewards.map((reward, idx) => {
                    if (reward.amount === '0') return null
                    return (
                      <TokenAvatar
                        size={['sm', 'smi', 'md']}
                        key={String(reward.token.address)}
                        token={reward.token}
                        ml={idx > 0 ? -3 : 0}
                        opacity={pool.formattedRewardInfos[idx].ended === true ? 0.3 : 1}
                      />
                    )
                  })}
                </Flex>
              </Desktop>
            </HStack>
          </Tooltip>

          <Desktop>
            <HStack justify={'flex-end'}>
              <Box>
                <Tooltip label={t('liquidity_pools.view_chart_tooltip')}>
                  <Box
                    display={'grid'}
                    placeItems={'center'}
                    cursor={'pointer'}
                    rounded={'full'}
                    border={`2px solid ${colors.chart03}`}
                    px={3}
                    py={1}
                    onClick={onOpenChart}
                  >
                    <ChartInfoIcon />
                  </Box>
                </Tooltip>
              </Box>

              <Button variant="outline" size="sm" onClick={onClickDeposit}>
                {t('button.deposit')}
              </Button>
            </HStack>
          </Desktop>
        </Box>
      ) : (
        <Box display="block" onClick={onPoolClick}>
          <Desktop>
            <PanelCard
              background={colors.backgroundLight}
              borderRadius="16px"
              pt="16px"
              pb="20px"
              px="20px"
              position="relative"
              overflow="hidden"
            >
              <StarIcon
                selected={isFavorite}
                onClick={onFavoriteClick}
                style={{ position: 'absolute', top: '25px', right: '20px', cursor: 'pointer' }}
              />
              <Image src={'/images/liquidity-pool-card-title-bg.svg'} position="absolute" pointerEvents="none" left={0} top={0} alt="" />
              <VStack w="full" spacing={4}>
                {/* Header part */}
                <VStack w="full" spacing={2}>
                  <VStack spacing={0}>
                    <TokenAvatarPair token1={baseToken} token2={quoteToken} size="lg" flexShrink={0} />
                    <Text fontSize="24px" fontWeight="500" color={colors.textPrimary}>
                      {pool.poolName}
                    </Text>
                  </VStack>
                  {/* APR part */}
                  <Flex align="center" bg={colors.backgroundTransparent07} borderRadius="lg" w="full" justify="center" minH="36px">
                    <Tooltip
                      isContentCard
                      label={
                        <Flex minW="260px" direction="column" py={2} px={3} gap={4}>
                          <Flex justify={'space-between'}>
                            <Text fontSize="sm" color={colors.textSecondary}>
                              {t('field.total_apr')}
                            </Text>
                            <Text fontSize="sm" color={colors.textPrimary}>
                              {formatToRawLocaleStr(toAPRPercent(pool.totalApr[field]))}
                            </Text>
                          </Flex>
                          <Grid templateColumns={'60px 1fr'} gap={8}>
                            <GridItem>
                              <PoolListItemAprPie aprs={aprData} />
                            </GridItem>
                            <GridItem>
                              <Flex flexGrow={2} justify="space-between" align="center">
                                <VStack flex={3}>
                                  {pool.allApr[field].slice(0, 3).map(({ apr, isTradingFee, token }, idx) => (
                                    <Flex
                                      w="full"
                                      key={`reward-${isTradingFee ? 'Trade Fees' : token?.symbol}`}
                                      justify={'space-between'}
                                      align="center"
                                    >
                                      <Flex
                                        fontSize="xs"
                                        fontWeight="normal"
                                        color={colors.textSecondary}
                                        justify="flex-start"
                                        align="center"
                                      >
                                        <Box rounded="full" bg={aprColors[idx]} w="7px" h="7px" mr="8px"></Box>
                                        {isTradingFee ? 'Trade Fees' : token?.symbol}
                                      </Flex>
                                      <Box fontSize={'xs'} color={colors.textPrimary}>
                                        {formatToRawLocaleStr(toAPRPercent(Number(apr)))}
                                      </Box>
                                    </Flex>
                                  ))}
                                </VStack>
                              </Flex>
                            </GridItem>
                          </Grid>
                        </Flex>
                      }
                    >
                      <Flex align="center" gap={1} w="full" justify="center">
                        <Text fontSize="xl" fontWeight="500" color={colors.secondary}>
                          {formatToRawLocaleStr(toAPRPercent(pool.totalApr[field]))} {t('field.apr')}
                        </Text>
                        <QuestionCircleIcon opacity={1} color={colors.textSecondary} />
                      </Flex>
                    </Tooltip>
                  </Flex>
                </VStack>
                {/* Body part */}
                <VStack spacing={2} w="full">
                  <HStack justify={'space-between'} w="full">
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t('field.fee_tier')}
                    </Text>
                    <Tooltip
                      label={
                        <Flex maxW="216px">
                          <Text color={colors.textSecondary} fontSize="sm">
                            <Highlight query="concentrated" styles={{ fontWeight: '700', color: `${colors.textSecondary}` }}>
                              {t('liquidity.pool_fee_desc', {
                                feeRate: formatToRawLocaleStr(pool.feeRate * 100),
                                type: t(`liquidity.${pool.type}`)
                              }) || 'liquidity.pool_fee_desc'}
                            </Highlight>
                          </Text>
                        </Flex>
                      }
                    >
                      <Tag size="sm" variant="rounded">
                        {formatToRawLocaleStr(toPercentString(pool.feeRate * 100))}
                      </Tag>
                    </Tooltip>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t(`field.${timeBase}_volume`)}
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                      {formatCurrency(timeData.volume, { symbol: '$', decimalPlaces: 2 })}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t(`field.${timeBase}_fees`)}
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                      {formatCurrency(timeData.volumeFee, { symbol: '$', decimalPlaces: 2 })}
                    </Text>
                  </HStack>
                  <HStack justify={'space-between'} w="full">
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t(`common.tvl`)}
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                      {formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 2 })}
                    </Text>
                  </HStack>
                  <HStack justify={'space-between'} w="full">
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t(`common.rewards`)}
                    </Text>
                    <PoolListItemRewardStack rewards={pool.weeklyRewards} />
                  </HStack>
                </VStack>

                <VStack w="full" spacing={1}>
                  <Button variant="ghost" display="block" width="100%" onClick={onOpenChart}>
                    <HStack justify="center" align="center" color={colors.secondary}>
                      <Text fontSize="md" fontWeight="500">
                        {t('common.view_chart')}
                      </Text>
                      <PulseIcon />
                    </HStack>
                  </Button>
                  <Button display="block" width="100%" onClick={onClickDeposit}>
                    {t('button.deposit')}
                  </Button>
                </VStack>
              </VStack>
            </PanelCard>
          </Desktop>
          <Mobile>
            <PanelCard overflow="hidden" bg={colors.backgroundLight} borderRadius="12px" px={4} py={0}>
              <Flex justify={'space-between'} py={4}>
                <Box>
                  <HStack spacing={2}>
                    <TokenAvatarPair token1={baseToken} token2={quoteToken} size="md" />
                    <Flex direction="column" gap={1}>
                      <HStack spacing={1}>
                        <Text fontWeight="500">
                          {baseToken?.symbol}/{quoteToken?.symbol}
                        </Text>
                        <StarIcon selected={isFavorite} onClick={onFavoriteClick} />
                      </HStack>
                      <HStack spacing="6px">
                        <Tag size="sm" variant="rounded">
                          {formatToRawLocaleStr(toPercentString(pool.feeRate * 100))}
                        </Tag>
                        {pool.isOpenBook ? (
                          <Tag size="sm" variant="rounded">
                            <OpenBookIcon />
                          </Tag>
                        ) : null}
                      </HStack>
                    </Flex>
                  </HStack>
                </Box>
                <Box minW="85px" mr={4}>
                  <Flex flexWrap="wrap" mb={2}>
                    <Text overflowWrap="break-word" wordBreak="break-word" fontWeight="500">
                      {formatToRawLocaleStr(toAPRPercent(timeData.apr))}
                    </Text>
                    <HStack ml={1} spacing={'-7%'}>
                      {pool.weeklyRewards.map((reward, idx) => (
                        <TokenAvatar key={`pool-list-item-reward-${idx}`} token={reward.token} size="xs" />
                      ))}
                    </HStack>
                  </Flex>

                  <PoolListItemAprLine aprData={aprData} />
                </Box>
              </Flex>

              <Box flexGrow={1} height="1px" color={colors.textTertiary} opacity={0.2} bg={colors.dividerDashGradient} />

              <Flex py={4} justify={'space-between'}>
                <Flex flex={3} direction="column">
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {t('liquidity.title')}
                  </Text>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 0 })}
                  </Text>
                </Flex>
                <Flex flex={3} direction="column">
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {t(`field.${timeBase}_volume`)}
                  </Text>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {formatCurrency(timeData.volume, { decimalPlaces: 0 })}
                  </Text>
                </Flex>
                <Flex flex={2} direction="column">
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {t(`field.${timeBase}_fees`)}
                  </Text>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {formatCurrency(timeData.volumeFee, { decimalPlaces: 0 })}
                  </Text>
                </Flex>
              </Flex>
            </PanelCard>
          </Mobile>
        </Box>
      )}
      <Mobile>
        <PoolDetailMobileDrawer
          poolId={pool.id}
          pairName={pool.poolName}
          isOpen={isPoolDetailOpen}
          baseToken={baseToken}
          quoteToken={quoteToken}
          isFavorite={isFavorite}
          onFavoriteClick={onFavoriteClick}
          feeTier={pool.feeRate * 100}
          isOpenBook={pool.isOpenBook}
          onClose={onPoolDetailClose}
          onDeposit={onClickDeposit}
          timeBase={timeBase}
          volume={formatCurrency(timeData.volume, { decimalPlaces: 0 })}
          fees={formatCurrency(timeData.volumeFee, { decimalPlaces: 0 })}
          tvl={formatCurrency(pool.tvl, { decimalPlaces: 0 })}
          aprData={aprData}
          weeklyRewards={pool.weeklyRewards}
          isEcosystem={pool.rewardDefaultPoolInfos === 'Ecosystem'}
        />
      </Mobile>
    </>
  )
}
