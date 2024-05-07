import { Box, Flex, Grid, GridItem, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { colors } from '@/theme/cssVariables'
import SubPageNote from '../../../components/SubPageNote'
import PanelCard from '@/components/PanelCard'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { useAppStore } from '@/store'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { useTranslation, Trans } from 'react-i18next'
import Initialize from './components/Initialize'

export default function CreatePool() {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Grid
      gridTemplate={[
        `
            "back  " auto
            "panel " auto
            ".     " minmax(80px, 1fr) / 1fr  
          `,
        `
            "back word " auto
            "note panel" 1fr / ${genCSS2GridTemplateColumns({ rightLeft: 344, center: 468 })}
          `,
        `
            "back word  ." auto
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
                <Trans i18nKey="create_standard_pool.please_note_des">
                  <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
                    CLMM
                  </Link>
                  <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool" isExternal>
                    Standard
                  </Link>
                </Trans>
              </Text>
            }
          />
        </Box>
      </GridItem>

      <GridItem area="word" display={['none', 'unset']}>
        <Flex justify="left">
          <Text whiteSpace={'pre-line'} w="fit-content" cursor="pointer" color={colors.textSecondary} fontWeight="500" fontSize="xl">
            {t('create_standard_pool.step_2_name')}
          </Text>
        </Flex>
      </GridItem>

      <GridItem area="panel">
        <PanelCard bg={'transparent'} overflow={'hidden'}>
          <VStack spacing={4}>
            <Initialize />
          </VStack>
        </PanelCard>
      </GridItem>
    </Grid>
  )
}
