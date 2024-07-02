import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import Close from '@/icons/misc/Close'
import FullExpandIcon from '@/icons/misc/FullExpandIcon'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { AprKey } from '@/hooks/pool/type'
import { getPositionAprCore } from '@/features/Clmm/utils/calApr'
import { Badge, Button, Divider, Flex, Grid, GridItem, HStack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import BN from 'bn.js'
import { useEvent } from '@/hooks/useEvent'

export default function ClmmPositionAccountItemFace({
  isViewOpen,
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
  isViewOpen: boolean
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

  const inRange = priceLower.price.lt(poolInfo.price) && priceUpper.price.gt(poolInfo.price)
  const rangeValue = baseIn
    ? `${formatCurrency(priceLower.price, {
        decimalPlaces: 6
      })} - ${formatCurrency(priceUpper.price, {
        decimalPlaces: 6
      })}`
    : `${formatCurrency(new Decimal(1).div(priceUpper.price), {
        decimalPlaces: 6
      })} - ${formatCurrency(new Decimal(1).div(priceLower.price), {
        decimalPlaces: 6
      })}`

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
          borderBottomRadius={isViewOpen ? 'none' : 'xl'}
          justifyContent="space-between"
          py={[2, 3]}
          px={[3, 6]}
          gap={[2, 4, 8]}
          cursor="pointer"
          onClick={onClickViewTrigger}
          border="1px solid transparent"
          _hover={{
            border: `1px solid ${colors.infoButtonBg}`
          }}
          direction={['column', 'column', 'row']}
        >
          <Flex align="center" flex="1.5" gap={3}>
            <Text fontWeight="medium" whiteSpace={'nowrap'}>
              {rangeValue}
            </Text>
            <Text color={colors.lightPurple} whiteSpace={'nowrap'}>
              {rangeValueUnit}
            </Text>
            <Badge mr={['auto', 'unset']} variant={inRange ? 'ok' : 'error'}>
              {inRange ? t('clmm.in_range') : t('clmm.out_of_range')}
            </Badge>
          </Flex>
          <Divider
            display={['none', 'none', 'block']}
            borderWidth="1px"
            h={6}
            borderColor={colors.lightPurple}
            opacity="0.5"
            orientation="vertical"
          />
          <Flex flex="1" align="center" justify="space-between">
            <HStack>
              <Text whiteSpace={'nowrap'} color={colors.lightPurple}>
                {t('clmm.position')}
              </Text>
              <Text whiteSpace={'nowrap'} color={colors.textPrimary}>
                {formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
              </Text>
            </HStack>
          </Flex>
          <Divider
            display={['none', 'none', 'block']}
            borderWidth="1px"
            h={6}
            borderColor={colors.lightPurple}
            opacity="0.5"
            orientation="vertical"
          />
          <Flex flex="1" align="center" justify="space-between">
            <HStack gap={2}>
              <Text whiteSpace={'nowrap'} color={colors.lightPurple}>
                {t('field.apr')}
              </Text>
              <Text whiteSpace={'nowrap'} color={colors.textPrimary}>
                {formatToRawLocaleStr(toPercentString(apr.apr))}
              </Text>
              <AprMDSwitchWidget color={colors.textSecondary} />
            </HStack>
            <HStack>
              {position.liquidity.isZero() ? (
                <CloseButton isLoading={isLoading} onClick={handleClickClose} />
              ) : (
                <MinusButton isLoading={false} onClick={onClickMinusButton} />
              )}
              <PlusButton isLoading={false} onClick={onClickPlusButton} />
              {isViewOpen ? (
                <ChevronUpIcon className="up" width={24} height={24} color={colors.textSecondary} />
              ) : (
                <ChevronDownIcon className="down" width={24} height={24} color={colors.textSecondary} />
              )}
            </HStack>
          </Flex>
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
                <Text fontSize="sm" color={colors.lightPurple} whiteSpace={'nowrap'}>
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
                      {formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
                    </Text>
                  </HStack>
                </GridItem>

                <GridItem gridArea={'apr'} justifySelf={['unset', 'center']}>
                  <HStack>
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t('field.apr')}
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                      {formatToRawLocaleStr(toPercentString(apr.apr))}
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
