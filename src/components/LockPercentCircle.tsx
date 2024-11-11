import { CircularProgress, CircularProgressLabel, CircularProgressProps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import Tooltip from '@/components/Tooltip'
import LiquidityLockIcon from '@/icons/misc/LiquidityLockIcon'
import { colors } from '@/theme/cssVariables'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { SvgIcon } from '@/icons/type'

export default function LockPercentCircle({
  value,
  circularProps,
  iconProps
}: {
  value: number
  circularProps?: CircularProgressProps
  iconProps?: SvgIcon
}) {
  const { t } = useTranslation()
  return (
    <Tooltip
      label={t('liquidity.total_locked_position', {
        percent: formatToRawLocaleStr(toPercentString(value, { alreadyPercented: true }))
      })}
    >
      <CircularProgress
        size="16px"
        thickness="8px"
        value={value}
        trackColor="rgba(191, 210, 255, 0.3)"
        color={colors.lightPurple}
        {...circularProps}
      >
        <CircularProgressLabel display="flex" justifyContent="center">
          <LiquidityLockIcon {...iconProps} />
        </CircularProgressLabel>
      </CircularProgress>
    </Tooltip>
  )
}
