import { useTranslation } from 'react-i18next'
import { ApiV3PoolInfoConcentratedItem } from '@raydium-io/raydium-sdk-v2'
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter
} from '@chakra-ui/react'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import PanelCard from '@/components/PanelCard'
import { getPoolName } from '@/features/Pools/util'
import { getMintSymbol } from '@/utils/token'
import { colors } from '@/theme/cssVariables/colors'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { panelCard } from '@/theme/cssBlocks'
import Decimal from 'decimal.js'
import toPercentString from '@/utils/numberish/toPercentString'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { getFirstNonZeroDecimal } from '@/utils/numberish/formatter'
import { formatCurrency } from '@/utils/numberish/formatter'

interface Props {
  isOpen: boolean
  isSending: boolean
  baseIn: boolean
  onClose: () => void
  onConfirm: () => void
  pool: ApiV3PoolInfoConcentratedItem
  tokenAmount: [string, string]
  priceRange: [string, string]
  tokenPrices: Record<string, TokenPrice>
  isCreatePool?: boolean
}

export default function PreviewDepositModal({
  pool,
  priceRange,
  tokenPrices,
  tokenAmount,
  baseIn,
  isSending,
  isCreatePool,
  isOpen,
  onConfirm,
  onClose
}: Props) {
  const { t } = useTranslation()
  const [symbolA, symbolB] = [
    getMintSymbol({ mint: pool.mintA, transformSol: true }),
    getMintSymbol({ mint: pool.mintB, transformSol: true })
  ]
  const currentPrice = baseIn ? pool.price : new Decimal(1).div(pool.price).toString()
  const inRange = new Decimal(currentPrice).gte(priceRange[0]) && new Decimal(currentPrice).lte(priceRange[1])
  const decimals = Math.max(pool.mintA.decimals, pool.mintB.decimals)

  const [price0Decimal, price1Decimal] = [getFirstNonZeroDecimal(priceRange[0]), getFirstNonZeroDecimal(priceRange[1])]

  const totalDeposit = new Decimal(tokenAmount[0])
    .mul(tokenPrices[pool.mintA.address]?.value || 0)
    .add(new Decimal(tokenAmount[1]).mul(tokenPrices[pool.mintB.address]?.value || 0))

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent color={colors.textPrimary} border={`1px solid ${colors.backgroundDark}`}>
        <ModalHeader mb="5">{t('clmm.preview_deposit')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Flex alignItems="center">
              <TokenAvatarPair token1={pool.mintA} token2={pool.mintB} mr="2" />
              <Text fontWeight="500" fontSize="xl">
                {getPoolName(pool).replace(' - ', '/')}
              </Text>
              <Badge ml="4" variant={inRange ? 'ok' : 'error'}>
                {inRange ? t('clmm.in_range') : t('clmm.out_of_range')}
              </Badge>
            </Flex>

            <PanelCard
              my={[3, '4']}
              py="2"
              px="4"
              fontSize="14px"
              fontWeight="500"
              border={`1px solid ${colors.selectInactive}`}
              bg={colors.modalContainerBg}
              sx={{ boxShadow: 'none' }}
            >
              <Text variant="title">{t('liquidity.my_position')}</Text>
              <Flex mt="2" alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap="2">
                  <TokenAvatar size={'smi'} token={pool.mintA} />
                  <Text variant="subTitle">{symbolA}</Text>
                </Flex>
                {formatLocaleStr(tokenAmount[0], pool['mintA'].decimals)} {symbolA}
              </Flex>
              <Flex mt="2" alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap="2">
                  <TokenAvatar size={'smi'} token={pool.mintB} />
                  <Text variant="subTitle">{symbolB}</Text>
                </Flex>
                {formatLocaleStr(tokenAmount[1], pool['mintB'].decimals)} {symbolB}
              </Flex>
              <Flex mt="2" justifyContent="space-between">
                <Text color={colors.textSecondary}>{t('field.fee_tier')}</Text>
                {toPercentString(isCreatePool ? pool.feeRate / 10000 : pool.feeRate * 100)}
              </Flex>
            </PanelCard>

            <PanelCard py="3" px="4" border={`1px solid ${colors.selectInactive}`} bg={colors.modalContainerBg} sx={{ boxShadow: 'none' }}>
              <Flex mb="2" justifyContent="space-between">
                <Text variant="title">{t('field.current_price')}</Text>
                <Flex fontSize="sm" gap="1" fontWeight="500" alignItems="center">
                  {formatLocaleStr(currentPrice, decimals)}
                  <Text color={colors.textSecondary}>
                    {t('common.per_unit', {
                      subA: baseIn ? symbolB : symbolA,
                      subB: baseIn ? symbolA : symbolB
                    })}
                  </Text>
                </Flex>
              </Flex>

              <Text variant="title" mb="2">
                {t('clmm.selected_range')}
              </Text>

              <Flex gap="4">
                <Flex
                  {...panelCard}
                  flexDirection="column"
                  justifyContent="center"
                  px={[3, 6]}
                  py="3"
                  w="48%"
                  bg={colors.modalContainerBg}
                  textAlign="center"
                >
                  <Text variant="subTitle">{t('clmm.min_price')}</Text>
                  <Text fontSize={['lg', 'xl']} fontWeight="500" color={colors.textPrimary}>
                    {price0Decimal > decimals
                      ? formatCurrency(new Decimal(priceRange[0]).toFixed(24), { maximumDecimalTrailingZeroes: 5 })
                      : formatCurrency(new Decimal(priceRange[0]).toDecimalPlaces(decimals).toFixed(24), {
                          maximumDecimalTrailingZeroes: 5
                        })}
                  </Text>
                  <Text variant="subTitle" color={colors.textSecondary} opacity="0.5">
                    {t('common.per_unit', {
                      subA: baseIn ? symbolB : symbolA,
                      subB: baseIn ? symbolA : symbolB
                    })}
                  </Text>
                </Flex>

                <Flex
                  {...panelCard}
                  flexDirection="column"
                  justifyContent="center"
                  px={[3, 6]}
                  py="3"
                  w="48%"
                  bg={colors.modalContainerBg}
                  textAlign="center"
                >
                  <Text variant="subTitle">{t('clmm.max_price')}</Text>
                  <Text fontSize={['lg', 'xl']} fontWeight="500" color={colors.textPrimary}>
                    {price1Decimal > decimals
                      ? formatCurrency(new Decimal(priceRange[1]).toFixed(24), { maximumDecimalTrailingZeroes: 5, abbreviated: true })
                      : formatCurrency(new Decimal(priceRange[1]).toDecimalPlaces(decimals).toFixed(24), {
                          maximumDecimalTrailingZeroes: 5,
                          abbreviated: true
                        })}
                  </Text>
                  <Text variant="subTitle" color={colors.textSecondary} opacity="0.5">
                    {t('common.per_unit', {
                      subA: baseIn ? symbolB : symbolA,
                      subB: baseIn ? symbolA : symbolB
                    })}
                  </Text>
                </Flex>
              </Flex>
            </PanelCard>

            <PanelCard
              my={[3, '4']}
              py="2"
              px="4"
              fontSize="sm"
              fontWeight="500"
              border={`1px solid ${colors.selectInactive}`}
              bg={colors.modalContainerBg}
              sx={{ borderRadius: '12px', boxShadow: 'none' }}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Text variant="title">{t('liquidity.total_deposit')}</Text>
                <Text fontSize={['lg', 'xl']} fontWeight="500">
                  {toUsdVolume(totalDeposit.toString())}
                </Text>
              </Flex>
            </PanelCard>
          </Box>
        </ModalBody>
        <ModalFooter px="0" py="0" mt="4" mb="2">
          <Button w="100%" onClick={onConfirm} isLoading={isSending} loadingText={t('transaction.transaction_initiating')}>
            {t('clmm.confirm_deposit')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
