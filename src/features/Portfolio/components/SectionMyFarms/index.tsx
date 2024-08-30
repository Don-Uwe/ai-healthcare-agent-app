import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, GridItem, Heading, useDisclosure } from '@chakra-ui/react'
import Button from '@/components/Button'
import { CreatePoolEntryDialog } from '@/features/Create/components/CreatePoolEntryDialog'
import useCreatedFarmInfo, { FarmCategory } from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import useFetchFarmInfoById from '@/hooks/farm/useFetchFarmInfoById'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import { useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import FarmItem from './components/FarmItem'

export type CreateFarmTabValues = FarmCategory

export default function SectionMyCreatedFarms() {
  const { t } = useTranslation()
  const [filterType] = useStateWithUrl(FarmCategory.All, 'create_farm_tab', {
    fromUrl: (v) => v,
    toUrl: (v) => v
  })
  const publicKey = useAppStore((s) => s.publicKey)
  const { formattedData } = useCreatedFarmInfo({ owner: publicKey })
  const hasCreatedFarm = Boolean(formattedData?.length)

  const filteredData = useMemo(
    () => (filterType === FarmCategory.All ? formattedData : formattedData.filter((f) => f.type === filterType)),
    [formattedData, filterType]
  )
  const { formattedDataMap: farmDataMap } = useFetchFarmInfoById({
    idList: filteredData.filter((f) => f.type === FarmCategory.Standard).map((f) => f.id)
  })
  const { formattedDataMap } = useFetchPoolById({
    idList: filteredData.map((d) => d.id)
  })
  const { isOpen: isCreatePoolDialogOpen, onOpen: openCreatePoolDialog, onClose: closeCreatePoolDialog } = useDisclosure()

  if (!hasCreatedFarm) return null
  return (
    <Box pt="20px">
      <Grid
        flexGrow={1}
        gridTemplate={[
          `
          "title  .     " auto
          "tabs   action" auto / 1fr 1fr
        `,
          `
          "title title " auto
          "tabs  action" auto / 1fr 1fr
        `
        ]}
        columnGap={3}
        rowGap={[3, 2]}
        mb={3}
        mt={6}
        alignItems={'center'}
      >
        <GridItem area={'title'}>
          <Heading id="my-created-farm" fontSize={['lg', 'xl']} fontWeight="500" color={colors.textPrimary}>
            {t('portfolio.section_my_created_farms')}
          </Heading>
        </GridItem>
        {/* <GridItem area="tabs" justifySelf={'left'}>
          <Desktop>
            <Tabs size="md" variant="rounded" items={farmCategoryOptions} onChange={onTabChange} value={filterType} />
          </Desktop>
          <Mobile>
            <Select variant="roundedFilledFlowDark" items={farmCategoryOptions} onChange={onTabChange} value={filterType} />
          </Mobile>
        </GridItem> */}
        <GridItem area={'action'} justifySelf={'right'}>
          <>
            <Button onClick={openCreatePoolDialog} size={['sm', 'md']}>
              {t('farm.create')}
            </Button>
            <CreatePoolEntryDialog isOpen={isCreatePoolDialogOpen} onClose={closeCreatePoolDialog} defaultType="standard-farm" />
          </>
        </GridItem>
      </Grid>

      <Flex direction="column" gap={4} mt={4}>
        {filteredData
          .filter((farm) => {
            return farm.type !== FarmCategory.Clmm || formattedDataMap[farm.id]?.formattedRewardInfos.length != 0
          })
          .map((farm) => (
            <FarmItem key={`farm-${farm.id}`} {...farm} standardFarm={farmDataMap[farm.id]} clmmData={formattedDataMap[farm.id]} />
          ))}
      </Flex>
    </Box>
  )
}
