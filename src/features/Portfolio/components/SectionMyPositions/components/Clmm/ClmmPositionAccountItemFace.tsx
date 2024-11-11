import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import Close from '@/icons/misc/Close'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { toAPRPercent } from '@/features/Pools/util'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { AprKey } from '@/hooks/pool/type'
import { getPositionAprCore } from '@/features/Clmm/utils/calApr'
import { Badge, Button, Divider, Flex, HStack, Text, Tooltip, useDisclosure } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import BN from 'bn.js'
import { useEvent } from '@/hooks/useEvent'
import LockIcon from '@/icons/misc/LockIcon'

export default function ClmmPositionAccountItemFace({
  isViewOpen,
  isLock,
  poolInfo,
  poolLiquidity,
  tokenPrices,
  position,
  baseIn,
  hasReward,
  onHarvest,
  onClickCloseButton,
  onClickMinusButton,
  onClickPlusButton,
  onClickViewTrigger
}: {
  isViewOpen: boolean
  isLock: boolean
  poolInfo: FormattedPoolInfoConcentratedItem
  poolLiquidity?: BN
  tokenPrices: Record<string, TokenPrice>
  position: ClmmPosition
  baseIn: boolean
  hasReward: boolean
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
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
  const aprMode = useAppStore((s) => s.aprMode)

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

  const isFullRange =
    position.tickLower === parseInt((-443636 / poolInfo.config.tickSpacing).toString()) * poolInfo.config.tickSpacing &&
    position.tickUpper === parseInt((443636 / poolInfo.config.tickSpacing).toString()) * poolInfo.config.tickSpacing

  const rangeValue = isFullRange
    ? t('clmm.full_range')
    : baseIn
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
    planType: aprMode,
    chainTimeOffsetMs: chainTimeOffset
  })
  return (
    <>
      <Desktop>
        <Flex
          bg={isViewOpen ? colors.background01 : colors.backgroundDark}
          borderRadius="xl"
          borderBottomRadius={isViewOpen ? 'none' : 'xl'}
          justifyContent="space-between"
          py={[2, 3]}
          px={[3, 5]}
          gap={[2, 4]}
          cursor="pointer"
          onClick={onClickViewTrigger}
          border={isViewOpen ? `1px solid ${colors.cardBorder01}` : '1px solid transparent'}
          borderBottomColor="transparent"
          _hover={{
            border: `1px solid ${colors.cardBorder01}`,
            bg: colors.background01,
            borderBottomColor: isViewOpen ? 'transparent' : colors.cardBorder01
          }}
          direction={['column', 'row']}
        >
          <Flex align="center" flex="1.5" gap={3}>
            <Text fontWeight="medium" whiteSpace={'nowrap'}>
              {rangeValue}
            </Text>
            {isFullRange ? null : (
              <Text color={colors.lightPurple} whiteSpace={'nowrap'}>
                {rangeValueUnit}
              </Text>
            )}
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
              <Text whiteSpace={'nowrap'} display={'flex'} gap="1" alignItems={'center'} color={colors.textPrimary}>
                {formatCurrency(totalVolume.toString(), { symbol: '$', decimalPlaces: 2 })}
                {isLock ? <LockIcon /> : null}
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
                {formatToRawLocaleStr(toAPRPercent(apr.apr))}
              </Text>
              <AprMDSwitchWidget color={colors.textSecondary} />
            </HStack>
            <HStack>
              {isLock ? (
                <Button
                  isLoading={isLoading}
                  isDisabled={!hasReward}
                  onClick={(e) => {
                    e.stopPropagation()
                    onHarvest({})
                  }}
                  size="sm"
                  fontSize="md"
                  variant="outline"
                >
                  {t('portfolio.section_positions_clmm_account_pending_yield_button')}
                </Button>
              ) : (
                <>
                  {position.liquidity.isZero() ? (
                    <CloseButton isLoading={isLoading} onClick={handleClickClose} />
                  ) : (
                    <MinusButton isLoading={false} onClick={onClickMinusButton} />
                  )}
                  <PlusButton isLoading={false} onClick={onClickPlusButton} />
                </>
              )}

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
        <Flex
          borderRadius="md"
          justifyContent="space-between"
          p={3}
          alignItems={'center'}
          bg={colors.backgroundDark}
          onClick={onClickViewTrigger}
        >
          <Text fontSize="sm" fontWeight="500">
            {rangeValue}
          </Text>
          <Flex justifyContent="space-between" alignItems="center">
            <Badge variant={inRange ? 'ok' : 'error'}>{inRange ? t('clmm.in_range') : t('clmm.out_of_range')}</Badge>
            <ChevronRightIcon color={colors.secondary} />
          </Flex>
        </Flex>
      </Mobile>
    </>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
      isLoading={props.isLoading}
      variant="outline"
      size="xs"
      width={9}
      h="26px"
      px={0}
    >
      <MinusIcon color={colors.secondary} />
    </Button>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
      isLoading={props.isLoading}
      size="xs"
      w={9}
      h="26px"
      px={0}
    >
      <PlusIcon color={colors.buttonSolidText} />
    </Button>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  const { t } = useTranslation()
  return (
    <Tooltip label={t('clmm.close_position')}>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          props.onClick()
        }}
        isLoading={props.isLoading}
        variant="outline"
        size="xs"
        width={9}
        h="26px"
        px={0}
      >
        <Close width={10} height={10} color={colors.secondary} />
      </Button>
    </Tooltip>
  )
}
