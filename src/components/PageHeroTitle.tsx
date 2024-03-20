/**
 * used in main page hero part
 */

import { useAppStore } from '@/store'
import { heroGridientColorCSSBlock } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { Text, VStack } from '@chakra-ui/react'

export default function PageHeroTitle({ title, description }: { title: string; description?: string }) {
  const isMobile = useAppStore((s) => s.isMobile)
  return (
    <VStack align="flex-start">
      {isMobile ? null : <Text {...heroGridientColorCSSBlock}>{title}</Text>}
      {description && (
        <Text fontSize={['sm', 'md']} color={colors.textTertiary}>
          {description}
        </Text>
      )}
    </VStack>
  )
}
