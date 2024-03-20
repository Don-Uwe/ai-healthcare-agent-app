import AprMDSwitchWidget from '@/components/AprMDSwitchWidget'
import Tabs from '@/components/Tabs'
import { toAPRPercent } from '@/features/Pools/util'
import { TimeAprData, TimeBasisOptionType, TotalApr, timeBasisOptions } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables/colors'
import toPercentString from '@/utils/numberish/toPercentString'
import { Box, Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

export const PORTFOLIO_PIE_COLORS = [colors.chart03, colors.chart04, colors.chart02, colors.chart05, colors.chart06]

interface Props {
  aprData?: TimeAprData
  totalApr?: TotalApr
  value: TimeBasisOptionType['value']
  onChange: (val: TimeBasisOptionType['value']) => void
}

export default function AprInfo({ aprData, totalApr, value, onChange }: Props) {
  const { t } = useTranslation()
  const data = aprData?.[value] || []
  const apr = totalApr?.[value] || 0

  return (
    <Box py={[2, 4]}>
      <Flex justifyContent="space-between" alignItems="center">
        <HStack>
          <Text fontSize={'md'} fontWeight="500" color={colors.textPrimary}>
            {t('common.estimated_APR')}
          </Text>
          <AprMDSwitchWidget />
        </HStack>
        <Tabs
          variant="squarePanelDark"
          tabItemSX={{ fontSize: ['xs', 'sm'], opacity: 1, color: colors.textSeptenary, _selected: { color: colors.textSeptenary } }}
          value={value}
          onChange={onChange}
          items={timeBasisOptions}
        />
      </Flex>
      <SimpleGrid
        gap="3"
        py="2"
        px="4"
        mt="2"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={colors.backgroundTransparent07}
        alignItems="center"
        bg={colors.backgroundTransparent10}
        templateColumns={'repeat(auto-fit, minmax(100px, 1fr))'}
        columnGap={[2, 4]}
        rowGap={1}
      >
        <HStack>
          <Text fontWeight="500" size="lg">
            {toAPRPercent(apr)}
          </Text>
          <Box>
            <ResponsiveContainer width={40} height={40}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={'60%'}
                  outerRadius="100%"
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="apr"
                  startAngle={90}
                  endAngle={450}
                >
                  {data &&
                    data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PORTFOLIO_PIE_COLORS[index % PORTFOLIO_PIE_COLORS.length]} stroke="" />
                    ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </HStack>
        {data.map((d, idx) => (
          <Flex key={d.token?.address || 'fees'} alignItems="center" gap={[1.5, 2]} fontSize="sm" color={colors.textTertiary}>
            <Box w="7px" h="7px" bg={PORTFOLIO_PIE_COLORS[idx % PORTFOLIO_PIE_COLORS.length]} rounded={'full'} />
            {d.isTradingFee ? t('field.trade_fees') : d.token!.symbol}{' '}
            <Text color={colors.textPrimary} fontWeight="500">
              {toPercentString(d.apr)}
            </Text>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  )
}
