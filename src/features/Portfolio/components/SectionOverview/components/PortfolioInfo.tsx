import { Box, Flex, Grid, GridItem, HStack, Text, useDisclosure } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import { isArray } from '@/utils/judges/judgeType'
import { Select } from '@/components/Select'
import Tabs from '@/components/Tabs'
import PortfolioPieChart, { PORTFOLIO_PIE_COLORS } from './PortfolioPieChart'
import { panelCard } from '@/theme/cssBlocks'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { AssetType } from '../'
import { Desktop, Mobile } from '@/components/MobileDesktop'

export type AssetsType = {
  key: string
  value: number | string
  type?: AssetType
  percentage: number
}

type AssetsCategoryType = {
  value: 'Assets by pool' | 'Assets by token'
  label: string
}

const isPoolAssets = (assets: AssetsType[]): assets is AssetsType[] =>
  assets && isArray(assets) && assets.length > 0 && Object.keys(assets[0]).some((key) => key === 'type')

export default function PortfolioInfo({
  poolAssets,
  mobileAssets,
  tokenAssets
}: {
  poolAssets?: AssetsType[]
  mobileAssets?: AssetsType[]
  tokenAssets?: AssetsType[]
}) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const assetsCategoryOptions: AssetsCategoryType[] = [
    {
      value: 'Assets by pool',
      label: t('portfolio.assets_by_pool')
    },
    {
      value: 'Assets by token',
      label: t('portfolio.assets_by_token')
    }
  ]
  const [tab, setTab] = useState<AssetsCategoryType['value']>(assetsCategoryOptions[0].value)
  const { isOpen: isMorePoolAssets, onOpen: onOpenMorePoolAssets, onClose: onCloseMorePoolAssets } = useDisclosure()
  const { isOpen: isMoreTokenAssets, onOpen: onOpenMoreTokenAssets, onClose: onCloseMoreTokenAssets } = useDisclosure()
  const [currentType, setCurrentType] = useState<AssetType>(AssetType.ALL)
  const connected = useAppStore((s) => s.connected)

  const tidyUpAssets = ([...assets]: AssetsType[]) => {
    const list: AssetsType[] = []
    const others: AssetsType = isPoolAssets(assets)
      ? { key: 'Others', value: 0, type: AssetType.ALL, percentage: 0 }
      : { key: 'Others', value: 0, percentage: 0 }
    let summary = new Decimal(0)
    assets
      .sort((a, b) => Number(b.value) - Number(a.value))
      .forEach((a) => {
        summary = summary.add(a.value)
      })
    for (let idx = 0; idx < assets.length; idx++) {
      if (idx < 4 || assets.length <= 5) {
        list.push({
          ...assets[idx],
          percentage: new Decimal(assets[idx].value).div(summary).mul(100).toNumber()
        })
      } else {
        others.value = new Decimal(others.value ?? 0).add(assets[idx].value ?? 0).toNumber()
        others.percentage += new Decimal(assets[idx].value).div(summary).mul(100).toDecimalPlaces(2).toNumber()
      }
    }

    others.value && list.push(others)

    return { summary: summary.toString(), list }
  }

  const parseTokenAssets = useMemo(() => {
    if (!tokenAssets) return { summary: '0', list: [] }
    return tidyUpAssets(tokenAssets)
  }, [tokenAssets])

  const parsePoolAssets = useMemo(() => {
    if (!poolAssets) return { summary: '0', list: [] }
    const filteredAssets = poolAssets.filter((asset) => asset.type === currentType || currentType === AssetType.ALL)
    return tidyUpAssets(filteredAssets)
  }, [poolAssets, currentType])

  const parseMobilePoolAssets = useMemo(() => {
    if (!mobileAssets) return { summary: '0', list: [] }
    const filteredAssets = mobileAssets.filter((asset) => asset.type === currentType || currentType === AssetType.ALL)
    return tidyUpAssets(filteredAssets)
  }, [mobileAssets, currentType])

  const onTypeChange = (value: AssetType) => {
    setCurrentType(value)
  }

  const currentAsset = tab === assetsCategoryOptions[0].value ? parsePoolAssets : parseTokenAssets

  return (
    <Flex
      {...panelCard}
      direction="column"
      bg={colors.backgroundMedium}
      borderRadius="20px"
      overflow="hidden"
      boxShadow="none"
      flex={4}
      minW="300px"
      scrollSnapAlign={'start'}
      scrollMargin={5}
      onClick={({ currentTarget }) => {
        if (isMobile) {
          currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }}
    >
      <Tabs
        isFitted
        items={assetsCategoryOptions}
        value={tab}
        size="md"
        variant="folder"
        onChange={setTab}
        tabItemSX={{ whiteSpace: 'normal' }}
        isLazy
      />

      <Flex flexWrap="wrap" p={[4, '30px']} pt={[8, '30px']} flexGrow="inherit" bg={colors.backgroundLight}>
        {connected ? (
          <>
            <Mobile>
              {tab !== 'Assets by token' ? (
                <Box width="100%">
                  {isMorePoolAssets && (
                    <Flex justifyContent="end">
                      <Select
                        variant="filledFlowDark"
                        sx={{ minWidth: '120px' }}
                        items={[
                          { value: AssetType.ALL, label: t('portfolio.section_department_tab_all') },
                          { value: AssetType.CONCENTRATED, label: t('portfolio.section_department_tab_clmm') },
                          { value: AssetType.STANDARD, label: t('portfolio.section_department_tab_standard') },
                          { value: AssetType.STAKEDRAY, label: t('portfolio.section_department_tab_staked_ray') }
                        ]}
                        value={currentType}
                        onChange={(t) => onTypeChange?.(t)}
                      />
                    </Flex>
                  )}
                  <Flex direction={isMorePoolAssets ? 'column' : 'row'} align={'center'}>
                    <Box width="50%" height={[isMorePoolAssets ? '80px' : '60px', '120px']}>
                      <PortfolioPieChart
                        data={!isMorePoolAssets ? parseMobilePoolAssets.list : parsePoolAssets.list}
                        valueDataKey="percentage"
                      />
                    </Box>
                    <Flex width={isMorePoolAssets ? '100%' : '50%'} gap={1} direction="column">
                      <Flex justifyContent={isMorePoolAssets ? 'center' : 'space-between'}>
                        <Text fontSize={['md', '2xl']} fontWeight="medium">
                          {formatCurrency(
                            !isMorePoolAssets ? parseMobilePoolAssets.summary.toString() : parsePoolAssets.summary.toString(),
                            {
                              symbol: '$',
                              decimalPlaces: 2
                            }
                          )}
                        </Text>
                      </Flex>
                      <PortfolioAssetList
                        assetList={!isMorePoolAssets ? parseMobilePoolAssets.list : parsePoolAssets.list}
                        isOpen={isMorePoolAssets}
                      />
                    </Flex>
                  </Flex>
                  <HStack
                    justifyContent="center"
                    mt={4}
                    color={colors.textLink}
                    onClick={isMorePoolAssets ? onCloseMorePoolAssets : onOpenMorePoolAssets}
                  >
                    <Text fontSize="sm">{isMorePoolAssets ? t('common.view_less') : t('common.view_more')}</Text>
                    {isMorePoolAssets ? <ChevronUpIcon width={10} height={10} /> : <ChevronDownIcon width={10} height={10} />}
                  </HStack>
                </Box>
              ) : (
                <Box width="100%">
                  <Flex direction={isMoreTokenAssets ? 'column' : 'row'} align="center">
                    <Flex width="100%" justifyContent="space-between" align="center">
                      <Box width="50%" height={[isMoreTokenAssets ? '80px' : '60px', '120px']}>
                        <PortfolioPieChart data={parseTokenAssets.list} valueDataKey="percentage" />
                      </Box>
                      {isMoreTokenAssets && (
                        <Text width="50%" fontSize={['md', '2xl']} fontWeight="medium">
                          {formatCurrency(parseTokenAssets.summary.toString(), { symbol: '$', decimalPlaces: 2 })}
                        </Text>
                      )}
                    </Flex>
                    <Flex width={isMoreTokenAssets ? '100%' : '50%'} gap={1} direction="column">
                      {!isMoreTokenAssets && (
                        <Flex justifyContent="space-between">
                          <Text fontSize={['md', '2xl']} fontWeight="medium">
                            {formatCurrency(parseTokenAssets.summary.toString(), { symbol: '$', decimalPlaces: 2 })}
                          </Text>
                        </Flex>
                      )}
                      <PortfolioAssetList
                        assetList={!isMoreTokenAssets ? parseTokenAssets.list.slice(0, 3) : parseTokenAssets.list}
                        isOpen={isMoreTokenAssets}
                      />
                    </Flex>
                  </Flex>
                  <HStack
                    justifyContent="center"
                    mt={4}
                    color={colors.textLink}
                    onClick={isMoreTokenAssets ? onCloseMoreTokenAssets : onOpenMoreTokenAssets}
                  >
                    <Text fontSize="sm">{isMoreTokenAssets ? t('common.view_less') : t('common.view_more')}</Text>
                    {isMoreTokenAssets ? <ChevronUpIcon width={10} height={10} /> : <ChevronDownIcon width={10} height={10} />}
                  </HStack>
                </Box>
              )}
            </Mobile>
            <Desktop>
              <Grid
                flexGrow={2}
                gridTemplate={[
                  `
              " .    tab  " auto
              "pie   pie  " 2fr
              "total total" 1fr
              "list  list " 1fr / 2fr 1fr
            `,
                  `
              "pie total tab  " auto
              "pie list  list " auto / minmax(100px, 1fr) 1.5fr 1.5fr
            `
                ]}
                alignItems={'center'}
                maxHeight={'40vh'}
                // minHeight={'200px'}
                columnGap={6}
                rowGap={[1, 4]}
              >
                <GridItem area={'pie'}>
                  <Box width="100%" height="120px">
                    <PortfolioPieChart data={currentAsset.list} valueDataKey="percentage" />
                  </Box>
                </GridItem>

                <GridItem area={'total'} justifySelf={['center', 'unset']}>
                  <Text fontSize={['20px', '28px']} fontWeight="medium">
                    {formatCurrency(currentAsset.summary.toString(), { symbol: '$', decimalPlaces: 2 })}
                  </Text>
                </GridItem>
                {tab !== 'Assets by token' ? (
                  <GridItem area={'tab'} alignSelf={'center'} justifySelf={'end'}>
                    <Select
                      variant="filledFlowDark"
                      sx={{ minWidth: '160px' }}
                      items={[
                        { value: AssetType.ALL, label: t('portfolio.section_department_tab_all') },
                        { value: AssetType.CONCENTRATED, label: t('portfolio.section_department_tab_clmm') },
                        { value: AssetType.STANDARD, label: t('portfolio.section_department_tab_standard') },
                        { value: AssetType.STAKEDRAY, label: t('portfolio.section_department_tab_staked_ray') }
                      ]}
                      value={currentType}
                      onChange={(t) => onTypeChange(t as AssetType)}
                    />
                  </GridItem>
                ) : null}

                <GridItem area={'list'}>
                  <PortfolioAssetList assetList={currentAsset.list} />
                </GridItem>
              </Grid>
            </Desktop>
          </>
        ) : (
          <Flex direction="column" justify={'space-around'} align="center" flex={1} py={8}>
            <Text textAlign="center" color={colors.textTertiary}>
              {t('wallet.connected_hint.portfolio_info')}
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

type PortfolioAssetListProps = {
  assetList: AssetsType[]
  isOpen?: boolean
}

function PortfolioAssetList({ assetList, isOpen = false }: PortfolioAssetListProps) {
  const isMobile = useAppStore((s) => s.isMobile)
  return (
    <Flex direction="column" flex={2} gap={[1, 0]}>
      {assetList.map((asset, idx) => (
        <HStack fontSize="sm" justifyContent={'flex-end'} alignItems="center" key={`asset-list-key-${idx}`} py={0.5}>
          <Flex w="full" justifyContent={'space-between'}>
            <Flex
              alignItems="center"
              sx={{
                '&:before': {
                  content: '""',
                  width: '10px',
                  height: '10px',
                  borderRadius: '10px',
                  backgroundColor: PORTFOLIO_PIE_COLORS[idx],
                  marginRight: '5px'
                }
              }}
            >
              <Text color={colors.lightPurple}>{asset.key}</Text>
            </Flex>
            {(!isMobile || isOpen) && <Text textAlign="right">{formatCurrency(asset.value, { symbol: '$', decimalPlaces: 2 })}</Text>}
          </Flex>
          <Text color={isMobile ? colors.lightPurple : colors.textPrimary} textAlign="right" width="90px" minW="52px">
            {formatToRawLocaleStr(toPercentString(asset.percentage))}
          </Text>
        </HStack>
      ))}
    </Flex>
  )
}
