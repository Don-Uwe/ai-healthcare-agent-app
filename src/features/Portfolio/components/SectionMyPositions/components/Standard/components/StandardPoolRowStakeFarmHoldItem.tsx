import { Box, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { toVolume } from '@/utils/numberish/autoSuffixNumberish'
import { useTokenAccountStore } from '@/store'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

export default function StandardPoolRowStakeFarmHoldItem({
  apr,
  lpMint,
  lpPrice
}: {
  apr?: number | string
  lpMint: ApiV3Token
  lpPrice: number
}) {
  const { t } = useTranslation()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const unStaked = getTokenBalanceUiAmount({ mint: lpMint.address, decimals: lpMint.decimals })

  if (unStaked.isZero) return null

  return (
    <Box
      display={'flex'}
      flexDirection={['column', 'row']}
      py={[3, 2]}
      px={[4, 8]}
      columnGap={8}
      bg={colors.backgroundTransparent12}
      borderRadius="xl"
      w="full"
      justifyContent={'center'}
      flexWrap="wrap"
    >
      <Text>
        {t('amm.farm_unstaked')}: {toVolume(new Decimal(unStaked.amount).toString(), { decimals: lpMint.decimals, decimalMode: 'trim' })}
      </Text>
      <HStack spacing={8}>
        <HStack>
          <Text color={colors.textSecondary}>{t('amm.position')}</Text>
          <Text>{toUsdVolume(new Decimal(unStaked.amount).mul(lpPrice).toString())}</Text>
        </HStack>

        <HStack>
          <Text color={colors.textSecondary}>{t('liquidity.APR')}</Text>
          <Text>{toPercentString(apr)}</Text>
        </HStack>
      </HStack>
    </Box>
  )
}
