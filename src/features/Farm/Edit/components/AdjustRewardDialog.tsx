import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack
} from '@chakra-ui/react'
import { ApiV3Token, wSolToSolToken } from '@raydium-io/raydium-sdk-v2'
import Button from '@/components/Button'
import CalloutNote from '@/components/CalloutNote'
import DecimalInput from '@/components/DecimalInput'
import TokenInput from '@/components/TokenInput'
import { useAppStore, useTokenAccountStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { useEvent } from '@/hooks/useEvent'
import { parseDateInfo, toUTC, DAY_SECONDS, WEEK_SECONDS } from '@/utils/date'
import { getDuration } from '@/utils/duration'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import Decimal from 'decimal.js'
import { EditReward } from '../util'
import useAdjustRewardSchema, { ADJUST_REWARD_ERROR } from '../schema/useAdjustRewardSchema'
import toPercentString from '@/utils/numberish/toPercentString'
import { wSolToSolString } from '@/utils/token'
import useTokenPrice, { TokenPrice } from '@/hooks/token/useTokenPrice'

/**
 * used in [FarmingRewardItem](./FarmingRewardItem.tsx)
 */
export default function AdjustRewardDialog({
  farmTVL,
  oldReward,
  isOpen,
  onClose,
  onSave
}: {
  farmTVL?: number
  oldReward: EditReward
  isOpen: boolean
  onSave: (reward: EditReward) => void
  onClose?(): void
}) {
  const { t } = useTranslation()
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)

  const [daysExtend, setDaysExtend] = useState('')
  const [moreAmount, setMoreAmount] = useState('')

  const rewardToken = wSolToSolToken(oldReward.mint)
  const onlineCurrentDate = Date.now() + chainTimeOffset
  const oldPerSecond = new Decimal(oldReward.perWeek).div(WEEK_SECONDS)
  const remainSeconds = new Decimal(Math.floor(oldReward.endTime / 1000 - onlineCurrentDate / 1000))
  const remainAmount = new Decimal(oldPerSecond).mul(remainSeconds)

  const { data: tokenPrices } = useTokenPrice({
    mintList: [rewardToken.address]
  })

  const newPerSecondA = new Decimal(moreAmount || 0).div(new Decimal(daysExtend || 1).mul(DAY_SECONDS))
  const newPerSecondB = new Decimal(remainAmount).add(moreAmount || 0).div(new Decimal(daysExtend || 1).mul(DAY_SECONDS).add(remainSeconds))

  const newPerSecond = newPerSecondA.lt(newPerSecondB) ? newPerSecondA : newPerSecondB
  const isDecrease = newPerSecond.lt(oldPerSecond)

  const newTotal = isDecrease
    ? new Decimal(moreAmount || 0).add(newPerSecond.mul(remainSeconds)).toString()
    : remainAmount.add(moreAmount || 0).toString()

  const newEndTime = new Decimal(daysExtend || 0)
    .mul(DAY_SECONDS * 1000)
    .add(oldReward.endTime)
    .toNumber()

  const newApr =
    moreAmount || daysExtend
      ? newPerSecond
          .mul(DAY_SECONDS * 365)
          .mul(tokenPrices[rewardToken.address]?.value || 0)
          .div(farmTVL || 1)
          .toNumber()
      : oldReward.apr

  const error = useAdjustRewardSchema({
    oldReward,
    daysExtend,
    balance: getTokenBalanceUiAmount({ mint: rewardToken.address, decimals: rewardToken.decimals }).text,
    amount: moreAmount,
    onlineCurrentDate,
    remainSeconds,
    isDecrease
  })

  const invalid = !!error && error !== ADJUST_REWARD_ERROR.DECREASE

  const handleSave = useEvent(() => {
    onSave({
      ...oldReward,
      total: newTotal,
      openTime: onlineCurrentDate,
      endTime: new Decimal(oldReward.endTime).add(new Decimal(daysExtend).mul(DAY_SECONDS * 1000)).toNumber(),
      perWeek: newPerSecond.mul(WEEK_SECONDS).toString(),
      status: 'updated',
      apr: newApr
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose?.()
      }}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('edit_farm.box_header_adjust_rewards')}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5} overflow="visible">
          <VStack spacing={4} align="stretch">
            <CalloutNote header={t('edit_farm.please_note_title')} content={t('edit_farm.please_note_content')} />

            <Box>
              <Heading fontSize="md" color={colors.textSecondary} fontWeight={500} mb={3}>
                {t('edit_farm.box_header_current_rewards_period')}
              </Heading>
              <RewardInfoItem
                tokenPrices={tokenPrices}
                mint={oldReward.mint}
                amount={remainAmount.toString()}
                endTime={oldReward.endTime}
                perWeek={oldReward.perWeek}
                apr={oldReward.apr}
              />
            </Box>

            <Box>
              <Heading fontSize="md" color={colors.textSecondary} fontWeight={500} mb={3}>
                {t('edit_farm.box_header_rewards_adjustment')}
              </Heading>
              <HStack align="stretch">
                <TokenInput
                  token={rewardToken}
                  disableSelectToken
                  value={moreAmount}
                  // onTokenChange={onTokenChange}
                  onChange={setMoreAmount}
                />
                <VStack bg={colors.backgroundDark} p={3} rounded="md" align="start">
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {t('edit_farm.days_extends')}
                  </Text>
                  <Spacer />
                  <HStack>
                    <DecimalInput
                      inputSx={{
                        bg: 'transparent',
                        p: 0,
                        fontSize: 'lg',
                        fontWeight: 500,
                        _hover: { bg: 'transparent' },
                        _active: { bg: 'transparent' },
                        _focusWithin: { bg: 'transparent' }
                      }}
                      inputGroupSx={{
                        px: 0
                      }}
                      placeholder="7 - 90"
                      value={daysExtend}
                      onChange={setDaysExtend}
                    ></DecimalInput>
                    <Text color={colors.textTertiary} fontSize="xs" fontWeight={700}>
                      {t('edit_farm.time_day')}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </Box>
            <Text color="red">{error ? t(error, { token: rewardToken.symbol }) : undefined}</Text>
            {!invalid ? (
              <Box>
                <Heading fontSize="md" color={colors.textSecondary} fontWeight={500} mb={3}>
                  {t('edit_farm.box_header_updated_rewards')}
                </Heading>
                <RewardInfoItem
                  tokenPrices={tokenPrices}
                  mint={oldReward.mint}
                  amount={newTotal.toString()}
                  endTime={newEndTime}
                  perWeek={newPerSecond.mul(WEEK_SECONDS).toString()}
                  apr={newApr}
                />
              </Box>
            ) : null}
          </VStack>
        </ModalBody>

        <ModalFooter mt={4}>
          <HStack w="full" justify="space-between">
            <Button variant="outline" onClick={onClose}>
              {t('button.cancel')}
            </Button>
            <Button minW="16rem" onClick={handleSave} isDisabled={invalid}>
              {t('button.save')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function RewardInfoItem(props: {
  mint: ApiV3Token
  amount: string
  endTime: number
  perWeek: string
  apr: number
  tokenPrices: Record<string, TokenPrice>
}) {
  const { t } = useTranslation()
  return (
    <Flex overflow="hidden" align="stretch" rounded="20px" fontSize="sm">
      <Flex direction="column" flexGrow={1}>
        <Box bg={colors.backgroundDark} py={3} px={6}>
          <Text color={colors.textTertiary}>{t('edit_farm.box_header_remaining_amount')}</Text>
        </Box>
        <Box flexGrow={1} bg={colors.backgroundTransparent12} py={4} px={6}>
          <Text fontSize="md" fontWeight={500} color={colors.textPrimary} mb={3}>
            {formatCurrency(props.amount, { decimalPlaces: props.mint.decimals })}
          </Text>
          <Text fontSize="xs" color={colors.textSecondary}>
            {formatCurrency(new Decimal(props.amount).mul(props.tokenPrices[props.mint.address]?.value || 0).toString(), {
              symbol: '$',
              decimalPlaces: 2
            })}
          </Text>
        </Box>
      </Flex>
      <Flex direction="column" flexGrow={1}>
        <Box bg={colors.backgroundDark} py={3} px={6}>
          <Text color={colors.textTertiary}>{t('edit_farm.farming_end')}</Text>
        </Box>
        <Box flexGrow={1} bg={colors.backgroundTransparent12} py={4} px={6}>
          <Text fontSize="md" fontWeight={500} color={colors.textPrimary} mb={3}>
            {toUTC(props.endTime)}
          </Text>
          <Text fontSize="xs" color={colors.textSecondary}>
            {t('edit_farm.remaining_days', { days: parseDateInfo(getDuration(props.endTime, Date.now())).day })}
          </Text>
        </Box>
      </Flex>
      <Flex direction="column" flexGrow={1}>
        <Box bg={colors.backgroundDark} py={3} px={6}>
          <Text color={colors.textTertiary}>{t('edit_farm.rate')}</Text>
        </Box>
        <Box flexGrow={1} bg={colors.backgroundTransparent12} py={4} px={6}>
          <Text fontSize="md" fontWeight={500} color={colors.textPrimary} mb={3}>
            {formatCurrency(props.perWeek, { decimalPlaces: props.mint.decimals })}
            <Text display="inline" ml="2" color={colors.textSecondary}>
              {wSolToSolString(props.mint.symbol)}
              {t('edit_farm.per_week')}
            </Text>
          </Text>
          <Text fontSize="xs" color={colors.textSecondary}>
            {formatToRawLocaleStr(toPercentString(props.apr))} {t('edit_farm.APR')}
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}
