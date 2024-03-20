import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import Tabs from '@/components/Tabs'
import { TimeBasisOptionType, timeBasisOptions } from '@/hooks/pool/type'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import toPercentString from '@/utils/numberish/toPercentString'
import { AprData } from '@/features/Clmm/utils/calApr'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts'

export const PORTFOLIO_PIE_COLORS = [colors.chart03, colors.chart04, colors.chart02, colors.chart05, colors.chart06]

interface Props {
  aprData?: AprData
  value: TimeBasisOptionType['value']
  onChange: (val: TimeBasisOptionType['value']) => void
}

export default function EstimatedAprInfo({ aprData, value, onChange }: Props) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()

  return (
    <Box borderRadius="xl" borderWidth="1px" borderColor={colors.backgroundTransparent07} p={[2, 4]}>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <HStack>
          <Text fontSize={['sm', 'md']} fontWeight="500" color={colors.textSecondary}>
            {t('common.estimated_APR')}
          </Text>
          <AprMDSwitchWidget />
        </HStack>
        <Tabs variant="squarePanelDark" tabItemSX={{ fontSize: ['xs', 'sm'] }} value={value} onChange={onChange} items={timeBasisOptions} />
      </Flex>
      <Flex gap="3" alignItems="center">
        {!isMobile && (
          <Text fontWeight="500" size="lg">
            {toPercentString(aprData?.apr || 0)}
          </Text>
        )}
        <Box>
          <ResponsiveContainer width={isMobile ? 90 : 60} height={isMobile ? 90 : 60}>
            <PieChart>
              <Pie
                data={aprData ? [aprData.fee, ...aprData.rewards] : []}
                innerRadius={isMobile ? '75%' : '60%'}
                outerRadius="100%"
                fill="#8884d8"
                paddingAngle={0}
                dataKey="percentInTotal"
                startAngle={90}
                endAngle={450}
                stroke=""
              >
                {aprData &&
                  aprData.rewards.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PORTFOLIO_PIE_COLORS[index % PORTFOLIO_PIE_COLORS.length]} stroke="" />
                  ))}
                {isMobile && (
                  <Label
                    value={toPercentString(aprData?.apr || 0, { decimals: 1 })}
                    position="center"
                    style={{ fill: colors.textPrimary, fontSize: '14px', fontWeight: 500 }}
                  />
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Flex flexWrap={'wrap'} columnGap={[2, 4]} rowGap={1}>
          {aprData?.fee ? (
            <Flex alignItems="center" gap="2" fontSize="sm" color={colors.textTertiary}>
              <Box w="7px" h="7px" bg={PORTFOLIO_PIE_COLORS[0]} rounded={'full'} />
              {t('field.trade_fees')}{' '}
              <Text color={colors.textPrimary} fontWeight="500">
                {toPercentString(aprData.fee.apr || 0)}
              </Text>
            </Flex>
          ) : null}
          {aprData?.rewards.map((d, idx) => (
            <Flex key={d.mint?.address || 'fees'} alignItems="center" gap="2" fontSize="sm" color={colors.textTertiary}>
              <Box w="7px" h="7px" bg={PORTFOLIO_PIE_COLORS[(idx + 1) % PORTFOLIO_PIE_COLORS.length]} rounded={'full'} />
              <Text color={colors.textPrimary} fontWeight="500">
                {toPercentString(d.apr)}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
