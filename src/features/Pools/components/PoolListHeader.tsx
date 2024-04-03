import SortUpDownArrow from '@/components/SortUpDownArrow'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, Hide, useColorMode } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { poolListGrid } from '../cssBlocks'
import { TimeBase, POOL_SORT_KEY } from '../util'

export function PoolListHeader({
  sortKey,
  order,
  timeBase,
  handleClickSort
}: {
  sortKey: string
  order: number
  handleClickSort: (key: string) => void
  timeBase: TimeBase
}) {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'

  return (
    <Flex
      w="100%"
      alignItems="center"
      backgroundColor={isLight ? colors.backgroundDark50 : colors.backgroundLight30}
      borderRadius="12px 12px 0 0"
      color={isLight ? colors.textPrimary : colors.textSecondary}
      fontWeight={500}
      px={[4, 6]}
      py={4}
      whiteSpace={'nowrap'}
      sx={poolListGrid}
      fontSize={['sm', 'md']}
    >
      <Box pl={[0, 4 + 6]}>{t('liquidity.pool')}</Box>

      <Hide below="sm">
        <Flex
          justifyContent={'end'}
          alignItems="center"
          gap="1"
          cursor="pointer"
          onClick={() => handleClickSort('liquidity')}
          justify="flex-start"
        >
          {t('liquidity.title')}
          {sortKey === POOL_SORT_KEY.liquidity ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
      </Hide>

      <Flex justifyContent={'end'} alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('volume')}>
        {t(`field.${timeBase}_volume`)}
        {sortKey === POOL_SORT_KEY.volume ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
      </Flex>

      <Hide below="sm">
        <Flex justifyContent={'end'} alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('fee')}>
          {t(`field.${timeBase}_fees`)}
          {sortKey === POOL_SORT_KEY.fee ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
        </Flex>
      </Hide>

      <Flex alignItems="center" gap="1" cursor="pointer" onClick={() => handleClickSort('apr')}>
        {t(`field.${timeBase}_apr`)}
        {sortKey === POOL_SORT_KEY.apr ? <SortUpDownArrow width="12px" height="12px" isDown={Boolean(order)} /> : null}
      </Flex>
      <Box />
    </Flex>
  )
}
