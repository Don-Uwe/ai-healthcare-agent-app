import TokenAvatarPair from '@/components/TokenAvatarPair'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { Badge, Box, HStack, Tag, Text, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

export default function PoolInfoDrawerFace({
  poolInfo,
  baseIn,
  position
}: {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  baseIn: boolean
}) {
  const { t } = useTranslation()
  const { getPriceAndAmount } = useClmmBalance({})
  const { priceLower, priceUpper } = getPriceAndAmount({ poolInfo, position })
  const decimals = Math.max(poolInfo.mintA.decimals, poolInfo.mintB.decimals)
  const inRange = priceLower.price.lt(poolInfo.price) && priceUpper.price.gt(poolInfo.price)
  const rangeValue = baseIn
    ? `${priceLower.price.toFixed(decimals)} - ${priceUpper.price.toFixed(decimals)}`
    : `${new Decimal(1).div(priceUpper.price).toFixed(decimals)} - ${new Decimal(1).div(priceLower.price).toFixed(decimals)}`
  const rangeValueUnit = t('common.per_unit_2', {
    subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
    subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
  })
  return (
    <VStack spacing={1}>
      <TokenAvatarPair size="40px" token1={poolInfo.mintA} token2={poolInfo.mintB} />

      {/* pool name */}
      <HStack>
        <Box fontSize="lg" fontWeight={500} color={colors.textPrimary}>
          {poolInfo.mintA.symbol} / {poolInfo.mintB.symbol}
        </Box>
        <Tag size={['sm', 'md']} variant="rounded">
          {toPercentString(poolInfo.feeRate)}
        </Tag>
      </HStack>

      {/* position name */}
      <HStack fontSize="sm" flexWrap={'wrap'} justify={'center'}>
        <Text fontWeight="500" whiteSpace={'nowrap'}>
          {rangeValue}
        </Text>
        <Text color={colors.textTertiary} whiteSpace={'nowrap'}>
          {rangeValueUnit}
        </Text>
        <Badge variant={inRange ? 'ok' : 'error'}>{inRange ? t('clmm.in_range') : t('clmm.out_of_range')}</Badge>
      </HStack>
    </VStack>
  )
}
