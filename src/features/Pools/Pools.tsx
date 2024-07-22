import {
  Box,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Stack,
  Switch,
  Tag,
  Text,
  useBreakpointValue,
  useDisclosure,
  useUpdateEffect
} from '@chakra-ui/react'
import { ApiV3Token, FetchPoolParams, PoolFetchType } from '@raydium-io/raydium-sdk-v2'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import List, { ListPropController } from '@/components/List'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import PageHeroTitle from '@/components/PageHeroTitle'
import { Select } from '@/components/Select'
import Tabs from '@/components/Tabs'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenSearchInput from '@/components/TokenSearchInput'
import useFetchMainInfo from '@/hooks/info/useFetchMainInfo'
import { AprKey, FormattedPoolInfoItem } from '@/hooks/pool/type'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useFetchPoolByMint from '@/hooks/pool/useFetchPoolByMint'
import useFetchPoolList from '@/hooks/pool/useFetchPoolList'
import { useEvent } from '@/hooks/useEvent'
import usePrevious from '@/hooks/usePrevious'
import useSort from '@/hooks/useSort'
import GridIcon from '@/icons/misc/GridIcon'
import ListIcon from '@/icons/misc/ListIcon'
import MoreListControllers from '@/icons/misc/MoreListControllers'
import NotFound from '@/icons/misc/NotFound'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import { useAppStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX, revertAppLayoutPaddingX } from '@/theme/detailConfig'
import { isValidPublicKey } from '@/utils/publicKey'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { shakeUndefindedItem } from '@/utils/shakeUndefindedItem'
import { useEffectWithUrl, useStateWithUrl } from '../../hooks/useStateWithUrl'
import CreatePoolButton from './components/CreatePoolButton'
import PoolChartModal from './components/PoolChart'
import PoolItemLoadingSkeleton from './components/PoolItemLoadingSkeleton'
import { PoolListHeader } from './components/PoolListHeader'
import PoolListItem from './components/PoolListItem'
import TVLInfoPanel, { TVLInfoPanelMobile } from './components/TVLInfoPanel'
import { useScrollTitleCollapse } from './useScrollTitleCollapse'
import { getFavoritePoolCache, POOL_SORT_KEY } from './util'
import i18n from '@/i18n'
import { setUrlQuery, useRouteQuery } from '@/utils/routeTools'
import { urlToMint, mintToUrl } from '@/utils/token'

export type PoolPageQuery = {
  token?: string
  search?: string
  tab?: 'concentrated' | 'standard' | 'all'
  layout?: 'list' | 'grid'
}

type PoolTabItem = {
  name: string
  label: string
  value: PoolFetchType
}

export type TimeBase = '24h' | '7d' | '30d'

export const FILED_KEY: Record<TimeBase, AprKey> = {
  '24h': AprKey.Day,
  '7d': AprKey.Week,
  '30d': AprKey.Month
}

const SORT_ITEMS = [
  {
    name: 'default',
    label: i18n.t('liquidity.default'),
    value: 'default'
  },
  {
    name: 'tvl_dsc',
    label: i18n.t('liquidity.tvl_dsc'),
    value: 'volume_desc'
  },
  {
    name: 'tvl_asc',
    label: i18n.t('liquidity.tvl_asc'),
    value: 'volume_asc'
  },
  {
    name: 'lp_dsc',
    label: i18n.t('liquidity.lp_dsc'),
    value: 'liquidity_desc'
  },
  {
    name: 'lp_asc',
    label: i18n.t('liquidity.lp_asc'),
    value: 'liquidity_asc'
  },
  {
    name: 'apr_dsc',
    label: i18n.t('liquidity.yield_dsc'),
    value: 'apr_desc'
  },
  {
    name: 'apr_asc',
    label: i18n.t('liquidity.yield_asc'),
    value: 'apr_asc'
  }
]

