import TokenInput from '@/components/TokenInput'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, HStack, Text, useDisclosure } from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { useMemo } from 'react'

import { useEvent } from '@/hooks/useEvent'
import { parseDateInfo } from '@/utils/date'
import FarmDatePickerModal from '@/components/FarmDatePickerModal'
import { NewRewardInfo } from '../../type'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

type RewardBodyProps = {
  rewardInfo: NewRewardInfo
  onChange: (rewardInfo: NewRewardInfo) => void
  tokenFilterFn: (token: ApiV3Token) => boolean
}

export default function RewardBody({ rewardInfo, tokenFilterFn, onChange }: RewardBodyProps) {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { t } = useTranslation()

  const onTokenChange = useEvent((token: TokenInfo | ApiV3Token) => {
    onChange({ ...rewardInfo, token })
  })
  const onAmountChange = useEvent((valNumber: string) => {
    const durations = rewardInfo.farmEnd && rewardInfo.farmStart ? rewardInfo.farmEnd - rewardInfo.farmStart : undefined
    const newPerWeek = durations ? new Decimal(valNumber || 0).div(durations / (60 * 60 * 24 * 1000 * 7)).toString() : undefined
    onChange({ ...rewardInfo, amount: valNumber, perWeek: newPerWeek })
  })
  const handleRewardTimeChange = useEvent((startTime: number, endTime: number) => {
    const amount = rewardInfo.amount
    const durations = endTime && startTime ? endTime - startTime : undefined
    const newPerWeek = durations && amount ? new Decimal(amount).div(durations / (60 * 60 * 24 * 1000 * 7)).toString() : undefined
    onChange({ ...rewardInfo, farmStart: startTime, farmEnd: endTime, perWeek: newPerWeek })
    onClose()
  })
  const farmStartTimeInfo = useMemo(() => parseDateInfo(rewardInfo.farmStart), [rewardInfo.farmStart])
  const farmEndTimeInfo = useMemo(() => parseDateInfo(rewardInfo.farmEnd), [rewardInfo.farmEnd])

  return (
    <Box>
      <Text fontWeight="500" fontSize={['sm', 'md']} color={colors.textTertiary} mt={[1, 2]}>
        {t('create_farm.add_reward_token')}
      </Text>
      <Flex direction="column" gap={4} mt={[4, 7]}>
        <TokenInput
          hideControlButton
          token={rewardInfo.token}
          value={rewardInfo.amount?.toString()}
          onTokenChange={onTokenChange}
          onChange={onAmountChange}
          filterFn={tokenFilterFn}
        />
        <Box borderRadius="12px" bg={colors.backgroundDark} py={3} px={[4, 6]}>
          {!rewardInfo.farmStart ? (
            <>
              <Flex justify={'space-between'} mb={2}>
                <Text fontSize="xs" fontWeight={300} color={colors.textTertiary}>
                  {t('edit_farm.farming_start')}
                </Text>
                <Text fontSize="xs" fontWeight={300} color={colors.textTertiary}>
                  {t('edit_farm.farming_end')}
                </Text>
              </Flex>
              <Flex
                cursor="pointer"
                onClick={onOpen}
                bg={colors.backgroundTransparent07}
                borderRadius="4px"
                justify="center"
                align="center"
                py={2}
              >
                <Text fontWeight="medium" fontSize="xl">
                  {t('common.select')}
                </Text>
              </Flex>
            </>
          ) : (
            <HStack justifyContent="space-between">
              <Box cursor="pointer" onClick={onOpen}>
                <Text fontSize="xs" fontWeight={300} color={colors.textTertiary}>
                  {t('edit_farm.farming_start')}
                </Text>
                <Text fontSize="md" fontWeight={500} color={colors.textPrimary} my={1} mb={2}>
                  {`${farmStartTimeInfo.year}/${farmStartTimeInfo.month}/${farmStartTimeInfo.day}`}
                </Text>
                <Text fontSize="xs" color={colors.textSecondary}>
                  {`${farmStartTimeInfo.hour}:${farmStartTimeInfo.minutes} (UTC)`}
                </Text>
              </Box>
              {rewardInfo.farmStart && rewardInfo.farmEnd ? (
                <Flex flexGrow={1} align={'center'}>
                  <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                  <Box rounded="md" bg={colors.backgroundLight} py={1.5} px={[4, 10]} cursor="pointer" onClick={onOpen}>
                    <Text fontWeight="500" fontSize="sm">
                      {(rewardInfo.farmEnd - rewardInfo.farmStart) / (60 * 60 * 24 * 1000)} Days
                    </Text>
                  </Box>
                  <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                </Flex>
              ) : null}
              <Box textAlign="right">
                <Text fontSize="xs" fontWeight={300} color={colors.textTertiary}>
                  {t('edit_farm.farming_end')}
                </Text>
                <Text fontSize="md" fontWeight={500} color={colors.textSecondary} my={1} mb={2}>
                  {`${farmEndTimeInfo.year}/${farmEndTimeInfo.month}/${farmEndTimeInfo.day}`}
                </Text>
                <Text fontSize="xs" color={colors.textSecondary}>
                  {`${farmEndTimeInfo.hour}:${farmEndTimeInfo.minutes} (UTC)`}
                </Text>
              </Box>
            </HStack>
          )}
        </Box>
        <HStack
          flexDirection={['column', 'row']}
          align={['unset', 'center']}
          justify={'space-between'}
          borderRadius="12px"
          bg={colors.backgroundDark}
          py={3}
          px={[4, 6]}
        >
          <Text color={colors.textTertiary} fontSize="xs">
            {t('create_farm.estimated_rewards_week')}
          </Text>
          <Text color={colors.textSecondary} fontSize="xl" fontWeight={500} mt={1}>
            {new Decimal(rewardInfo.perWeek || 0).toDecimalPlaces(rewardInfo.token?.decimals || 6, Decimal.ROUND_FLOOR).toString()}
            {rewardInfo.token?.symbol}
          </Text>
        </HStack>

        <FarmDatePickerModal
          isOpen={isOpen}
          onConfirm={handleRewardTimeChange}
          onClose={onClose}
          farmDuration={
            rewardInfo.farmEnd && rewardInfo.farmStart
              ? Math.floor((rewardInfo.farmEnd - rewardInfo.farmStart) / (60 * 60 * 24 * 1000))
              : undefined
          }
          farmStart={rewardInfo.farmStart}
        />
      </Flex>
    </Box>
  )
}
