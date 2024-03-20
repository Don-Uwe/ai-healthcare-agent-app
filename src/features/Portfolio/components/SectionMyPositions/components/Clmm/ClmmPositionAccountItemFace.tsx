import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import Close from '@/icons/misc/Close'
import FullExpandIcon from '@/icons/misc/FullExpandIcon'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { AprKey } from '@/hooks/pool/type'
import { getPositionAprCore } from '@/features/Clmm/utils/calApr'
import { Badge, Button, Divider, Flex, Grid, GridItem, HStack, SimpleGrid, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import BN from 'bn.js'
import { useEvent } from '@/hooks/useEvent'

export default function ClmmPositionAccountItemFace({
  poolInfo,
  poolLiquidity,
  tokenPrices,
  position,
  baseIn,
  onClickCloseButton,
  onClickMinusButton,
  onClickPlusButton,
  onClickViewTrigger
}: {
  poolInfo: FormattedPoolInfoConcentratedItem
  poolLiquidity?: BN
  tokenPrices: Record<string, TokenPrice>
  position: ClmmPosition
  baseIn: boolean
  onClickCloseButton: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickMinusButton: () => void
  onClickPlusButton: () => void
  onClickViewTrigger: () => void
}) {
  const { t } = useTranslation()
  const { getPriceAndAmount } = useClmmBalance({})
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const isMobile = useAppStore((s) => s.isMobile)
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)

  const handleClickClose = useEvent(() => {
    onClickCloseButton({
      onSend,
      onFinally
    })
  })

  const { priceLower, priceUpper, amountA, amountB } = getPriceAndAmount({ poolInfo, position })
  const totalVolume = amountA
    .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
    .add(amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0))

  const decimals = Math.max(poolInfo.mintA.decimals, poolInfo.mintB.decimals)
  const inRange = priceLower.price.lt(poolInfo.price) && priceUpper.price.gt(poolInfo.price)
  const rangeValue = baseIn
    ? `${priceLower.price.toFixed(decimals)} - ${priceUpper.price.toFixed(decimals)}`
    : `${new Decimal(1).div(priceUpper.price).toFixed(decimals)} - ${new Decimal(1).div(priceLower.price).toFixed(decimals)}`
  const rangeValueUnit = t(isMobile ? 'common.per_unit_2' : 'common.per_unit', {
    subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
    subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
  })

  const apr = getPositionAprCore({
    poolInfo,
    positionAccount: position,
    poolLiquidity: poolLiquidity || new BN(0),
    tokenPrices,
    timeBasis: AprKey.Day,
    planType: 'D',
    chainTimeOffsetMs: chainTimeOffset
  })
  return (
    <>
      <Desktop>
        <Flex
          bg={colors.backgroundDark}
          borderRadius="xl"
          flexWrap="wrap"
          justifyContent="space-between"
          py={[2, 3]}
          px={[3, 6]}
          gap={[2, 4]}
        >
          <Grid
            width={'full'}
            gridAutoFlow={['column', 'row']}
            gridTemplate={[
              `
              "title  title" auto 
              "info   btns " auto / 4fr 3fr
            `,
              `
              "title  title" auto 
              "info   btns " auto / 4fr 3fr
            `,
              `
              "title  info  btns" auto / minmax(0, 6fr) 5fr 4fr
            `
            ]}
            alignItems={'center'}
            gap={3}
          >
            <GridItem gridArea={'title'}>
              <HStack flexBasis="500px">
                <Text fontWeight="500" whiteSpace={'nowrap'}>
                  {rangeValue}
                </Text>
                <Text color={colors.textTertiary} whiteSpace={'nowrap'}>
                  {rangeValueUnit}
                </Text>
                <Badge mr={['auto', 'unset']} variant={inRange ? 'ok' : 'error'}>
                  {inRange ? t('clmm.in_range') : t('clmm.out_of_range')}
                </Badge>
              </HStack>
            </GridItem>

            <GridItem gridArea={'info'}>
              <SimpleGrid templateColumns={'minmax(0, 1fr) minmax(0, 1fr)'} gap={'3vw'}>
                <HStack>
                  <Text whiteSpace={'nowrap'} color={colors.textSecondary}>
                    {t('clmm.position')}
                  </Text>
                  <Text whiteSpace={'nowrap'} color={colors.textPrimary}>
                    {toUsdVolume(totalVolume.toString())}
                  </Text>
                </HStack>

                <HStack>
                  <Text whiteSpace={'nowrap'} color={colors.textSecondary}>
                    {t('field.apr')}
                  </Text>
                  <Text whiteSpace={'nowrap'} color={colors.textPrimary}>
                    {toPercentString(apr.apr)}
                  </Text>
                  <AprMDSwitchWidget color={colors.textSecondary} />
                </HStack>
              </SimpleGrid>
            </GridItem>

            <GridItem gridArea={'btns'} justifySelf={'end'}>
              <HStack>
                <ViewButton onClick={onClickViewTrigger} />
                {position.liquidity.isZero() ? (
                  <CloseButton isLoading={isLoading} onClick={handleClickClose} />
                ) : (
                  <MinusButton isLoading={false} onClick={onClickMinusButton} />
                )}
                <PlusButton isLoading={false} onClick={onClickPlusButton} />
              </HStack>
            </GridItem>
          </Grid>
        </Flex>
      </Desktop>
      <Mobile>
        <Flex borderRadius="xl" overflow={'hidden'} flexWrap="wrap" justifyContent="space-between">
          <Grid
            width={'full'}
            gridAutoFlow={['column', 'row']}
            gridTemplate={`
            "title" auto 
            "body" auto / 1fr`}
            alignItems={'center'}
          >
            <GridItem gridArea={'title'}>
              <HStack flexBasis="500px" flexWrap={['wrap', 'nowrap']} bg={colors.backgroundTransparent07} py={2} px={3}>
                <Text fontSize="sm" fontWeight="500" whiteSpace={'nowrap'}>
                  {rangeValue}
                </Text>
                <Text fontSize="sm" color={colors.textTertiary} whiteSpace={'nowrap'}>
                  {rangeValueUnit}
                </Text>
                <Badge variant={inRange ? 'ok' : 'error'}>{inRange ? t('clmm.in_range') : t('clmm.out_of_range')}</Badge>
              </HStack>
            </GridItem>

            <GridItem gridArea={'body'}>
              <Grid
                gridTemplate={`
                  "info .   " auto 
                  "apr  btns" auto 
                  "vbtn vbtn" auto / 1fr`}
                bg={colors.backgroundDark}
                py={3}
                px={3}
                gap={1}
                alignItems={'center'}
              >
                <GridItem gridArea={'info'} justifySelf={['unset', 'center']}>
                  <HStack>
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t('clmm.position')}
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                      {toUsdVolume(totalVolume.toString())}
                    </Text>
                  </HStack>
                </GridItem>

                <GridItem gridArea={'apr'} justifySelf={['unset', 'center']}>
                  <HStack>
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t('field.apr')}
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                      {toPercentString(apr.apr)}
                    </Text>
                    <AprMDSwitchWidget color={colors.textSecondary} />
                  </HStack>
                </GridItem>

                <GridItem gridArea={'btns'} justifySelf="flex-end">
                  <HStack>
                    <MinusButton isLoading={false} onClick={onClickMinusButton} />
                    <PlusButton isLoading={false} onClick={onClickPlusButton} />
                  </HStack>
                </GridItem>

                <GridItem gridArea={'vbtn'} justifySelf="center">
                  <ViewButton onClick={onClickViewTrigger} />
                </GridItem>
              </Grid>
            </GridItem>
          </Grid>
        </Flex>
      </Mobile>
    </>
  )
}

function ViewButton(props: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button leftIcon={<FullExpandIcon />} variant="ghost" size="sm" onClick={props.onClick}>
      {t('portfolio.section_positions_clmm_account_view_more')}
    </Button>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button onClick={props.onClick} isLoading={props.isLoading} variant="outline" size="xs" width={9} h="26px" px={0}>
      <MinusIcon color={colors.secondary} />
    </Button>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button onClick={props.onClick} isLoading={props.isLoading} size="xs" w={9} h="26px" px={0}>
      <PlusIcon color={colors.buttonSolidText} />
    </Button>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  const { t } = useTranslation()
  return (
    <Tooltip label={t('clmm.close_position')}>
      <Button onClick={props.onClick} isLoading={props.isLoading} variant="outline" size="xs" width={9} h="26px" px={0}>
        <Close width={10} height={10} color={colors.secondary} />
      </Button>
    </Tooltip>
  )
}
