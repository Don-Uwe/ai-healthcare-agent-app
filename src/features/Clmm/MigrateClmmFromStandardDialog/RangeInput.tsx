import { Dispatch, SetStateAction, useCallback, useRef } from 'react'
import { Flex, InputGroup, InputLeftElement, NumberInput, NumberInputField } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables/colors'
import { numberRegExp } from '@/utils/numberish/regex'

interface Props {
  priceRange: [string, string]
  priceError?: string
  onPriceChange: Dispatch<SetStateAction<[string, string]>>
  onBlur: (side: 'lower' | 'upper', val: string) => void
}

export default function RangeInput({ priceRange, priceError, onPriceChange, onBlur }: Props) {
  const { t } = useTranslation()
  const changeRef = useRef({ lower: false, upper: false })

  const handleValidate = useCallback((value: string) => {
    return numberRegExp.test(value)
  }, [])

  return (
    <Flex gap={[2, 4]} mt={[2, 0]} flexDirection={['column', 'row']}>
      <InputGroup w="full">
        <InputLeftElement whiteSpace={'nowrap'} left="2" color={colors.textSecondary} pointerEvents="none">
          {t('field.min')}
        </InputLeftElement>
        <NumberInput
          value={priceRange[0]}
          variant={'filledDark'}
          w="full"
          // isInvalid={new Decimal(priceRange[0]).lte(0)}

          isValidCharacter={handleValidate}
          onChange={(val) => {
            onPriceChange((prevVal) => [val, prevVal[1]])
            changeRef.current.lower = true
          }}
          onBlur={() => {
            if (!changeRef.current.lower) return
            changeRef.current.lower = false
            onBlur('lower', priceRange[0])
          }}
        >
          <NumberInputField
            border={priceError === 'lowerPrice' ? '1px solid #cf1515 !important' : ''}
            paddingInlineStart="12"
            paddingInlineEnd="4"
            textAlign="right"
            w="full"
          />
        </NumberInput>
      </InputGroup>

      <InputGroup>
        <InputLeftElement whiteSpace={'nowrap'} left="2" color={colors.textSecondary} pointerEvents="none">
          {t('field.max')}
        </InputLeftElement>
        <NumberInput
          value={priceRange[1]}
          variant={'filledDark'}
          w="full"
          border={priceError === 'upperPrice' ? '1px solid #cf1515 !important' : ''}
          isValidCharacter={handleValidate}
          onChange={(val) => {
            onPriceChange((prevVal) => [prevVal[0], val])
            changeRef.current.upper = true
          }}
          onBlur={() => {
            if (!changeRef.current.upper) return
            changeRef.current.upper = false
            onBlur('upper', priceRange[1])
          }}
        >
          <NumberInputField paddingInlineStart="12" paddingInlineEnd="4" textAlign="right" w="full" />
        </NumberInput>
      </InputGroup>
    </Flex>
  )
}
