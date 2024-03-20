import Button from '@/components/Button'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NewRewardInfo } from '../../type'
import AddRewardItem from './Reward'

export default function RewardAddItem(props: {
  maxRewardCount: number
  rewardInfos: NewRewardInfo[]
  onRewardInfoChange: (rewardInfo: Partial<NewRewardInfo>, index: number) => void
  onAddAnotherReward(): void
  onDeleteReward(index: number): void
  onClickBackButton?(): void
  onClickNextStepButton?(): void
}) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const hasError = props.rewardInfos.some((r) => !r.isValid) || props.rewardInfos.length === 0
  const existsTokens = props.rewardInfos.map((r) => r.token).join(',')
  const tokenFilterFn = useCallback(
    (token: ApiV3Token) => {
      const existsTokenSet = new Set(existsTokens.split(','))
      return !existsTokenSet.has(token.address)
    },
    [existsTokens]
  )

  return (
    <Flex direction="column" w="full" gap={4}>
      {props.rewardInfos.slice(0, props.maxRewardCount).map((rewardInfo, index) => (
        <AddRewardItem
          key={`${index}${rewardInfo.id}`}
          index={index}
          rewardInfo={rewardInfo}
          isDefaultOpen={index === 0}
          onDeleteReward={() => props.onDeleteReward(index)}
          onChange={(rewardInfo) => props.onRewardInfoChange(rewardInfo, index)}
          tokenFilterFn={tokenFilterFn}
        />
      ))}
      {isMobile && (
        <HStack align="center" onClick={props.onAddAnotherReward} cursor="pointer" pb={3}>
          <PlusCircleIcon width="14px" height="14px" />
          <Text color={colors.buttonPrimary} fontSize="sm" fontWeight="500">
            {t('create_farm.add_another_button_text_2')}
          </Text>
        </HStack>
      )}
      <Flex justify="space-between" align="center" gap={3}>
        <Button variant="outline" flexBasis="120px" onClick={props.onClickBackButton}>
          {t('button.back')}
        </Button>
        <Button isDisabled={hasError} flexBasis="300px" onClick={props.onClickNextStepButton}>
          {t('button.next_step')}
        </Button>
      </Flex>
    </Flex>
  )
}
