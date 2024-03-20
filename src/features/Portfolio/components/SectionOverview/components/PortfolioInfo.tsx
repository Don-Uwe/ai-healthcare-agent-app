import { Box, Flex, Grid, GridItem, HStack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import SolWallet from '@/components/SolWallet'
import Tabs from '@/components/Tabs'
import { useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import { isArray } from '@/utils/judges/judgeType'

import { AssetType } from '../'

import { Select, SelectorItem } from '@/components/Select'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import PortfolioPieChart, { PORTFOLIO_PIE_COLORS } from './PortfolioPieChart'
import Decimal from 'decimal.js'
import { panelCard } from '@/theme/cssBlocks'
import toPercentString from '@/utils/numberish/toPercentString'

export type AssetsType = {
  key: string
  value: number | string
  type?: AssetType
  percentage: number
}

const isPoolAssets = (assets: AssetsType[]): assets is AssetsType[] =>
  assets && isArray(assets) && assets.length > 0 && Object.keys(assets[0]).some((key) => key === 'type')

type AssetsCategoryType = {
  value: 'Assets by pool' | 'Assets by token'
  label: string
}

export default function PortfolioInfo({ poolAssets, tokenAssets }: { poolAssets?: AssetsType[]; tokenAssets?: AssetsType[] }) {
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
      flex={4}
      minW="350px"
      scrollSnapAlign={'start'}
      scrollMargin={5}
      onClick={({ currentTarget }) => {
        if (isMobile) {
          currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }}
    >
      <Tabs isFitted items={assetsCategoryOptions} value={tab} size="md" variant="folder" onChange={setTab} />

      <Flex flexWrap="wrap" py="30px" px={['20px', '30px']} flexGrow="inherit" bg={colors.backgroundLight}>
        {connected ? (
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
            columnGap={6}
            rowGap={[1, 4]}
          >
            <GridItem area={'pie'}>
              <PortfolioPieChart data={currentAsset.list} valueDataKey="percentage" />
            </GridItem>

            <GridItem area={'total'} justifySelf={['center', 'unset']}>
              <AssetsTotal total={currentAsset.summary.toString()} />
            </GridItem>

            {tab !== 'Assets by token' ? (
              <GridItem area={'tab'} alignSelf={'center'}>
                <AssetsTab
                  current={currentType}
                  items={[
                    { value: AssetType.STANDARD, label: t('portfolio.section_department_tab_standard') },
                    { value: AssetType.CONCENTRATED, label: t('portfolio.section_department_tab_clmm') },
                    { value: AssetType.ALL, label: t('portfolio.section_department_tab_all') }
                  ]}
                  onChange={(t) => onTypeChange(t as AssetType)}
                />
              </GridItem>
            ) : null}

            <GridItem area={'list'}>
              <PortfolioAssetList assetList={currentAsset.list} />
            </GridItem>
          </Grid>
        ) : (
          <Flex direction="column" justify={'space-around'} align="center" flex={1} py={8}>
            <Text color={colors.textTertiary}>{t('wallet.connected_hint.portfolio_info')}</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
function AssetsTotal(props: { total: string | number }) {
  return (
    <Text fontSize={['20px', '28px']} fontWeight="medium">
      {toUsdVolume(props.total)}
    </Text>
  )
}

function AssetsTab(props: { current: string; items: SelectorItem[]; onChange?: (newTab: string) => void }) {
  return <Select variant="filledFlowDark" items={props.items} value={props.current} onChange={(t) => props.onChange?.(t)} />
}

type PortfolioAssetListProps = {
  assetList: AssetsType[]
}

function PortfolioAssetList({ assetList }: PortfolioAssetListProps) {
  return (
    <Flex direction="column" flex={2}>
      {assetList.map((asset, idx) => (
        <HStack fontSize="14px" justifyContent={'flex-end'} alignItems="center" key={`asset-list-key-${idx}`} py={0.5}>
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
              <Text color={colors.textSecondary}>{asset.key}</Text>
            </Flex>
            <Box>
              <Text textAlign="right">{toUsdVolume(asset.value, { decimals: 2 })}</Text>
            </Box>
          </Flex>

          <Text textAlign="right" width="90px" minW="52px">
            {toPercentString(asset.percentage)}
          </Text>
        </HStack>
      ))}
    </Flex>
  )
}
