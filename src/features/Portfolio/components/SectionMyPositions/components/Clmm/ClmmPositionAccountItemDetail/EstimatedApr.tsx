import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import Tabs from '@/components/Tabs'
import { aprColors } from '@/features/Pools/components/PoolListItemAprLine'
import { AprKey, TimeAprData, TimeBasisOptionType, timeBasisOptions } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { AprData } from '@/features/Clmm/utils/calApr'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type EstimatedAprProps = {
  timeBasis: AprKey
  aprData: AprData
  onTimeBasisChange?: (val: AprKey) => void
  timeAprData: TimeAprData
  defaultTimeBasis?: TimeBasisOptionType['value']
  isMobile?: boolean
  poolId: string
}

export default function EstimatedApr({ aprData, isMobile, timeBasis, onTimeBasisChange, poolId }: EstimatedAprProps) {
  const { t } = useTranslation()

  const tradeFee = aprData.fee
  const rewards = [{ ...tradeFee, mint: undefined as ApiV3Token | undefined }, ...aprData.rewards]

  return (
    <HStack
      flex={1}
      mb={isMobile ? 3 : 0}
      flexDirection={isMobile ? 'column' : 'row'}
      alignItems="start"
      justify="space-between"
      fontSize="sm"
    >
      <Flex flexDirection="column" gap={[1, 2]} width="160px" justifyContent="space-between">
        {rewards.map(({ percentInTotal: percent, mint }, idx) => (
          <Flex key={mint ? mint.address : 'tradefee' + poolId} justifyContent="space-between">
            <Flex alignItems="center">
              <Box
                key={idx}
                style={{
                  width: '7px',
                  height: '7px',
                  left: '0px',
                  top: '6px',
                  background: aprColors[idx],
                  borderRadius: '10px'
                }}
              />
              <Text ml={1.5} color={colors.lightPurple}>
                {mint ? mint.symbol : t('field.trade_fees')}
              </Text>
            </Flex>
            <Text color={colors.textPrimary}>{formatToRawLocaleStr(toPercentString(percent))}</Text>
          </Flex>
        ))}
      </Flex>
      {<Tabs value={timeBasis} items={timeBasisOptions} onChange={onTimeBasisChange} size="xs" variant="roundedLight" />}
    </HStack>
  )
}
