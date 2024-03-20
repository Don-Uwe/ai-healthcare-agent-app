import { Grid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import ExclaimationOctagon from '@/icons/misc/ExclaimationOctagon'
import { colors } from '@/theme/cssVariables'
import { panelCard } from '@/theme/cssBlocks'

export default function StakeableHint() {
  const { t } = useTranslation()
  return (
    <Grid
      {...panelCard}
      templateColumns={'27px 1fr'}
      bg={colors.backgroundTransparent10}
      color={colors.textSecondary}
      borderRadius="8px"
      py={2}
      px={5}
    >
      <ExclaimationOctagon style={{ marginTop: '4px' }} />
      <Text fontSize="sm" fontWeight="medium">
        {t('liquidity.stakeable_hint')}
      </Text>
    </Grid>
  )
}
