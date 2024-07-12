import { Box, Flex, Text, useDisclosure } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { Select } from '@/components/Select'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { FormattedFarmInfo } from '@/hooks/farm/type'
import useFetchFarmByLpMint from '@/hooks/farm/useFetchFarmByLpMint'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import { useAppStore, useFarmStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'

import AmountSlider from '@/components/AmountSlider'
import { formatCurrency } from '@/utils/numberish/formatter'
import Decimal from 'decimal.js'
import SelectFarmListItem from '../../components/SelectFarmListItem'
import SelectedFarm from '../../components/SelectedFarm'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import { useEvent } from '@/hooks/useEvent'
interface Props {
  poolInfo?: FormattedPoolInfoStandardItem
  disabled?: boolean
  onRefresh: () => void
}

export default function Stake({ poolInfo, disabled, onRefresh }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  const featureDisabled = useAppStore((s) => s.featureDisabled.addFarm)
  const depositFarmAct = useFarmStore((s) => s.depositFarmAct)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { lpBasedData } = useFarmPositions({})

  const [isLoading, setIsLoading] = useState(true)
  const [selectedFarm, setSelectedFarm] = useState<FormattedFarmInfo | undefined>(undefined)
  const [percent, setPercent] = useState(0)
  const circleRef = useRef<IntervalCircleHandler>(null)
  const { formattedData, mutate: mutateFarm } = useFetchFarmByLpMint({
    poolLp: poolInfo?.lpMint.address
  })
  const farmList = useMemo(() => formattedData.filter((f) => f.isOngoing), [formattedData])

  const lpBalance = getTokenBalanceUiAmount({ mint: poolInfo?.lpMint.address || '', decimals: poolInfo?.lpMint.decimals })
  const readyStakeAmount = poolInfo ? lpBalance.amount.mul(percent / 100) : new Decimal(0)

  useEffect(() => {
    if (farmList.length > 0) {
      setSelectedFarm(farmList[0])
      setIsLoading(false)
    }
  }, [farmList])

  if (disabled) {
    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        mode: 'add'
      }
    })
  }
  useEffect(() => {
    if (disabled) {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          mode: 'add'
        }
      })
    }
  }, [disabled])

  const handleDeposit = () => {
    if (!selectedFarm || !poolInfo) return
    const lpPositionData = lpBasedData.get(poolInfo.lpMint.address)
    onSending()
    depositFarmAct({
      farmInfo: selectedFarm,
      amount: readyStakeAmount.toString(),
      userAuxiliaryLedgers: lpPositionData?.hasV1Data
        ? lpPositionData.data.filter((d) => d.version === 'V1' && !new Decimal(d.lpAmount).isZero()).map((d) => d.userVault)
        : undefined,
      onSent: () => {
        setPercent(0)
        offSending()
      },
      onFinally: offSending
    })
  }

  const handleRefresh = useEvent(() => {
    mutateFarm()
    onRefresh()
  })

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    handleRefresh()
  })

  if (!poolInfo) return null

  return (
    <Flex direction="column" w="full" px="24px" pt={4} pb="40px" bg={colors.backgroundLight}>
      <Flex mb={3} justifyContent="space-between" alignItems="center">
        <Text fontSize="xl" fontWeight="medium" color={colors.textPrimary}>
          {t('liquidity.select_farm')}
        </Text>
        <Flex align="center" gap={3}>
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
      <Text fontSize="xl" fontWeight="medium" color={colors.textPrimary} mt={5} mb={3}>
        {t('liquidity.stake_liquidity')}
      </Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        maxW="100%"
        flexWrap={'wrap'}
        p="4"
        bg={colors.backgroundDark}
        borderRadius="12px"
      >
        <Flex gap="2" alignItems="center">
          <TokenAvatarPair token1={poolInfo.mintA} token2={poolInfo.mintB} />
          <Text variant="title" fontSize={['20px', '24px']}>
            {selectedFarm?.farmName.replace(' - ', '/')}
          </Text>
        </Flex>
        <Box textAlign="right">
          <Text fontSize={['22px', '28px']} fontWeight="500">
            {formatCurrency(lpBalance.amount.mul(percent).div(100).toString(), { decimalPlaces: poolInfo.lpMint.decimals })}
          </Text>
          <Text variant="label" fontSize="sm">
            {formatCurrency(readyStakeAmount.mul(poolInfo.lpPrice).toString(), { symbol: '$', decimalPlaces: 2 })}
          </Text>
        </Box>
      </Flex>
      <AmountSlider
        percent={percent}
        isDisabled={featureDisabled || lpBalance.amount.isZero()}
        onChange={setPercent}
        defaultValue={percent}
        mt={10}
      />
      <Button mt={10} isLoading={isSending} isDisabled={featureDisabled || readyStakeAmount.isZero()} onClick={handleDeposit}>
        {featureDisabled ? t('common.disabled') : t('liquidity.stake_liquidity')}
      </Button>
    </Flex>
  )
}
