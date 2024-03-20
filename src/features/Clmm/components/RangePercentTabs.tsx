import { Button, HStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables/colors'
import toPercentString from '@/utils/numberish/toPercentString'

const OPTIONS = [0.01, 0.05, 0.1, 0.2, 0.5]

interface Props {
  options?: number[]
  selected?: number
  onClick: (val: number) => void
}

export default function ({ options, selected, onClick }: Props) {
  const { t } = useTranslation()
  const displayOptions = options || OPTIONS

  return (
    <HStack flexWrap="wrap" spacing={[2, 3]}>
      {displayOptions.map((val) => {
        const isSelected = selected === val
        return (
          <Button
            onClick={() => onClick(val)}
            variant="outline"
            size="xs"
            opacity={isSelected ? '1' : '0.5'}
            borderColor={colors.primary}
            bg={isSelected ? colors.backgroundDark : 'inherit'}
            color={isSelected ? colors.textPrimary : colors.textSecondary}
            _hover={isSelected ? { background: colors.backgroundDark } : undefined}
            px={4}
            py={1.5}
            height={'unset'}
            key={`tab-${val}`}
          >
            ± {toPercentString(val, { alreadyPercented: false })}
          </Button>
        )
      })}
      <Button onClick={() => onClick(0)} variant="unstyled" size="xs" color={colors.textTertiary}>
        {t('button.reset')}
      </Button>
    </HStack>
  )
}
