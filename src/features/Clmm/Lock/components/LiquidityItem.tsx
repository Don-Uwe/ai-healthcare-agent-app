import { Box, Flex, HStack, Tag, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import CircleCheck from '@/icons/misc/CircleCheck'
import { formatToRawLocaleStr, formatCurrency } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { shortenAddress } from '@/utils/token'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { Desktop, Mobile } from '@/components/MobileDesktop'

export default function LiquidityItem({
  position,
  poolInfo,
  tokenPrices,
  isSelected = false,
  onClick
}: {
  position: ClmmPosition
  poolInfo: FormattedPoolInfoConcentratedItem
  tokenPrices: Record<string, TokenPrice>
  isSelected?: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  const { getPriceAndAmount } = useClmmBalance({})
  const { priceLower, priceUpper, amountA, amountB } = getPriceAndAmount({ poolInfo, position })
  const isFullRange =
    position.tickLower === parseInt((-443636 / poolInfo.config.tickSpacing).toString()) * poolInfo.config.tickSpacing &&
    position.tickUpper === parseInt((443636 / poolInfo.config.tickSpacing).toString()) * poolInfo.config.tickSpacing

  const rangeValue = isFullRange
    ? t('clmm.full_range')
    : `${formatCurrency(priceLower.price, { decimalPlaces: 6 })} - ${formatCurrency(priceUpper.price, { decimalPlaces: 6 })}`
  const rangeValueUnit = `${poolInfo.mintB.symbol} per ${poolInfo.mintA.symbol}`
  const totalVolume = amountA
    .mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
    .add(amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0))

  return (
    <Flex
      bg={colors.backgroundDark}
      justify="space-between"
      borderRadius="8px"
      border={isSelected ? `1px solid ${colors.secondary}` : `1px solid ${colors.dividerBg}`}
      py={3}
      px={4}
      gap={2}
      cursor="pointer"
      onClick={onClick}
    >
      <Flex align="start" gap={1}>
        <TokenAvatarPair size={['sm', 'smi']} token1={poolInfo.mintA} token2={poolInfo.mintB} />
        <Flex flexDirection="column" gap={1}>
          <HStack gap={1}>
            <Text fontSize={['md', '20px']} fontWeight="500" lineHeight="24px">
              {poolInfo.poolName.replace(' - ', '/')}
            </Text>
            <Tag size={['sm', 'md']} variant="rounded">
              {formatToRawLocaleStr(toPercentString(poolInfo.feeRate * 100))}
            </Tag>
          </HStack>
          <Text color={colors.lightPurple} fontSize={['sm', 'md']} lineHeight="16px">
            {rangeValue}
            {isFullRange ? null : (
              <Text as="span" opacity={0.5} pl={1} fontSize="xs" lineHeight="16px" color={colors.lightPurple}>
                {rangeValueUnit}
              </Text>
            )}
          </Text>
          <Mobile>
            <Flex flexDirection="column" color={colors.lightPurple} textAlign={['left', 'right']} wordBreak={'break-all'} gap={2}>
              <Text fontSize="md" lineHeight="20px">
                {t('clmm.position')}: {formatCurrency(totalVolume.toString(), { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
              </Text>
              <Text fontSize="xs" lineHeight="16px" opacity={0.5}>
                {`${t('liquidity.nft_mint')} ${shortenAddress(position.nftMint.toBase58(), 6)}`}
              </Text>
            </Flex>
          </Mobile>
        </Flex>
      </Flex>
      <Desktop>
        <HStack justify="space-between">
          <Flex flexDirection="column" color={colors.lightPurple} textAlign={['left', 'right']} wordBreak={'break-all'} gap={2}>
            <Text fontSize="md" lineHeight="20px">
              {t('clmm.position')}: {formatCurrency(totalVolume.toString(), { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
            </Text>
            <Text fontSize="xs" lineHeight="16px" opacity={0.5}>
              {`${t('liquidity.nft_mint')} ${shortenAddress(position.nftMint.toBase58(), 6)}`}
            </Text>
          </Flex>
          {isSelected ? <CircleCheck width={16} height={16} fill={colors.secondary} /> : <Box width="16px" height="16px" opacity="0" />}
        </HStack>
      </Desktop>
      <Mobile>
        <Flex alignItems="center">
          {isSelected ? <CircleCheck width={16} height={16} fill={colors.secondary} /> : <Box width="16px" height="16px" opacity="0" />}
        </Flex>
      </Mobile>
    </Flex>
  )
}
