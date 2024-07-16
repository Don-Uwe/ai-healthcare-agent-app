import { Box, Flex, HStack, SimpleGrid, Text, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@/components/Select'
import Button from '@/components/Button'
import AmountSlider from '@/components/AmountSlider'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'

import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { FormattedFarmInfo } from '@/hooks/farm/type'
import useFetchFarmByLpMint from '@/hooks/farm/useFetchFarmByLpMint'
import useFetchFarmBalance from '@/hooks/farm/useFetchFarmBalance'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import { useAppStore, useFarmStore, useTokenAccountStore } from '@/store'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { formatCurrency } from '@/utils/numberish/formatter'
import SelectedFarm from '../../components/SelectedFarm'
import SelectFarmListItem from '../../components/SelectFarmListItem'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { colors } from '@/theme/cssVariables'
import Decimal from 'decimal.js'
import { useEvent } from '@/hooks/useEvent'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'

export default function UnStakeLiquidity({
  poolInfo,
  lpPrice,
  defaultFarm,
  onStakedChange
}: {
  poolInfo?: FormattedPoolInfoStandardItem
  defaultFarm?: string
  lpPrice: number
  onStakedChange: (val: string) => void
}) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.removeFarm)
  const withdrawFarmAct = useFarmStore((s) => s.withdrawFarmAct)
  const fetchTokenAccountAct = useTokenAccountStore((s) => s.fetchTokenAccountAct)
  const circleRef = useRef<IntervalCircleHandler>(null)
  const [selectedFarm, setSelectedFarm] = useState<FormattedFarmInfo | undefined>(undefined)
  const [withdrawPercent, setWithdrawPercent] = useState(0)
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()

  const {
    formattedData: farmList,
    isLoading,
    mutate: mutateFarm
  } = useFetchFarmByLpMint({
    poolLp: poolInfo?.lpMint.address
  })

  const { farmBasedData, mutate: mutateFarmPos } = useFarmPositions({})
  const farmPositionData = farmBasedData.get(selectedFarm?.id || '')
  // const v1Deposited = new Decimal(farmPositionData?.totalV1LpAmount || 0).div(10 ** (selectedFarm?.lpMint.decimals || 0)).toString()

  const {
    deposited,
    pendingRewards,
    mutate: mutateFarmBalance
  } = useFetchFarmBalance({
    farmInfo: selectedFarm
  })
  const { data: tokenPrices } = useTokenPrice({
    mintList: pendingRewards.map((_, idx) => selectedFarm?.rewardInfos[idx]?.mint.address)
  })

  const totalDeposited = new Decimal(deposited)
  const withdrawAmount = totalDeposited.mul(withdrawPercent).div(100)

  useEffect(() => {
    if (farmList.length > 0) setSelectedFarm(defaultFarm ? farmList.find((f) => f.id === defaultFarm) || farmList[0] : farmList[0])
  }, [farmList])

  useEffect(() => {
    onStakedChange(deposited)
  }, [deposited, onStakedChange])

  const handleClickUnStake = () => {
    onSending()
    withdrawFarmAct({
      farmInfo: selectedFarm!,
      amount: withdrawAmount.toString(),
      userAuxiliaryLedgers: farmPositionData?.hasV1Data
        ? farmPositionData.data.filter((d) => d.version === 'V1' && !new Decimal(d.lpAmount).isZero()).map((d) => d.userVault)
        : undefined,
      onSent: () => {
        setWithdrawPercent(0)
        offSending()
      },
      onError: offSending
    })
  }

  const handleRefresh = useEvent(() => {
    mutateFarm()
    mutateFarmBalance()
    mutateFarmPos()
    fetchTokenAccountAct({})
  })

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    handleRefresh()
  })

  return (
    <Flex borderRadius="24px" direction="column" w="full" px="24px" py="32px" mb="10" bg={colors.backgroundLight}>
      <Flex mb={3} justifyContent="space-between" alignItems="center">
        <Text fontSize="xl" fontWeight="medium" color={colors.textPrimary}>
          {t('liquidity.select_farm')}
        </Text>
      </Flex>
      <Select<FormattedFarmInfo>
        sx={{ py: '12px', px: '14px', borderRadius: '8px', bg: colors.backgroundDark, width: 'full' }}
        popoverContentSx={{ py: 3, px: 4, bg: colors.backgroundDark }}
        triggerSX={{ w: 'full' }}
        value={!isLoading ? selectedFarm : undefined}
        items={farmList}
        onChange={(v) => setSelectedFarm(v)}
        renderTriggerItem={(value) => <SelectedFarm farm={value} />}
        renderItem={(item) => <SelectFarmListItem farm={item!} currentSelectedId={selectedFarm?.id} />}
        hasDivider
        hasBorder
      />
      <Text fontSize="xl" fontWeight="medium" color={colors.textPrimary} mt="4" mb="2">
        {t('liquidity.unstake_liquidity')}
      </Text>
      <Flex justifyContent="space-between" align="center" py="6" px="4" bg={colors.backgroundDark} borderRadius="12px">
        <Flex gap="2" alignItems="center">
          <TokenAvatarPair token1={poolInfo?.mintA} token2={poolInfo?.mintB} />
          <Text variant="title" fontSize="xl" color={colors.textSecondary}>
            {poolInfo?.poolName.replace(' - ', '/')}
          </Text>
        </Flex>
        <Box textAlign="right">
          <Text fontSize="28px">{formatCurrency(withdrawAmount.mul(lpPrice).toString(), { symbol: '$', decimalPlaces: 2 })}</Text>
          <Text variant="label">{formatCurrency(withdrawAmount.toString(), { decimalPlaces: poolInfo?.lpMint.decimals })} LP</Text>
        </Box>
      </Flex>
      <AmountSlider
        isDisabled={featureDisabled || totalDeposited.isZero()}
        percent={withdrawPercent}
        onChange={setWithdrawPercent}
        mt={4}
      />
      <Flex align="center" justify="flex-end" mb={2} gap={3}>
        <SlippageAdjuster variant="liquidity" />
        <IntervalCircle
          componentRef={circleRef}
          svgWidth={18}
          strokeWidth={2}
          trackStrokeColor={colors.secondary}
          trackStrokeOpacity={0.5}
          filledTrackStrokeColor={colors.secondary}
          onClick={handleClick}
          onEnd={handleRefresh}
        />
      </Flex>
      <Box bg={colors.backgroundDark} borderRadius="12px" py={3} px={6}>
        <Text fontSize="md" fontWeight="medium" color={colors.textSecondary}>
          {t('liquidity.rewards_to_be_harvested')}
        </Text>
        <SimpleGrid columns={2} rowGap="6px" columnGap="44px">
          {pendingRewards.map((rewardAmount, idx) => {
            const rewardMint = selectedFarm?.rewardInfos[idx]
            if (!rewardMint) return null
            return (
              <Flex key={`reward-info-${rewardMint.mint.address}-${idx}`} justify={'space-between'} align="center">
                <HStack spacing="6px">
                  <TokenAvatar size="smi" token={rewardMint.mint} />
                  <HStack spacing="2px">
                    <Text fontSize="sm">{rewardAmount}</Text>
                    <Text fontSize="sm" color={colors.textSecondary} mx="1" opacity={0.6}>
                      {rewardMint.mint?.symbol}
                    </Text>
                  </HStack>
                </HStack>
                <Text fontSize="sm">
                  {formatCurrency(new Decimal(rewardAmount || 0).mul(tokenPrices[rewardMint.mint.address]?.value ?? 0).toFixed(10), {
                    symbol: '$',
                    decimalPlaces: 2
                  })}
                </Text>
              </Flex>
            )
          })}
        </SimpleGrid>
      </Box>
      <Button
        mt={10}
        isDisabled={featureDisabled || !selectedFarm || withdrawAmount.isZero()}
        isLoading={isSending}
        onClick={handleClickUnStake}
      >
        {featureDisabled ? t('common.disabled') : t('liquidity.unstake_liquidity')}
      </Button>
    </Flex>
  )
}
