import { Flex, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import Button from '@/components/Button'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'

type PendingYieldProps = {
  pendingYield?: string
  rewardTokens: ApiV3Token[]
  isLoading?: boolean
  onHarvest: () => void
}

export default function PendingYield({ isLoading, onHarvest, pendingYield, rewardTokens }: PendingYieldProps) {
  const { t } = useTranslation()
  return (
    <SimpleGrid
      flex={1}
      bg={colors.backgroundDark}
      w="full"
      borderRadius="12px"
      p={4}
      gap={2}
      fontSize="sm"
      gridTemplate={`
        "title  title" auto
        "volumn btn  " auto / 1fr .7fr
      `}
      alignItems="center"
    >
      <Text gridArea={'title'} color={colors.textSecondary}>
        {t('portfolio.section_positions_clmm_account_pending_yield')}
      </Text>
      <Button isLoading={isLoading} onClick={onHarvest} gridArea={'btn'} justifySelf={'end'} size="sm" variant="outline">
        {t('portfolio.section_positions_clmm_account_pending_yield_button')}
      </Button>
      <HStack gridArea={'volumn'}>
        <Text fontSize="xl" fontWeight="medium" color={colors.textPrimary}>
          {pendingYield ?? '$0'}
        </Text>
        <QuestionToolTip
          label={t('portfolio.section_positions_clmm_account_pending_yield_tooltip')}
          iconType="info"
          iconProps={{ width: 18, height: 18, fill: colors.textSecondary }}
        />
        <Flex>
          {rewardTokens.map((token) => (token ? <TokenAvatar key={`reward-token-${token.address}`} token={token} mr={'-4px'} /> : null))}
        </Flex>
      </HStack>
    </SimpleGrid>
  )
}