export default function Pools() {
  const { t, i18n } = useTranslation()
  const query = useRouteQuery()
  const currentQuery = useRef(query)
  currentQuery.current = query || {}
  const isEN = i18n.language === 'en'
  const isMobile = useAppStore((s) => s.isMobile)

  const tabItems: PoolTabItem[] = [
    {
      name: 'Concentrated',
      label: isEN && isMobile ? 'CLMM' : t('liquidity.concentrated'),
      value: PoolFetchType.Concentrated
    },
    {
      name: 'Standard',
      label: isEN && isMobile ? 'STANDARD' : t('liquidity.standard'),
      value: PoolFetchType.Standard
    },
    {
      name: 'All',
      label: isEN && isMobile ? 'ALL' : t('common.all'),
      value: PoolFetchType.All
    }
  ]

  const listControllerIconSize = useBreakpointValue({ base: '24px', sm: '28px' })
  const gridCardSize = useBreakpointValue({ base: undefined, sm: 290 })
  const gridCardGap = useBreakpointValue({ base: 4, sm: 5 })
  const { isOpen: isChartOpen, onOpen: openChart, onClose: closeChart } = useDisclosure()
  const [chartPoolInfo, setChartPoolInfo] = useState<FormattedPoolInfoItem>()

  // -------- search --------
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [searchTokens, setSearchTokens] = useState<ApiV3Token[]>([])

  const { order, sortKey, onChangeSortData, setOrder } = useSort({
    defaultKey: 'default'
  })

  useEffectWithUrl(
    'token',
    (query) => {
      if (!query) return
      if (!tokenMap) return
      const tokenMints = query.split(',')
      const tokens = shakeUndefindedItem(tokenMints.map((mint) => tokenMap.get(urlToMint(mint)!)))
      if (tokens.length) {
        setSearchTokens(tokens)
      }
    },
    [tokenMap]
  )

  const [searchText, setSearchText] = useState('')
  const favoritePools = getFavoritePoolCache()
  const { data: infoData } = useFetchMainInfo({})
  const isSearchPublicKey = isValidPublicKey(searchText)

  // -------- detail setting: show farms --------
  // need api
  const [showFarms, setShowFarms] = useStateWithUrl(false, 'show_farms', {
    fromUrl: (u) => u === 'true',
    toUrl: (v) => String(v)
  })

  // -------- detail setting: time base --------
  const [timeBase, setTimeBase] = useStateWithUrl<TimeBase>(Object.keys(FILED_KEY)[0] as TimeBase, 'time_base', {
    fromUrl: (u) => u as TimeBase,
    toUrl: (v) => v
  })

  const [urlSortKey, setUrlSortKey] = useStateWithUrl(sortKey, 'sort_by', {
    fromUrl: (u) => u,
    toUrl: (v) => v
  })

  const [urlOrder, setUrlOrder] = useStateWithUrl('desc', 'order', {
    fromUrl: (u) => u,
    toUrl: (v) => v
  })

  useUpdateEffect(() => {
    setUrlQuery({
      ...currentQuery.current,
      token: searchTokens.length ? searchTokens.map((t) => mintToUrl(t.address)).join(',') : undefined
    })
  }, [searchTokens])

  // -------- detail setting: layout --------
  const [currentLayoutStyle, setCurrentLayoutStyle] = useStateWithUrl('list', 'layout', {
    fromUrl: (u) => (u === 'grid' ? 'grid' : 'list'),
    toUrl: (v) => (v === 'grid' ? 'grid' : 'list')
  })

  // -------- tab --------
  const [activeTabItem, setActiveTabItem] = useStateWithUrl(tabItems[0], 'tab', {
    fromUrl: (u) => tabItems.find((item) => item.value === u) ?? tabItems[0],
    toUrl: (v) => v.value
  })
  const onPoolValueChange = useEvent((value: PoolFetchType) => {
    const newActiveTabItem = tabItems.find((item) => item.value === value)
    if (newActiveTabItem) {
      setActiveTabItem(newActiveTabItem)
    }
  })

  // -------- control list --------
  const listControllerRef = useRef<ListPropController>()
  useEffect(() => {
    listControllerRef.current?.resetRenderCount()
  }, [activeTabItem, currentLayoutStyle, showFarms, timeBase])

  const search = searchTokens.reduce((acc, cur) => acc + ',' + cur.address, '')
  const hasSearch = searchTokens.length > 0
  const {
    formattedData: orgData,
    loadMore: orgLoadMore,
    isLoadEnded: isOrgLoadedEnd,
    isLoading: isOrgLoading
  } = useFetchPoolList({
    showFarms,
    shouldFetch: !hasSearch,
    type: activeTabItem.value,
    order: order ? 'desc' : 'asc',
    sort: sortKey !== 'liquidity' && sortKey !== 'default' ? `${sortKey}${timeBase}` : sortKey
  })

  const {
    formattedData: searchMintData,
    isLoadEnded: isSearchMintLoadEnded,
    isLoading: isSearchMintLoading
  } = useFetchPoolByMint({
    showFarms,
    mint1: searchTokens[0]?.address,
    mint2: searchTokens[1]?.address,
    type: activeTabItem.value,
    order: order ? 'desc' : 'asc',
    sort: (sortKey !== 'liquidity' && sortKey !== 'default' ? `${sortKey}${timeBase}` : sortKey) as FetchPoolParams['sort']
  })

  const { formattedData: searchIdData, isLoading: isSearchIdLoading } = useFetchPoolById({
    idList: [searchText],
    type: activeTabItem.value
  })

  const searchData = searchIdData?.length ? searchIdData : searchMintData
  const isSearchLoading = isSearchPublicKey ? isSearchIdLoading || isSearchMintLoading : isSearchMintLoading
  const isSearchLoadEnded = isSearchPublicKey ? !isSearchIdLoading && isSearchMintLoadEnded : isSearchMintLoadEnded
  const isNotFound = (searchTokens.length > 0 || isSearchPublicKey) && !isSearchLoading && !searchData.length

  const data = hasSearch || searchIdData?.length ? searchData : orgData
  const isLoading = hasSearch ? isSearchLoading : isOrgLoading
  const isLoadEnded = hasSearch ? isSearchLoadEnded : isOrgLoadedEnd
  const loadMore = hasSearch ? () => {} : orgLoadMore
  const sortedData = useMemo(() => {
    // if (!favoritePools.size) return data
    const favorite: FormattedPoolInfoItem[] = []
    const normal: FormattedPoolInfoItem[] = []
    data.forEach((p) => {
      if (favoritePools.has(p.id)) return favorite.push(p)
      normal.push(p)
    })
    return [...favorite, ...normal]
  }, [data, Array.from(favoritePools).toString()])

  const prevSearch = usePrevious(search)
  const sortRef = useRef<string>('default')

  useEffect(() => {
    const sort = sortRef.current.match(/[a-zA-Z]+/g)?.[0] || 'default'
    if (sortRef.current === sort) return
    onChangeSortData(sort)
  }, [timeBase])

  useEffect(() => {
    if (urlSortKey === sortKey || !POOL_SORT_KEY[urlSortKey as keyof typeof POOL_SORT_KEY]) return
    onChangeSortData(urlSortKey)
  }, [])

  useEffect(() => {
    const urlOrderNum = urlOrder === 'asc' ? 0 : 1
    if (urlOrderNum === order) return
    setOrder(urlOrderNum)
  }, [])

  useUpdateEffect(() => {
    setUrlOrder(order === 0 ? 'asc' : 'desc')
  }, [order])

  const handleSwitchFarmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowFarms(e.currentTarget.checked)
  }

  const handleClickSort = (propertyName: string) => {
    onChangeSortData(propertyName)
    setUrlSortKey(propertyName)
  }

  // secondary controller bar
  const { containerProps, titleContainerProps, scrollBodyProps } = useScrollTitleCollapse()
  const { isOpen: isCollapseOpen, onToggle: toggleSubcontrollers } = useDisclosure()

  const [tvl, volume] = infoData ? [infoData.tvl, infoData.volume24] : ['0', '0']

  const renderPoolListItem = useCallback(
    (info: FormattedPoolInfoItem, idx: number) => (
      <PoolListItem
        styleType={currentLayoutStyle}
        index={idx}
        timeBase={timeBase}
        field={FILED_KEY[timeBase]}
        pool={info}
        onOpenChart={() => {
          openChart()
          setChartPoolInfo(info)
        }}
      />
    ),
    [currentLayoutStyle, timeBase]
  )
  return (
    <>
      <Flex flexDirection="column" height={'100%'} flexGrow={1} {...containerProps}>
        {/* Title Part */}
        <Box {...titleContainerProps} display={['none', 'block']} flexShrink={0}>
          <Desktop>
            <HStack justify="space-between" w="full" pb={4}>
              <PageHeroTitle title={t('liquidity.pools')} description={t('liquidity.pools_desc') || ''} />
              <TVLInfoPanel tvl={tvl} volume={volume} />
            </HStack>
          </Desktop>
        </Box>

        <Mobile>
          <Box {...titleContainerProps} mb={0.5} flexShrink={0} marginX={revertAppLayoutPaddingX}>
            <Mobile>
              <TVLInfoPanelMobile tvl={tvl} volume={volume} />
            </Mobile>
          </Box>
        </Mobile>

        {/* Controller Part */}
        <Box marginX={revertAppLayoutPaddingX} mb={[0, 3]}>
          <Grid
            columnGap={3}
            rowGap={[1, 0]}
            py={2}
            gridTemplate={[
              `
              "tabs more btn" auto 
              "coll coll  coll" auto 
              "search search search" auto / auto auto 1fr
            `,
              `
              "tabs tabs  tabs" auto
              "search more btn" auto 
              "coll  coll  coll" auto / auto  auto 1fr
            `,
              `
              "tabs search more btn" auto 
              "coll coll coll  coll" auto / auto auto auto 1fr
            `
            ]}
            paddingX={appLayoutPaddingX}
            backgroundColor={['transparent', colors.backgroundLight30]}
          >
            <GridItem area={'tabs'}>
              <Desktop>
                <Tabs
                  items={tabItems}
                  size={['sm', 'xl']}
                  tabItemSX={{ px: '4px !important' }}
                  value={activeTabItem.value}
                  onChange={onPoolValueChange}
                  variant="line"
                />
              </Desktop>
              <Mobile>
                <Select
                  sx={({ isPanelOpen }) => ({
                    borderRadius: 'full',
                    height: '34px',
                    minWidth: '102px',
                    border: '1px solid transparent',
                    borderColor: isPanelOpen ? 'currentcolor' : 'transparent'
                  })}
                  popoverContentSx={{
                    bg: colors.tooltipBg
                  }}
                  value={activeTabItem.value}
                  items={tabItems}
                  onChange={(value) => onPoolValueChange(value)}
                />
              </Mobile>
            </GridItem>

            <GridItem area={'search'}>
              <TokenSearchInput
                width={['unset', '26em']}
                value={searchText}
                onChange={setSearchText}
                selectedListValue={searchTokens}
                onSelectedListChange={setSearchTokens}
                hideAutoComplete={!!searchIdData}
              />
            </GridItem>

            <GridItem area={'more'}>
              <Button onClick={toggleSubcontrollers} variant="capsule" height={['34px', '40px']} isActive={isCollapseOpen}>
                <MoreListControllers color={colors.textSecondary} width={listControllerIconSize} height={listControllerIconSize} />
              </Button>
            </GridItem>

            <GridItem area={'btn'} justifySelf={'end'}>
              {/* Action Buttons create pool */}
              <CreatePoolButton />
            </GridItem>

            <GridItem area={'coll'}>
              <Collapse in={isCollapseOpen}>
                <Box pt={[0.5, 4]} pb={[3, 2]}>
                  <Stack
                    direction={['column', 'row']}
                    alignItems={['start', 'center']}
                    spacing={[4, 10]}
                    bg={[colors.tooltipBg, 'transparent']}
                    borderRadius="12px"
                    py={['16px', '0px']}
                    px={['30px', '0px']}
                  >
                    {/* Widgets */}
                    <Box>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel minW={['120px', 'unset']}>{t('common.layout')}</FormLabel>
                        <Tabs
                          items={[
                            { value: 'list', label: <ListIcon key={`list-icon`} /> },
                            { value: 'grid', label: <GridIcon key={`grid-icon`} /> }
                          ]}
                          value={currentLayoutStyle}
                          variant="roundedPlain"
                          size="sm"
                          onChange={setCurrentLayoutStyle}
                        />
                      </FormControl>
                    </Box>

                    <Box>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel minW={['120px', 'unset']}>{t('common.time_base')}</FormLabel>
                        <Tabs
                          variant="roundedPlain"
                          items={Object.keys(FILED_KEY).map((key) => ({
                            value: key as TimeBase,
                            label: (key as TimeBase).toLocaleUpperCase()
                          }))}
                          value={timeBase}
                          onChange={setTimeBase}
                          tabListSX={{ height: '24px' }}
                        />
                      </FormControl>
                    </Box>

                    <Flex alignItems="center">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel minW={['120px', 'unset']}>{t('liquidity.show_farms')}</FormLabel>
                        <Switch defaultChecked={showFarms} onChange={handleSwitchFarmChange} />
                      </FormControl>
                    </Flex>

                    {currentLayoutStyle === 'grid' ? (
                      <Flex alignItems="center">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel minW={['120px', 'unset']}>{t('common.sort_by')}</FormLabel>
                          <Select
                            sx={({ isPanelOpen }) => ({
                              height: '34px',
                              minWidth: '80px',
                              border: '1px solid transparent',
                              borderColor: isPanelOpen ? 'currentcolor' : 'transparent',
                              fontSize: '14px'
                            })}
                            popoverContentSx={{
                              bg: colors.tooltipBg
                            }}
                            value={sortKey === 'default' ? 'default' : `${sortKey}_${order ? 'desc' : 'asc'}`}
                            items={SORT_ITEMS}
                            onChange={(value) => {
                              const [key, order] = value.split('_')
                              onChangeSortData(key)
                              setOrder(order === 'desc' ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </Flex>
                    ) : null}
                  </Stack>
                </Box>
              </Collapse>
            </GridItem>
          </Grid>
        </Box>

        {/* List Header */}
        {currentLayoutStyle === 'list' && (
          <PoolListHeader order={order} timeBase={timeBase} sortKey={sortKey} handleClickSort={handleClickSort} />
        )}

        {/* List Content */}
        {isNotFound ? (
          <Box flexGrow="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <NotFound />
            <Text mt="4" fontSize="sm" color={colors.textSecondary}>
              {t('error.no_pools_found')}
            </Text>
          </Box>
        ) : (
          <>
            {isLoading ? (
              <PoolItemLoadingSkeleton isGrid={currentLayoutStyle === 'grid'} />
            ) : (
              <List
                controllerRef={listControllerRef}
                {...scrollBodyProps}
                increaseRenderCount={showFarms ? 100 : 50}
                initRenderCount={30}
                reachBottomMargin={showFarms ? 200 : 150}
                preventResetOnChange={search === prevSearch}
                gridSlotCount={currentLayoutStyle === 'grid' && isMobile ? 1 : undefined}
                gridSlotItemMinWidth={currentLayoutStyle === 'grid' ? gridCardSize : undefined}
                haveLoadAll={isLoadEnded}
                onLoadMore={loadMore}
                items={sortedData}
                getItemKey={(item) => item.id}
                gap={currentLayoutStyle === 'grid' ? gridCardGap : undefined}
                zIndex={1}
              >
                {renderPoolListItem}
              </List>
            )}
          </>
        )}

        {/* Pool list item modal chart Modal */}
        <Desktop>
          <PoolChartModal
            renderModalHeader={
              <Flex alignItems="center" gap={1}>
                <TokenAvatarPair token1={chartPoolInfo?.mintA} token2={chartPoolInfo?.mintB} />
                <Text>
                  {chartPoolInfo?.mintA.symbol} / {chartPoolInfo?.mintB.symbol}
                </Text>
                <Tag size={'sm'} variant="rounded">
                  {formatToRawLocaleStr(toPercentString(chartPoolInfo?.feeRate, { alreadyPercented: false }))}
                </Tag>
                {chartPoolInfo?.isOpenBook ? (
                  <Tag size={'sm'} variant="rounded">
                    <OpenBookIcon />
                  </Tag>
                ) : null}
              </Flex>
            }
            poolAddress={chartPoolInfo?.id}
            baseMint={chartPoolInfo?.mintA.address}
            categories={[
              { label: t('liquidity_pools.chart_tab_volume'), value: 'volume' },
              { label: t('liquidity_pools.chart_tab_liquidity'), value: 'liquidity' }
            ]}
            isOpen={isChartOpen}
            onClose={closeChart}
          />
        </Desktop>
      </Flex>
    </>
  )
}
