import { useAppStore } from '@/store'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { Text, TextProps } from '@chakra-ui/react'

/** it is a text */
export default function UsdVolume({
  children,
  decimals,
  ...textProps
}: {
  children: string | number
  decimals?: number
} & Omit<TextProps, 'children'>) {
  const isMobile = useAppStore((s) => s.isMobile)
  return (
    <Text as={'span'} {...textProps}>
      {toUsdVolume(children, { useShorterExpression: isMobile, decimals })}
    </Text>
  )
}
