import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import Tabs from '@/components/Tabs'
import TokenAvatar from '@/components/TokenAvatar'
import PoolListItemAprDetailPopoverContent from '@/features/Pools/components/PoolListItemAprDetailPopoverContent'
import { PoolListItemAprLine } from '@/features/Pools/components/PoolListItemAprLine'
import { AprKey, TimeAprData, TimeBasisOptionType, WeeklyRewardData, timeBasisOptions } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { AprData } from '@/features/Clmm/utils/calApr'
import { Box, Flex, HStack, SimpleGrid, Text, Tooltip } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type EstimatedAprProps = {
  timeBasis: AprKey
  aprData: AprData
  onTimeBasisChange?: (val: AprKey) => void
  timeAprData: TimeAprData
  weeklyRewards: WeeklyRewardData
  defaultTimeBasis?: TimeBasisOptionType['value']
}

export default function EstimatedApr({ aprData, weeklyRewards, onTimeBasisChange }: EstimatedAprProps) {
  const { t } = useTranslation()

  return (
    <Flex
      flex={1}
      bg={colors.backgroundDark}
      w="full"
      borderRadius="12px"
      p={4}
      direction="column"
      justify={'space-between'}
      gap={[1, 2]}
      fontSize="sm"
    >
      <HStack justify="space-between">
        <HStack spacing={2}>
          <Text color={colors.textSecondary}>{t('common.estimated_APR')}</Text>
          <AprMDSwitchWidget />
        </HStack>
        <Tabs items={timeBasisOptions} onChange={onTimeBasisChange} variant="roundedLight" />
      </HStack>
      <Tooltip
        placement="top-end"
        label={<PoolListItemAprDetailPopoverContent aprData={aprData} weeklyRewards={weeklyRewards} rewardType="" />}
      >
        <SimpleGrid
          gridTemplate={`
          "value tokens" auto
          "line  tokens" auto / .5fr 1fr
        `}
          alignItems={'center'}
          columnGap={3}
        >
          <Text gridArea={'value'} fontSize="xl" fontWeight="medium" color={colors.textPrimary}>
            {formatToRawLocaleStr(toPercentString(aprData.apr))}
          </Text>
          <Box gridArea={'line'}>
            <PoolListItemAprLine aprData={aprData} />
          </Box>
          <Box gridArea="tokens">
            {weeklyRewards.map((r) => (
              <TokenAvatar key={r.token.address} token={r.token} />
            ))}
          </Box>
        </SimpleGrid>
      </Tooltip>
    </Flex>
  )
}
