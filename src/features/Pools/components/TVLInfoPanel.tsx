import { Box, HStack, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import toUsdVolume from '@/utils/numberish/toUsdVolume'

export default function TVLInfoPanel({ tvl, volume }: { tvl: string | number; volume: string | number }) {
  const { t } = useTranslation()
  return (
    <HStack spacing={5}>
      <TVLInfoItem name={t('common.tvl')} value={tvl} decoratorImageSrc="/images/tvl-lock.svg" />
      <TVLInfoItem name={t('common.24h_volume')} value={volume} decoratorImageSrc="/images/volume-total.svg" />
    </HStack>
  )
}

function TVLInfoItem({ name, value, decoratorImageSrc }: { name: string; value: string | number; decoratorImageSrc?: string }) {
  return (
    <Box backgroundColor={colors.backgroundLight} borderRadius={8} display="flex" overflow="hidden">
      <Box pl={3} pr={0} py={2}>
        <Text fontSize="sm" color={colors.textSecondary}>
          {name}
        </Text>
        <Text fontSize="18px" fontWeight={500} color={colors.textSecondary}>
          {toUsdVolume(value)}
        </Text>
      </Box>
      <Image alignSelf="end" width="70px" objectFit="cover" alt="TVL image" src={decoratorImageSrc}></Image>
    </Box>
  )
}

export function TVLInfoPanelMobile({ tvl, volume }: { tvl: string | number; volume: string | number }) {
  const { t } = useTranslation()
  return (
    <HStack
      justifyContent="space-between"
      background={colors.backgroundLight}
      py={2}
      color={colors.textSecondary}
      px={appLayoutPaddingX}
      lineHeight={1}
    >
      <HStack>
        <Text fontSize="sm" fontWeight={400}>
          {t('common.tvl')}
        </Text>
        <Text fontSize="md" fontWeight={500}>
          {toUsdVolume(tvl)}
        </Text>
      </HStack>

      <HStack>
        <Text fontSize="sm" fontWeight={400}>
          {t('common.volume')}
        </Text>
        <Text fontSize="md" fontWeight={500}>
          {toUsdVolume(volume)}
        </Text>
      </HStack>
    </HStack>
  )
}
