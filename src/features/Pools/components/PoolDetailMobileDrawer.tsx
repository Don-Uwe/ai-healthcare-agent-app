import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { WeeklyRewardData } from '@/hooks/pool/type'
import { AprData } from '@/features/Clmm/utils/calApr'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import StarIcon from '@/icons/misc/StarIcon'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  HStack,
  SimpleGrid,
  Tag,
  Text,
  VStack,
  Badge
} from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import React from 'react'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useTranslation } from 'react-i18next'
import { toAPRPercent } from '../util'
import { ChartWindow } from './PoolChart'
import { aprColors } from './PoolListItemAprLine'
import { PoolListItemAprPie } from './PoolListItemAprPie'
import { wSolToSolString } from '@/utils/token'
import Decimal from 'decimal.js'

type PoolDetailMobileDrawerProps = {
  pairName: string
  baseToken: TokenInfo | ApiV3Token | undefined
  quoteToken: TokenInfo | ApiV3Token | undefined
  isFavorite: boolean
  poolId: string
  onFavoriteClick: () => void
  feeTier: string | number
  isOpenBook: boolean
  timeBase: string
  volume?: string
  fees?: string
  tvl?: string
  aprData: AprData
  weeklyRewards: WeeklyRewardData
  isEcosystem: boolean
  isOpen: boolean
  onClose: () => void
  onDeposit: () => void
}

function ContentCard({ children }: { children: React.ReactNode }) {
  return (
    <Box bg={colors.backgroundDark50} borderRadius="12px" w="full" px={4} py={3}>
      {children}
    </Box>
  )
}

export default function PoolDetailMobileDrawer({
  pairName,
  baseToken,
  quoteToken,
  isFavorite,
  poolId,
  onFavoriteClick,
  feeTier,
  isOpenBook,
  timeBase,
  volume,
  fees,
  tvl,
  aprData,
  weeklyRewards,
  isEcosystem,
  isOpen,
  onClose,
  onDeposit
}: PoolDetailMobileDrawerProps) {
  const { t } = useTranslation()
  const { data: tokenPrices } = useTokenPrice({
    mintList: weeklyRewards.map((r) => r.token.address)
  })

  return (
    <Drawer
      isOpen={isOpen}
      variant="popFromBottom"
      placement="bottom"
      onClose={() => {
        console.log('close')
        return onClose()
      }}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody mt={8}>
          <Flex direction="column" justify={'flex-start'} align="center" gap={0}>
            <TokenAvatarPair token1={baseToken} token2={quoteToken} size="lg" pl={'3.5%'} />
            <SimpleGrid templateColumns={'repeat(3, 1fr)'} alignItems="center" mt={1}>
              <Box />
              <Text fontSize="xl" fontWeight="medium" whiteSpace={'nowrap'}>
                {pairName}
              </Text>
              <StarIcon selected={isFavorite} onClick={onFavoriteClick} style={{ cursor: 'pointer', marginLeft: '6px' }} />
            </SimpleGrid>
            <HStack mt={2}>
              <Tag size="sm" variant="rounded">
                {feeTier}%
              </Tag>
              {isOpenBook ? (
                <Tag size="sm" variant="rounded">
                  <OpenBookIcon />
                </Tag>
              ) : null}
            </HStack>
          </Flex>
          <VStack mt={5} spacing={3}>
            <ContentCard>
              <HStack justify={'space-between'}>
                <Flex direction="column" gap={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t(`field.${timeBase}_volume`)}
                  </Text>
                  <Text textAlign={'start'}>{volume}</Text>
                </Flex>
                <Flex direction="column" gap={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t(`field.${timeBase}_fees`)}
                  </Text>
                  <Text textAlign={'start'}>{fees}</Text>
                </Flex>
                <Flex direction="column" gap={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t('common.tvl')}
                  </Text>
                  <Text textAlign={'start'}>{tvl}</Text>
                </Flex>
              </HStack>
            </ContentCard>
            <ContentCard>
              <Flex w="full" gap={4}>
                <Flex flex={1} justify={'space-between'} align={'center'}>
                  <Flex direction="column" gap="6px">
                    <Text fontSize="sm" color={colors.textSecondary}>
                      {t('field.total_apr')}
                    </Text>
                    <Text fontSize="xl" fontWeight="medium">
                      {toAPRPercent(aprData.apr)}
                    </Text>
                  </Flex>
                  <PoolListItemAprPie aprs={aprData} w={12} h={12} />
                </Flex>
                <Flex flex={1} direction="column" gap={2}>
                  <Flex w="full" gap={4} justify={'space-between'} align="center">
                    <Flex fontSize="xs" fontWeight="normal" color={colors.textSecondary} justify="flex-start" align="center">
                      <Box rounded="full" bg={aprColors[0]} w="7px" h="7px" mr="8px"></Box>
                      {t('field.trade_fees')}
                    </Flex>
                    <Box fontSize="xs" color={colors.textPrimary}>
                      {toAPRPercent(aprData.fee.apr)}
                    </Box>
                  </Flex>
                  {aprData.rewards.map(({ apr, mint: token }, idx) => (
                    <Flex w="full" gap={4} key={`reward-${token?.symbol}-${idx}`} justify={'space-between'} align="center">
                      <Flex fontSize="xs" fontWeight="normal" color={colors.textSecondary} justify="flex-start" align="center">
                        <Box rounded="full" bg={aprColors[idx + 1]} w="7px" h="7px" mr="8px"></Box>
                        <HStack>
                          <Text>{wSolToSolString(token?.symbol)}</Text>
                          <TokenAvatar token={token} size="xs" />
                        </HStack>
                      </Flex>
                      <Box fontSize="xs" color={colors.textPrimary}>
                        {toAPRPercent(apr)}
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            </ContentCard>
            <ContentCard>
              <Flex gap="2" alignItems="center">
                <Text fontSize="sm" color={colors.textSecondary}>
                  {t('field.weekly_rewards')}
                </Text>
                {isEcosystem ? <Badge variant="crooked">{t('badge.ecosystem')}</Badge> : null}
              </Flex>
              <SimpleGrid templateColumns={'repeat(2, 1fr)'} columnGap={2}>
                {weeklyRewards.map((reward) => (
                  <Flex
                    w="full"
                    key={String(reward.token?.address)}
                    justify={'space-between'}
                    align="center"
                    fontSize="12px"
                    mt="8px"
                    gap="1"
                  >
                    <HStack fontWeight="normal" color={colors.textSecondary} spacing={1}>
                      <TokenAvatar size="sm" token={reward.token} />
                      <Box color={colors.textPrimary}>{formatCurrency(reward.amount, { decimalPlaces: 2 })}</Box>
                      <Box>{reward.token?.symbol}</Box>
                    </HStack>
                    <Box>
                      {formatCurrency(new Decimal(tokenPrices[reward.token.address]?.value || 0).mul(reward.amount).toString(), {
                        symbol: '$',
                        decimalPlaces: 2
                      })}
                    </Box>
                  </Flex>
                ))}
              </SimpleGrid>
            </ContentCard>
            <ContentCard>
              <ChartWindow
                poolAddress={poolId}
                categories={[
                  { label: 'Volume', value: 'volume' },
                  { label: 'Liquidity', value: 'liquidity' }
                ]}
              />
            </ContentCard>
          </VStack>
        </DrawerBody>
        <DrawerFooter bg="transparent">
          <Button onClick={onDeposit} w={'full'}>
            {t('button.deposit')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
