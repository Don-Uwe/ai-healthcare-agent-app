import { Box, Flex, Grid, GridItem, Text, useDisclosure } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import { ApiV3Token, ApiStakePool } from '@raydium-io/raydium-sdk-v2'

import { colors } from '@/theme/cssVariables'
import { useFarmStore } from '@/store/useFarmStore'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import Apr from './Apr'
import ActionButtons from './Manipulate'
import PendingRewards from './PendingRewards'
import TokenBriefFace from './TokenBriefFace'
import StakedValue from './StakedValue'
import { panelCard } from '@/theme/cssBlocks'
import TokenAvatar from '@/components/TokenAvatar'
import Button from '@/components/Button'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import { routeToPage } from '@/utils/routeTools'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import MobileStakeDetailDrawer from './MobileStakeDetailDrawer'
import { Desktop, Mobile } from '@/components/MobileDesktop'

export const PositionStatus = {
  unstaked: 'UnStaked Tokens',
  ended: 'Ended farm',
  normal: ''
}

type PoolProps = {
  pool: ApiStakePool
  staked: {
    token: ApiV3Token | undefined
    amount: string
    pendingReward: string
    v1Vault?: string
  }
  apr: string
  onConfirmed?: () => void
}

export default function StakingPositionRawItem({ pool, staked, apr, onConfirmed }: PoolProps) {
  const { t } = useTranslation()
  const { isOpen, onClose, onToggle } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const { data: tokenPrices } = useTokenPrice({
    mintList: [staked.token?.address]
  })
  const withdrawFarmAct = useFarmStore((s) => s.withdrawFarmAct)
  const handleHarvest = useEvent(() => {
    onLoading()
    withdrawFarmAct({
      farmInfo: pool,
      amount: '0',
      userAuxiliaryLedgers: staked.v1Vault ? [staked.v1Vault] : undefined,
      onConfirmed,
      onFinally: offLoading
    })
  })

  const positionUsd = new Decimal(staked.amount).mul(pool.lpPrice || 0).toString()
  const pendingAmount = staked.pendingReward || 0
  const pendingAmountInUSD = new Decimal(pendingAmount).mul(tokenPrices[staked.token?.address || '']?.value || 0).toString()

  return (
    <>
      <Mobile>
        <Box bg={colors.backgroundLight} borderRadius={'xl'} py={4} px={3}>
          <Flex justifyContent="space-between">
            <Flex gap={4}>
              <Flex alignItems="center" gap={2}>
                <TokenAvatar size="sm" token={staked.token} />
                <Text color={colors.textPrimary} fontWeight="medium">
                  {staked.token?.symbol}
                </Text>
              </Flex>
              <Flex alignItems="center" gap={1}>
                <Text fontSize="xs" color={colors.lightPurple}>
                  {t('field.apr')}:
                </Text>
                <Text fontSize="xs" fontWeight="medium">
                  {formatToRawLocaleStr(apr)}
                </Text>
              </Flex>
            </Flex>
            <Flex gap={2}>
              <Button
                variant="outline"
                size="xs"
                w={9}
                h="30px"
                onClick={() => {
                  routeToPage('staking', { queryProps: { dialog: 'unstake', open: pool.id } })
                }}
              >
                <MinusIcon color={colors.secondary} />
              </Button>
              <Button
                size="xs"
                w={9}
                h="30px"
                onClick={() => {
                  routeToPage('staking', { queryProps: { dialog: 'stake', open: pool.id } })
                }}
              >
                <PlusIcon />
              </Button>
            </Flex>
          </Flex>
          <Flex
            borderRadius="md"
            justifyContent="space-between"
            p={3}
            mt={3}
            alignItems={'center'}
            bg={colors.backgroundDark}
            onClick={onToggle}
          >
            <Flex direction="column" gap={2} fontSize="sm">
              <Flex justify="flex-start" align="flex-start" gap={2}>
                <Text color={colors.textSecondary}>{t('staking.my_staked_ray')}</Text>
                <Text color={colors.textPrimary} fontWeight="medium">
                  {formatCurrency(positionUsd, { symbol: '$', decimalPlaces: 2 })}
                </Text>
              </Flex>
              <Flex justify="flex-start" align={'flex-start'} gap={2}>
                <Text color={colors.textSecondary}>{t('staking.pending_rewards')}</Text>
                <Text color={colors.textPrimary} fontWeight="medium">
                  {formatCurrency(pendingAmountInUSD, { symbol: '$', decimalPlaces: 6 })}
                </Text>
              </Flex>
            </Flex>
            <ChevronRightIcon color={colors.secondary} />
          </Flex>
        </Box>
        <MobileStakeDetailDrawer
          isOpen={isOpen}
          onClose={onClose}
          id={pool.id}
          token={staked.token}
          amount={staked.amount}
          positionUsd={positionUsd}
          apr={apr}
          pendingReward={pendingAmountInUSD}
          isLoading={isLoading}
          harvestable={!new Decimal(pendingAmount).isZero()}
          onHarvest={handleHarvest}
        />
      </Mobile>
      <Desktop>
        <Grid
          {...panelCard}
          gridTemplate={[
            `
        "face   face" auto
        "staked apr " auto
        "pend   pend" auto
        "btns   btns" auto / 1fr 1fr
      `,
            `
        "face staked apr pend btns" auto / 1fr 1fr 1fr 2fr 2fr
      `
          ]}
          gap={4}
          py={[4, 5]}
          px={[3, 8]}
          bg={colors.backgroundLight}
          borderRadius={['lg', 'xl']}
        >
          <GridItem area="face">
            <TokenBriefFace token={staked.token} />
          </GridItem>
          <GridItem area="staked">
            <StakedValue positionUsd={positionUsd} staked={staked} />
          </GridItem>
          <GridItem area="apr">
            <Apr apr={apr} />
          </GridItem>
          <GridItem area="pend">
            <PendingRewards
              pendingReward={pendingAmountInUSD}
              isLoading={isLoading}
              harvestable={!new Decimal(pendingAmount).isZero()}
              onHarvest={handleHarvest}
            />
          </GridItem>
          <GridItem area="btns" justifySelf={['center', 'end']}>
            <ActionButtons id={pool.id} stakedToken={staked.token} />
          </GridItem>
        </Grid>
      </Desktop>
    </>
  )
}
