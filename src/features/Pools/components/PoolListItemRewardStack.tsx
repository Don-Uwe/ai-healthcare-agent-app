import { Badge, Flex, Grid, GridItem, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import Tooltip from '@/components/Tooltip'
import { WeeklyRewardData } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import Decimal from 'decimal.js'

export function PoolListItemRewardStack(props: { rewards: WeeklyRewardData }) {
  const { t } = useTranslation()
  const { data: tokenPrices } = useTokenPrice({
    mintList: props.rewards.map((r) => r.token.address)
  })

  return (
    <HStack spacing={0.5}>
      {props.rewards.map((reward) => (
        <Tooltip
          key={reward.token.address}
          variant={'card'}
          label={
            <Flex overflow={'hidden'} rounded={'inherit'} py={3} px={4} position={'relative'} direction="column">
              <Badge variant={'crooked'} position="absolute" left="-4px" top="0" px={3} borderRadius="0px 0px 24px 0px">
                {t('badge.ecosystem')}
              </Badge>
              <Flex direction="column" pt="15px" px={0} minW="230px">
                <Grid
                  gridTemplate={`
                    "token  volume  " auto
                    ".      duration" auto
                    ".      address " auto / auto 1fr
                  `}
                  gap={1}
                >
                  <GridItem area="token">
                    <Flex w="full" h="full" justify="center" align="center">
                      <TokenAvatar token={reward.token} size="sm" />
                    </Flex>
                  </GridItem>
                  <GridItem area="volume">
                    <Flex h="100%" gap={4} fontSize="sm" color={colors.textPrimary} justify={'space-between'} alignItems="center">
                      <Text>
                        {formatCurrency(reward.amount, { decimalPlaces: 0 })} {reward.token?.symbol}/{t('common.week')}
                      </Text>
                      <Text>
                        {formatCurrency(new Decimal(reward.amount || 0).mul(tokenPrices[reward.token.address]?.value || 0).toString(), {
                          symbol: '$',
                          decimalPlaces: 2
                        })}
                      </Text>
                    </Flex>
                  </GridItem>
                  {/* <GridItem area="duration">
                    <Flex h="100%" gap={4} fontSize="sm" color={colors.textSecondary} justify={'space-between'} alignItems="center">
                      <Text>{t('common.week')}</Text>
                      <Text>{reward.duration}</Text>
                    </Flex>
                  </GridItem> */}
                  <GridItem area="address" color={colors.textSecondary}>
                    <AddressChip address={reward.token.address} showCopyIcon canExternalLink />
                  </GridItem>
                </Grid>
              </Flex>
            </Flex>
          }
        >
          <TokenAvatar token={reward.token} size="sm" />
        </Tooltip>
      ))}
    </HStack>
  )
}
