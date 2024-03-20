import { Box, Flex, Highlight, Image, Text, useClipboard, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Button from '@/components/Button'
import { LiquidityActionModeType } from '@/features/Liquidity/utils'
import CopyIcon from '@/icons/misc/CopyIcon'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'
import { routeToPage } from '@/utils/routeTools'

export default function Done() {
  const { t } = useTranslation()
  const router = useRouter()
  const { onCopy, setValue } = useClipboard('')
  const [mode, setMode] = useState<LiquidityActionModeType>()
  const [ammId, setAmmId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const onBackToPoolsClick = () => {
    routeToPage('pools')
  }

  const onCreateFarmClick = () => {
    routeToPage('create-farm')
  }

  useEffect(() => {
    const { mode, ammId } = router.query as {
      mode: LiquidityActionModeType
      ammId: string | undefined
    }
    setMode(mode)
    setAmmId(ammId)
    Boolean(ammId) && setValue(ammId!)
    setIsLoading(false)
  }, [router])

  if (!isLoading && (mode === undefined || ammId === undefined)) {
    // do something when mode is not 'done' and ammId is undeinfed
    router.push('/liquidity-pools')
    return null
  }

  return (
    <Flex direction="column" w="full" h="full" justify="center" align="center">
      <Image src="/images/done.png" />
      <Box mt={8}>
        <Text fontSize="sm" color={colors.textSecondary} textAlign="center">
          {t('create_standard_pool.note_done')}
        </Text>
        <Flex justify="center" align="center" gap={1}>
          <Text fontSize="sm" color="#8C6EEF" fontWeight="medium">
            <Highlight query={'AMM ID:'} styles={{ color: colors.textSecondary, fontWeight: 'normal' }}>
              {`AMM ID: ` + ammId ?? ''}
            </Highlight>
          </Text>
          <CopyIcon onClick={onCopy} cursor="pointer" />
        </Flex>
      </Box>
      <Text mt={4} fontSize="sm" color={colors.textSecondary} textAlign="center">
        {t('create_standard_pool.note_done_2')}
      </Text>
      <VStack mt="44px">
        <Button minW="220px" size="lg" onClick={onCreateFarmClick}>
          {t('create_standard_pool.button_create_farm')}
        </Button>
        <Button variant="ghost" size="lg" onClick={onBackToPoolsClick}>
          {t('create_standard_pool.button_to_my_pools')}
        </Button>
      </VStack>
    </Flex>
  )
}
