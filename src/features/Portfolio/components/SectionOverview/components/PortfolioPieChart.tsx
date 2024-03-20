import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { Box } from '@chakra-ui/react'

export const PORTFOLIO_PIE_COLORS = [colors.chart03, colors.chart04, colors.chart08, colors.chart05, colors.chart06]
export const IDLE_TOKENS_COLORS = [colors.chart09, colors.chart03]

//note this chart panel can only handle one data key for current version
export default function PortfolioPieChart<D extends Record<string, any>>({
  data,
  valueDataKey,
  roundCenterLabel,
  palette = PORTFOLIO_PIE_COLORS
}: {
  data: D[] | undefined
  valueDataKey: keyof D & string
  pieOutterRadius?: number
  pieInnerRadius?: number
  height?: number
  roundCenterLabel?: string
  palette?: string[]
}) {
  const isMobile = useAppStore((s) => s.isMobile)
  const valueData = data && data.length ? data : [{ [valueDataKey]: 100 }]
  return (
    <Box width="100%" height="120px">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey={valueDataKey}
            data={valueData}
            innerRadius="70%"
            outerRadius="100%"
            fill="#8884d8"
            paddingAngle={0}
            startAngle={90}
            endAngle={-270}
          >
            {valueData?.length ? (
              valueData.map((entry, index) => <Cell key={`cell-${index}`} fill={palette[index % palette.length]} stroke="" />)
            ) : (
              <Cell fill="#abc4ff1a" stroke="" />
            )}
            {roundCenterLabel && (
              <Label
                value={roundCenterLabel}
                position="center"
                style={{ fill: colors.textPrimary, fontSize: isMobile ? '16px' : '20px' }}
              />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}
