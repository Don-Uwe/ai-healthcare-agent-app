import Button from '@/components/Button'
import DatePickerModal from '@/components/FarmDatePickerModal'
import TokenInput from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore, useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { parseDateInfo } from '@/utils/date'
import {
  Box,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAddNewRewardSchema from '../schema/useAddNewRewardSchema'
import { EditReward } from '../util'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'

/**
 * used in [FarmingRewardItemm](../FarmingRewardItem.tsx)
 */
export default function AddAnotherRewardDialog({
  defaultRewardInfo = {},
  isOpen,
  tokenFilterFn,
  onClose,
  onSave
}: {
  defaultRewardInfo?: Partial<EditReward>
  isOpen: boolean
  tokenFilterFn?: (token: TokenInfo) => boolean
  onSave: (rewardInfos: EditReward) => void
  onClose(): void
}) {
  const { t } = useTranslation()
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const onlineCurrentDate = Date.now() + chainTimeOffset
  const [rewardInfo, setRewardInfos] = useState<Partial<EditReward>>(defaultRewardInfo)
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const rewardToken = rewardInfo.mint ? tokenMap.get(rewardInfo.mint?.address) : undefined
  const { isOpen: isDatePickerOpen, onClose: onCloseDatePicker, onOpen: onOpenDatePicker } = useDisclosure()

  const error = useAddNewRewardSchema({
    onlineCurrentDate,
    balance: getTokenBalanceUiAmount({ mint: rewardInfo.mint?.address || '', decimals: rewardInfo.mint?.decimals }).text,
    amount: rewardInfo.total,
    endTime: rewardInfo.endTime || 0,
    openTime: rewardInfo.openTime || 0,
    mint: rewardToken,
    checkMint: true
  })

  function onChange(partialInfo: Partial<EditReward>) {
    setRewardInfos((s) => ({ ...s, ...partialInfo }))
  }

  const onTokenChange = useEvent((token: TokenInfo | ApiV3Token) => {
    onChange({ mint: token })
  })

  const onAmountChange = useEvent((valNumber: string) => {
    const durations = rewardInfo.endTime && rewardInfo.openTime ? rewardInfo.endTime - rewardInfo.openTime : undefined
    const newPerWeek = durations ? new Decimal(valNumber || 0).div(durations / (60 * 60 * 24 * 1000 * 7)).toString() : undefined
    onChange({ ...rewardInfo, total: valNumber, perWeek: newPerWeek })
  })

  const handleRewardTimeChange = useEvent((startTime: number, endTime: number) => {
    const amount = rewardInfo.total
    const durations = endTime && startTime ? endTime - startTime : undefined
    const newPerWeek = durations && amount ? new Decimal(amount).div(durations / (60 * 60 * 24 * 1000 * 7)).toString() : undefined
    onChange({ ...rewardInfo, openTime: startTime, endTime, perWeek: newPerWeek })
    onCloseDatePicker()
  })

  const farmOpenTimeInfo = useMemo(() => parseDateInfo(rewardInfo.openTime), [rewardInfo.openTime])
  const farmEndTimeInfo = useMemo(() => parseDateInfo(rewardInfo.endTime), [rewardInfo.endTime])

  const handleConfirm = useEvent(() => {
    onSave({
      ...rewardInfo,
      status: 'new'
    } as any)
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose?.()
      }}
      size={'2xl'}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('edit_farm.modal_add_another_token')}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5} overflow={'visible'}>
          <VStack spacing={4} align="stretch">
            <TokenInput
              token={rewardToken}
              hideControlButton
              value={rewardInfo.total}
              filterFn={tokenFilterFn}
              onTokenChange={onTokenChange}
              onChange={onAmountChange}
            />
            <Box borderRadius="12px" bg={colors.backgroundDark} py={3} px={6}>
              {!rewardInfo.openTime ? (
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
                    onClick={onOpenDatePicker}
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
                  <Box cursor="pointer" onClick={onOpenDatePicker}>
                    <Text fontSize="xs" fontWeight={300} color={colors.textTertiary}>
                      {t('edit_farm.farming_start')}
                    </Text>
                    <Text fontSize="md" fontWeight={500} color={colors.textPrimary} my={1} mb={2}>
                      {`${farmOpenTimeInfo.year}/${farmOpenTimeInfo.month}/${farmOpenTimeInfo.day}`}
                    </Text>
                    <Text fontSize="xs" color={colors.textSecondary}>
                      {`${farmOpenTimeInfo.hour}:${farmOpenTimeInfo.minutes} (UTC)`}
                    </Text>
                  </Box>
                  {rewardInfo.openTime && rewardInfo.endTime ? (
                    <Flex flexGrow={1} align={'center'}>
                      <Box flexGrow={1} height="1px" color={colors.backgroundLight} bg={colors.dividerDashGradient} />
                      <Box rounded="md" bg={colors.backgroundLight} py={1.5} px={[4, 10]} cursor="pointer" onClick={onOpenDatePicker}>
                        <Text fontWeight="500" fontSize="sm">
                          {(rewardInfo.endTime - rewardInfo.openTime) / (60 * 60 * 24 * 1000)} Days
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
            <HStack justify={'space-between'} borderRadius="12px" bg={colors.backgroundDark} py={3} px={6}>
              <Text color={colors.textTertiary} fontSize="xs">
                {t('edit_farm.estimated_rewards_week')}
              </Text>
              <Text color={colors.textSecondary} fontSize="xl" fontWeight={500} mt={1}>
                {rewardInfo.perWeek
                  ? formatToRawLocaleStr(
                      new Decimal(rewardInfo.perWeek || 0).toDecimalPlaces(rewardInfo.mint?.decimals || 6, Decimal.ROUND_FLOOR).toString()
                    )
                  : '--'}{' '}
                {rewardInfo.mint?.symbol}
              </Text>
            </HStack>

            <DatePickerModal
              isOpen={isDatePickerOpen}
              onConfirm={handleRewardTimeChange}
              onClose={() => onCloseDatePicker?.()}
              farmStart={rewardInfo.openTime || dayjs().add(15, 'minutes').valueOf()}
            />
          </VStack>

          {error && (
            <Text mt="2" color={colors.semanticWarning}>
              {t(error, { token: rewardInfo.mint?.symbol || '-' })}
            </Text>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack w="full" justify={'space-between'}>
            <Button variant="outline" onClick={onClose}>
              {t('button.cancel')}
            </Button>
            <Button isDisabled={!!error} width={'clamp(8em, 18vw, 16em)'} onClick={handleConfirm}>
              {t('button.save')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
