import { Box, Flex, Grid, GridItem, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'

import Steps, { StepsRef } from '@/components/Steps'
import Tabs from '@/components/Tabs'
import { colors } from '@/theme/cssVariables'

import SubPageNote from '../../../components/SubPageNote'

import PanelCard from '@/components/PanelCard'
import { LiquidityActionModeType, tabValueModeMapping } from '@/features/Liquidity/utils'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { useAppStore } from '@/store'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { setUrlQuery } from '@/utils/routeTools'
import { useTranslation } from 'react-i18next'
import CreateMarket from './components/CreateMarket'
import HasId from './components/HasId'
import Initialize from './components/Initialize'

export type CreateTabOptionType = {
  value: 'I have an ID' | 'No ID'
  label: string
}

export default function CreatePool() {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const router = useRouter()
  const [tabValue, setTabValue] = useState<CreateTabOptionType['value'] | undefined>(undefined)

  const createTabOptions: CreateTabOptionType[] = [
    { value: 'I have an ID', label: t('create_standard_pool.have_id') },
    { value: 'No ID', label: t('create_standard_pool.no_id') }
  ]

  const [mode, setMode] = useState<LiquidityActionModeType | undefined>(router.query.mode as LiquidityActionModeType)
  const [marketId, setMarketId] = useState<string | undefined>(undefined)
  const [mints, setMints] = useState<{ mintA: string; mintB: string } | undefined>(undefined)
  const stepsRef = useRef<StepsRef>(null)
  const mintsRef = useRef<{ mintA: string; mintB: string } | undefined>()
  mintsRef.current = mints

  const handleHasIdNext = useCallback((props: { mintA: string; mintB: string }) => {
    stepsRef.current?.goToNext()
    setMints(props)
  }, [])

  const handleTabChange = (value: CreateTabOptionType['value']) => {
    setTabValue(value)
    setUrlQuery({ mode: tabValueModeMapping[value] })
  }

  useEffect(() => {
    const { mode, id } = router.query as {
      mode: LiquidityActionModeType
      id: string | undefined
    }

    setTabValue(mode === 'has_id' ? 'I have an ID' : 'No ID')
    setMode(mode)
    setMarketId(id)

    if (mode === 'init' && !mintsRef.current) {
      // setTabValue('I have an ID')
      setUrlQuery({ mode: 'has_id' })
      // router.replace(router.pathname, { query: { mode: 'has_id' } })
      return
    }
  }, [router.query])

  useEffect(() => {
    stepsRef.current?.setActiveStep(mode === 'init' ? 1 : 0)
  }, [mode])

  const friendlySentence = mode === 'init' ? t('create_standard_pool.friendly_sentence_2') : t('create_standard_pool.friendly_sentence_1')
  return (
    <Grid
      gridTemplate={[
        `
            "back  " auto
            "step  " auto
            "panel " auto
            ".     " minmax(80px, 1fr) / 1fr  
          `,
        `
            "back word " auto
            "step panel" auto
            "note panel" 1fr / ${genCSS2GridTemplateColumns({ rightLeft: 344, center: 468 })}
          `,
        `
            "back word  ." auto
            "step panel ." auto
            "note panel ." 1fr / ${genCSS3GridTemplateColumns({ rightLeft: 344, center: 468 })}
          `
      ]}
      columnGap={[0, 24]}
      rowGap={[4, 4]}
      mt={[2, 8]}
    >
      {/* left */}
      <GridItem area={'back'}>
        <Flex>
          <HStack
            cursor="pointer"
            onClick={() => {
              router.push({
                pathname: '/liquidity-pools'
              })
            }}
            color={colors.textTertiary}
            fontWeight="500"
            fontSize={['md', 'xl']}
          >
            <ChevronLeftIcon />
            <Text>{t('common.back')}</Text>
          </HStack>
        </Flex>
      </GridItem>

      <GridItem area="step">
        <Box w={['unset', 'clamp(300px, 100%, 500px)']} px={[6, 0]}>
          <Steps
            variant={isMobile ? 'row-title' : 'column-list'}
            steps={[
              { title: t('create_standard_pool.step_1'), description: t('create_standard_pool.step_1_name') },
              { title: t('create_standard_pool.step_2'), description: t('create_standard_pool.step_2_name') }
            ]}
            ref={stepsRef}
          />
        </Box>
      </GridItem>

      <GridItem area="note">
        <Box
          w={['unset', 'clamp(300px, 100%, 500px)']}
          position={['absolute', 'unset']}
          left={'20px'}
          right={'20px'}
          bottom={'calc(20px + 54px)' /* 54px is mobile bottom nav's height */}
          zIndex={100}
        >
          <SubPageNote
            canInteract={isMobile}
            title={t('create_standard_pool.please_note')}
            description={
              <Text fontSize="sm" color={colors.textTertiary}>
                {t('create_standard_pool.please_note_des')} <Link isExternal>{t('create_standard_pool.please_note_des_link')}</Link>
              </Text>
            }
          />
        </Box>
      </GridItem>

      <GridItem area="word" display={['none', 'unset']}>
        <Flex justify="center">
          <Text whiteSpace={'pre-line'} w="fit-content" cursor="pointer" color={colors.textSecondary} fontWeight="500" fontSize="xl">
            {friendlySentence}
          </Text>
        </Flex>
      </GridItem>

      <GridItem area="panel">
        <PanelCard bg={'transparent'} overflow={'hidden'}>
          <VStack spacing={4}>
            {mode === 'init' ? (
              <Initialize onGoBack={stepsRef.current?.goToPrevious} marketId={marketId} mintA={mints?.mintA} mintB={mints?.mintB} />
            ) : (
              <Box bg={colors.backgroundLight30} overflow="hidden" w="full">
                <Tabs isFitted items={createTabOptions} size="md" variant="folder" value={tabValue} onChange={handleTabChange} />
                {mode === 'has_id' ? <HasId marketId={marketId} onNextStep={handleHasIdNext} /> : <CreateMarket />}
              </Box>
            )}
          </VStack>
        </PanelCard>
      </GridItem>
    </Grid>
  )
}
