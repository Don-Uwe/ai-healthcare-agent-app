import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from '@chakra-ui/react'
import DecimalInput from '@/components/DecimalInput'
import { colors } from '@/theme/cssVariables'
import PlusIcon from '@/icons/misc/PlusIcon'
import MinusIcon from '@/icons/misc/MinusIcon'

export enum Side {
  Left = 'left',
  Right = 'right'
}
interface Props {
  priceRange: string[]
  decimals: number
  disabled?: boolean
  postfix?: ReactNode
  onLeftBlur: (val: string) => void
  onRightBlur: (val: string) => void
  onInputChange: (val: string, _: number, side?: string) => void
  onClickAdd?: (side: Side, isAdd: boolean) => void
}

const inputSx = {
  flexDirection: 'column',
  alignItems: 'flex-start'
}

const iconSx = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  h: 'full'
}

export default function RangeInput(props: Props) {
  const { priceRange, decimals, disabled, postfix, onLeftBlur, onRightBlur, onInputChange, onClickAdd } = props
  const { t } = useTranslation()
  return (
    <Flex justifyContent="center" flexDirection={['column', 'row']} gap={['2', '5']}>
      <Flex flex="1">
        <DecimalInput
          disabled={disabled}
          title={
            <Text as="span" userSelect={'none'} whiteSpace={'nowrap'} color={colors.textTertiary} fontSize={'xs'} w={'3em'}>
              {t('field.min')}
            </Text>
          }
          prefix={
            <Text as="span" mr="1" {...iconSx} onClick={() => onClickAdd?.(Side.Left, false)}>
              <MinusIcon color={colors.textLink} />
            </Text>
          }
          postfix={
            <Text as="span" fontSize="xs" whiteSpace="nowrap" color={colors.textTertiary}>
              {postfix}
            </Text>
          }
          rightAddOn={
            <Text as="span" ml="2" {...iconSx} onClick={() => onClickAdd?.(Side.Left, true)}>
              <PlusIcon color={colors.textLink} />
            </Text>
          }
          postFixInField
          variant="filledDark"
          inputSx={{ px: '8px' }}
          inputGroupSx={{
            userSelect: 'none',
            display: 'flex',
            ml: '8px',
            bg: colors.backgroundDark,
            alignItems: 'center',
            borderRadius: 'xl'
          }}
          side={Side.Left}
          value={priceRange[0]}
          ctrSx={inputSx}
          decimals={Math.max(8, decimals)}
          onBlur={onLeftBlur}
          onChange={onInputChange}
        />
      </Flex>
      <Flex flex="1">
        <DecimalInput
          disabled={disabled}
          title={
            <Text as="span" color={colors.textTertiary} userSelect={'none'} whiteSpace={'nowrap'} fontSize={'xs'} w={'3em'}>
              {t('field.max')}
            </Text>
          }
          prefix={
            <Text as="span" mr="1" {...iconSx} fontSize={'lg'} onClick={() => onClickAdd?.(Side.Right, false)}>
              <MinusIcon color={colors.textLink} />
            </Text>
          }
          postfix={
            <Text as="span" fontSize="xs" whiteSpace="nowrap" color={colors.textTertiary}>
              {postfix}
            </Text>
          }
          postFixInField
          rightAddOn={
            <Text as="span" ml="2" {...iconSx} onClick={() => onClickAdd?.(Side.Right, true)}>
              <PlusIcon color={colors.textLink} />
            </Text>
          }
          variant="filledDark"
          inputSx={{ px: '8px', w: '100%' }}
          inputGroupSx={{
            userSelect: 'none',
            display: 'flex',
            ml: '8px',
            bg: colors.backgroundDark,
            alignItems: 'center',
            borderRadius: 'xl'
          }}
          side={Side.Right}
          value={priceRange[1]}
          ctrSx={inputSx}
          decimals={Math.max(8, decimals)}
          onBlur={onRightBlur}
          onChange={onInputChange}
        />
      </Flex>
    </Flex>
  )
}
