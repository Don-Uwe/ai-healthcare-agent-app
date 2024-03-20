import { FormatCurrencyParams, formatCurrency } from '@/utils/numberish/formatter'
import { Text, TextProps } from '@chakra-ui/react'

export default function PriceText({
  children,
  decimalPlaces,
  ...textProps
}: {
  children: string | number
  decimalPlaces?: number
} & Omit<TextProps, 'children'>) {
  const defaultParams = { symbol: '$', maximumDecimalTrailingZeroes: 5 }
  const mergedParams: FormatCurrencyParams = {
    ...(decimalPlaces !== undefined && { decimalPlaces }),
    ...defaultParams
  }
  const priceText = formatCurrency(children, mergedParams)
  if (priceText.includes('sub')) {
    const matches = priceText.match(/([$]?[\d.]+)<sub title="([$]?[\d.]+)">([\d]+)<\/sub>([\d]+)/)
    if (matches) {
      const [, prevSub, amount, insideSub, afterSub] = matches
      return (
        <Text as={'span'} {...textProps}>
          <span>
            {prevSub}
            <sub title={amount}>{insideSub}</sub>
            {afterSub}
          </span>
        </Text>
      )
    }
    return (
      <Text as={'span'} {...textProps}>
        {children}
      </Text>
    )
  }
  return (
    <Text as={'span'} {...textProps}>
      {priceText}
    </Text>
  )
}
