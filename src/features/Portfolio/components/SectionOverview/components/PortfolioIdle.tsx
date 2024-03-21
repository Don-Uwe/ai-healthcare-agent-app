import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import { useAppStore } from '@/store/useAppStore'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { routeToPage } from '@/utils/routeTools'
import { Box, Flex, Grid, GridItem, SimpleGrid, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import PortfolioPieChart, { IDLE_TOKENS_COLORS } from './PortfolioPieChart'

export type IdleType = {
  token: ApiV3Token | undefined
  address: string
  amount: string
  amountInUSD: string
}

type PortfolioIdleProps = {
  idleBalance?: number | string
  productiveBalance?: number | string
  idleList?: IdleType[]
}

export default function PortfolioIdle({ idleBalance, productiveBalance, idleList }: PortfolioIdleProps) {
  const { t } = useTranslation()
  const connected = useAppStore((s) => s.connected)
  const isMobile = useAppStore((s) => s.isMobile)
  const idlePercent = useMemo(() => {
    if (idleBalance === undefined || productiveBalance === undefined) return 0
    return new Decimal(idleBalance).div(new Decimal(productiveBalance).add(idleBalance)).mul(100).toDecimalPlaces(2).toNumber()
  }, [idleBalance, productiveBalance])

  return (
    <Flex
      {...panelCard}
      direction="column"
      overflow="hidden"
      flex={5}
      minW="350px"
      borderRadius={'20px'}
      scrollSnapAlign={'end'}
      scrollMargin={5}
      onClick={({ currentTarget }) => {
        if (isMobile) {
          currentTarget.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      <Box bg={colors.backgroundMedium} fontWeight="medium" h="48px" pl="24px" py="13px">
        {t('portfolio.idle_tokens')}
      </Box>

      <Flex flexWrap="wrap" flexGrow={1} bg={colors.backgroundLight} py="30px" px={['20px', '30px']}>
        {connected ? (
          <Grid
            flexGrow={1}
            gridTemplate={[
              `
              "pie   pie  " 2fr
              "total total" 1fr
              "list  list " 1fr / 1fr .4fr
            `,
              `
              "pie total" auto
              "pie list " auto / minmax(100px, 1fr) 2fr
            `
            ]}
            maxHeight={'40vh'}
            columnGap={6}
            rowGap={[1, 4]}
          >
            <GridItem area={'pie'} w="full" placeSelf={'center'}>
              <PortfolioPieChart
                data={[{ value: 100 - idlePercent }, { value: idlePercent }]}
                valueDataKey="value"
                palette={IDLE_TOKENS_COLORS}
                roundCenterLabel={idlePercent + '%'}
              />
            </GridItem>

            <GridItem area={'total'} justifySelf={['center', 'unset']}>
              <Text fontSize={['20px', '28px']} fontWeight="medium">
                {toUsdVolume(idleBalance)}
              </Text>
            </GridItem>

            <GridItem area={'list'}>
              <AssetsList idleList={idleList} />
            </GridItem>
          </Grid>
        ) : (
          <Flex direction="column" justify={'space-around'} align="center" flex={1} py={8}>
            <Text color={colors.textTertiary}>{t('wallet.connected_hint.portfolio_idle')}</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

function AssetsList(props: { idleList?: IdleType[] }) {
  const { t } = useTranslation()
  return (
    <SimpleGrid rowGap={[4, '18px']}>
      {props.idleList?.map((idle) => (
        <Grid
          key={idle.token?.name}
          fontSize={['sm', 'md']}
          gridTemplate={[
            `
              "avatar symbol i1 i2 btn" auto / auto 1fr 1.3fr 1.3fr 1.5fr
              `,
            `
            "avatar symbol btn" auto
            "i1 i2 btn" auto / 1fr 1fr 1fr
          `,
            `
            "avatar symbol i1 i2 btn" auto / auto 1fr 1.3fr 1.3fr 1.5fr
          `
          ]}
          alignItems={'center'}
          columnGap={2}
        >
          <GridItem area={'avatar'}>
            <TokenAvatar size="smi" token={idle.token} />
          </GridItem>
          <GridItem area={'symbol'}>
            <Text fontWeight="medium">{idle.token?.symbol}</Text>
          </GridItem>
          <GridItem area={'i1'}>
            <Text color={colors.textSecondary}>{formatLocaleStr(idle.amount, 2)}</Text>
          </GridItem>
          <GridItem area={'i2'}>
            <Text color={colors.textSecondary}>{toUsdVolume(idle.amountInUSD)}</Text>
          </GridItem>
          <GridItem area={'btn'} justifySelf={'end'}>
            {idle.token?.address ? (
              <Button
                size={'xs'}
                variant="outline"
                borderRadius="4px"
                py={[2, 3]}
                pr={1}
                pl={2}
                minWidth="none"
                onClick={() => routeToPage('pools', { queryProps: { token: idle.token!.address } })}
              >
                {t('common.pools')}
                <Box width={[3, 4]} height={[3, 4]} ml={[0.5, 1]}>
                  <ChevronRightIcon width={'100%'} height={'100%'} />
                </Box>
              </Button>
            ) : null}
          </GridItem>
        </Grid>
      ))}
    </SimpleGrid>
  )
}
