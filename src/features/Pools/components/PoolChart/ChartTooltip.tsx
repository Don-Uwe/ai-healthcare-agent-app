import { Box } from '@chakra-ui/react'
import { TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/src/component/DefaultTooltipContent'

import { toUTC } from '@/utils/date'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { colors } from '@/theme/cssVariables'

export default function ChartTooltip({ active, payload, label, category }: TooltipProps<ValueType, NameType> & { category?: string }) {
  const unit = 'USD'
  if (active && payload && payload.length) {
    return (
      <Box bg={colors.backgroundLight} rounded="12px" px="14px" py={3}>
        <Box color={colors.textTertiary} fontSize="xs">
          {category}
        </Box>
        {payload.map((item, idx) => {
          return (
            <Box key={`payload-${item.name}-${idx}`} color={colors.textPrimary} fontSize="16px">
              <Box>{`${toUsdVolume(item.value as string)} ${unit}`}</Box>
            </Box>
          )
        })}
        <Box color={colors.textTertiary} fontSize="xs">
          {toUTC(label, { showTime: false, showUTCBadge: false })}
        </Box>
      </Box>
    )
  }

  return null
}
