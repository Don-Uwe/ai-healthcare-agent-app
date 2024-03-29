import { useTranslation } from 'react-i18next'
import { Button } from '@chakra-ui/react'
import HorizontalSwitchSmallIcon from '@/icons/misc/HorizontalSwitchSmallIcon'
import { colors } from '@/theme/cssVariables/colors'

export default function PriceSwitchButton(props: { priceLabel: string; onClickSwitch: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      size="sm"
      variant="capsule-radio"
      fontSize={'xs'}
      color={colors.secondary}
      bg={colors.secondary10}
      onClick={props.onClickSwitch}
      _active={{
        color: colors.secondary
      }}
    >
      {props.priceLabel} {t('common.price')}{' '}
      <HorizontalSwitchSmallIcon
        fill={colors.secondary}
        style={{
          marginLeft: '4px'
        }}
      />
    </Button>
  )
}
