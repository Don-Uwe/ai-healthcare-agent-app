import { Box, Flex, HStack, Tag, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { colors } from '@/theme/cssVariables'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import CircleCheck from '@/icons/misc/CircleCheck'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { LockCpmmPoolInfo } from '@/hooks/portfolio/cpmm/useLockableCpmmLp'
import { useTokenAccountStore } from '@/store'
import { formatCurrency } from '@/utils/numberish/formatter'

export default function LiquidityItem({
  poolInfo,
  isSelected = false,
  onClick
}: {
  poolInfo: LockCpmmPoolInfo
  isSelected?: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const lpBalance = getTokenBalanceUiAmount({ mint: poolInfo.lpMint.address, decimals: poolInfo.lpMint.decimals }).amount

  return (
    <Flex
      direction={['column', 'row']}
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
      <Flex justifyContent="space-between" flex="1">
        <Flex gap={1}>
          <TokenAvatarPair size="smi" token1={poolInfo.mintA} token2={poolInfo.mintB} />
          <Flex flexDirection="column" gap={1}>
            <HStack gap={1}>
              <Text fontSize={['md', '20px']} fontWeight="500" lineHeight="24px">
                {poolInfo.poolName.replace(' - ', '/')}
              </Text>
              <Tag size={['sm', 'md']} variant="rounded">
                {formatToRawLocaleStr(toPercentString(poolInfo.feeRate * 100))}
              </Tag>
            </HStack>
          </Flex>
        </Flex>
        <Flex gap="2">
          <Flex direction="column" color={colors.lightPurple} textAlign={['left', 'right']}>
            <Text>
              Position:{' '}
              {formatCurrency(lpBalance.mul(poolInfo.lpPrice).toDecimalPlaces(6).toString(), {
                symbol: '$',
                decimalPlaces: 2
              })}
            </Text>
            <Text opacity={0.5}>
              {formatCurrency(lpBalance.toString(), {
                decimalPlaces: 2
              })}{' '}
              LP
            </Text>
          </Flex>
          <HStack justify="space-between">
            {isSelected ? <CircleCheck width={16} height={16} fill={colors.secondary} /> : <Box width="16px" height="16px" opacity="0" />}
          </HStack>
        </Flex>
      </Flex>
    </Flex>
  )
}
