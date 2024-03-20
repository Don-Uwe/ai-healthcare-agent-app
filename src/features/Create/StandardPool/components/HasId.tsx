import { useCallback, useState } from 'react'
import { Flex, Input, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import Button from '@/components/Button'
import { colors } from '@/theme/cssVariables'
import { useCreateMarketStore } from '@/store/useCreateMarketStore'
import { useTranslation } from 'react-i18next'

type HasIdProps = {
  marketId?: string
  onNextStep?: (props: { mintA: string; mintB: string }) => void
}

export default function HasId({ marketId, onNextStep }: HasIdProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const checkMarketAct = useCreateMarketStore((s) => s.checkMarketAct)
  const [currentMarketId, setCurrentMarketId] = useState(marketId)

  const onIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMarketId(event.target.value)
  }

  const onContinue = useCallback(async () => {
    if (!currentMarketId) return
    const { isValid, mintA, mintB } = await checkMarketAct(currentMarketId)
    if (!isValid) return

    onNextStep?.({ mintA: mintA!, mintB: mintB! })
    router.push(
      {
        query: {
          ...router.query,
          mode: 'init',
          id: currentMarketId
        }
      },
      undefined,
      { shallow: true }
    )
  }, [onNextStep, router, checkMarketAct, currentMarketId])

  return (
    <VStack bg={colors.backgroundLight} p={6} spacing={6}>
      <Text fontSize="sm" color={colors.textSecondary}>
        {t('create_standard_pool.enter_open_book_market_id')}:
      </Text>

      <Flex w="full" direction="column" bg={colors.backgroundDark} py={3} px={4} color={colors.textSecondary} borderRadius="12px" gap={2}>
        <Text fontSize="xs" color={colors.textTertiary}>
          {t('create_standard_pool.market_id')}
        </Text>
        <Input variant="clean" value={currentMarketId} onChange={onIdChange} />
      </Flex>
      <Text fontSize="sm" color={colors.textTertiary}>
        {t('create_standard_pool.note_has_id')}
      </Text>
      <Button isDisabled={!currentMarketId} w="full" onClick={onContinue}>
        {t('button.continue')}
      </Button>
    </VStack>
  )
}
