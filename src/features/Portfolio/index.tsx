import { useTranslation } from 'react-i18next'
import { Box } from '@chakra-ui/react'
import PageHeroTitle from '@/components/PageHeroTitle'
import SectionMyCreatedFarms, { CreateFarmTabValues } from './components/SectionMyFarms'
import SectionMyPositions, { PositionTabValues } from './components/SectionMyPositions'
import SectionOverview from './components/SectionOverview'
import SectionAcceleraytor from './components/SectionIdo'
import { Desktop } from '@/components/MobileDesktop'
import { AcceleraytorAlertChip } from './AcceleraytorAlertChip'

export type PortfolioPageQuery = {
  section?: 'overview' | 'my-positions' | 'my-created-farm' | 'acceleraytor'
  position_tab?: PositionTabValues
  create_farm_tab?: CreateFarmTabValues
}

export default function Portfolio() {
  const { t } = useTranslation()

  return (
    <Box overflowX="hidden">
      <Desktop>
        <PageHeroTitle title={t('portfolio.hero_title')} />
      </Desktop>
      <AcceleraytorAlertChip />
      <SectionOverview />
      <SectionMyPositions />
      <SectionMyCreatedFarms />
      <SectionAcceleraytor />
      <Box pb={'40px'} />
    </Box>
  )
}
