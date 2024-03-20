import { useState } from 'react'
import { Badge, Box, Button, Flex, Grid, GridItem, HStack, SimpleGrid, Tag, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'

import TokenAvatar from '@/components/TokenAvatar'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { DAY_SECONDS } from '@/utils/date'
import { toVolume } from '@/utils/numberish/autoSuffixNumberish'
import formatNumber from '@/utils/numberish/formatNumber'

import { EditReward, FarmStatus, getRewardMeta } from '../util'
import AddMoreRewardDialog from './AddMoreRewardDialog'
import AdjustRewardDialog from './AdjustRewardDialog'
import { wSolToSolString } from '@/utils/token'
import { useTranslation } from 'react-i18next'

export default function ExistFarmingRewardItem({
  reward,
  farmTVL,
  isEcosystem,
  onRewardUpdate,
  tokenFilterFn
}: {
  reward: EditReward
  farmTVL?: number
  isEcosystem?: boolean
  tokenFilterFn?: (token: TokenInfo, escapeExistMint?: string) => boolean
  onRewardUpdate: (mint: string, reward?: EditReward, orgReward?: EditReward) => void
}) {
  const { t } = useTranslation()
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const onlineCurrentDate = Date.now() + chainTimeOffset

  const [currentReward, setCurrentReward] = useState<EditReward>(reward)
  const [rewardTag, setRewardTag] = useState(Date.now())

  const rewardToken = reward.mint
  const { startTimeText, endTimeText, durationText } = getRewardMeta(reward)
  const { startTimeText: newStartTimeText, endTimeText: newEndTimeText, durationText: newDurationText } = getRewardMeta(currentReward)

  const [currentStatus, setCurrentStatus] = useState<FarmStatus>(reward.status)

  const filterFn = useEvent((token: TokenInfo) => {
    if (!tokenFilterFn) return true
    return tokenFilterFn(token, reward.mint.address)
  })

  const isNewRewards = currentStatus === 'new'
  const isUpdated = currentStatus === 'updated'

  const statusInfo = {
    ongoing: {
      color: colors.semanticSuccess,
      text: t('badge.ongoing'),
      indicators: ['badge']
    },
    ended: {
      color: colors.semanticError,
      text: t('badge.ended'),
      indicators: ['badge', 'top-line']
    },
    updated: {
      color: colors.badgePurple,
      text: t('badge.updated'),
      indicators: ['tag', 'top-line']
    },
    new: {
      color: colors.badgeBlue,
      text: t('badge.new'),
      indicators: ['tag', 'top-line']
    }
  }

  const isRewardEnded = reward.status === 'ended'
  const isIn72hrPeriod = reward.endTime - onlineCurrentDate <= 1000 * DAY_SECONDS * 3 && reward.endTime > onlineCurrentDate
  const isEcoSystemAddMore = isEcosystem && isIn72hrPeriod

  const canAddMoreRewards = reward.endTime - onlineCurrentDate <= 1000 * DAY_SECONDS * 3
  const claimableRewardAmount: string | undefined = undefined // wait for api

  const { isOpen: isAdjustRewardDialogOpen, onOpen: onOpenAdjustRewardDialog, onClose: onCloseAdjustRewardDialog } = useDisclosure()
  const { isOpen: isAddMoreRewardDialogOpen, onOpen: onOpenAddMoreRewardDialog, onClose: onCloseAddMoreRewardDialog } = useDisclosure()
  const { isOpen: isEditDialogOpen, onOpen: onOpenEditDialog, onClose: onCloseEditDialog } = useDisclosure()

  const onClaim = () => {
    // handle claim reward
  }

  const onReset = useEvent(() => {
    setCurrentStatus(reward.status)
    setCurrentReward(reward)
    setRewardTag(Date.now())
    onRewardUpdate(reward.mint.address)
  })

  const onSave = useEvent((adjustedReward: EditReward) => {
    onCloseEditDialog()
    onCloseAddMoreRewardDialog()
    onCloseAdjustRewardDialog()
    setCurrentStatus(adjustedReward.status)
    setCurrentReward(adjustedReward)
    onRewardUpdate(adjustedReward.mint.address, adjustedReward, isNewRewards ? reward : undefined)
  })

  const onDeleteNewReward = useEvent(() => {
    onRewardUpdate(reward.mint.address)
  })

  return (
    <>
      {/* item body */}
      <Grid
        position="relative"
        overflow="hidden"
        gridAutoFlow="column"
        gridTemplate={[
          `
              "label    per-week" auto
              "duration duration" auto / 1fr 1fr
            `,
          `
              "label per-week duration" 1fr 1.3fr 2fr
            `
        ]}
        fontWeight={500}
        rounded="xl"
        bg={colors.backgroundLight}
        justifyContent="space-between"
        px={6}
        py={3}
        gap={4}
      >
        {currentStatus && statusInfo[currentStatus]?.indicators.includes('top-line') && (
          <GridItem area={'top-line'} position={'absolute'} top={0} left={0} right={0}>
            <Box height={0.5} bg={statusInfo[currentStatus]?.color ?? 'transparent'} />
          </GridItem>
        )}

        <GridItem area={'label'}>
          <VStack alignItems="start" gap="1">
            <Flex gap="2" alignItems="center">
              <TokenAvatar size="sm" token={rewardToken} />
              <Text fontSize="lg">{rewardToken?.symbol}</Text>
            </Flex>
            {currentStatus === 'ongoing' && statusInfo[currentStatus]?.indicators.includes('badge') && (
              <Badge variant="ok">{statusInfo[currentStatus].text}</Badge>
            )}
            {currentStatus === 'ended' && statusInfo[currentStatus]?.indicators.includes('badge') && (
              <Badge variant="error">{statusInfo[currentStatus].text}</Badge>
            )}
            {currentStatus && statusInfo[currentStatus]?.indicators.includes('tag') && (
              <Tag variant="parallelogram" bg={statusInfo[currentStatus].color}>
                {statusInfo[currentStatus].text}
              </Tag>
            )}
          </VStack>
        </GridItem>

        <GridItem area={'per-week'}>
          <Box opacity={isUpdated ? 0.5 : 1}>
            <Text>{formatNumber(reward.total)}</Text>
            <HStack fontSize="sm">
              <Text color={colors.textSecondary}>{formatNumber(reward.perWeek)}</Text>
              <Text color={colors.textTertiary}>{t('edit_farm.per_week')}</Text>
            </HStack>
          </Box>
        </GridItem>

        <GridItem area={'duration'}>
          <HStack spacing={4} opacity={isUpdated ? 0.5 : 1}>
            <Text>{startTimeText}</Text>

            {/* divider */}
            <Box fontSize="sm" position="relative">
              <Text position="absolute" top={-2} left="50%" transform="translateX(-50%)" color={colors.textSecondary} whiteSpace="nowrap">
                {durationText}
              </Text>
              <Box height="1.5px" width={12} bg={colors.textTertiary} my={4} />
            </Box>

            <HStack>
              <Text>{endTimeText}</Text>
              <Text fontSize="sm" color={colors.textSecondary}>
                (UTC)
              </Text>
            </HStack>
          </HStack>
        </GridItem>
      </Grid>

      {isUpdated && (
        <SimpleGrid
          position="relative"
          overflow="hidden"
          gridAutoFlow="column"
          gridTemplateColumns="1fr 1.3fr 2fr"
          fontWeight={500}
          roundedBottomLeft="xl"
          roundedBottomRight="xl"
          bg={colors.backgroundLight}
          justifyContent="space-between"
          px={6}
          py={3}
          mt="-5"
        >
          <VStack alignItems="start" gap="1"></VStack>

          <Box borderTop={`1px solid ${colors.backgroundTransparent12}`} pt="3">
            <Text>{formatNumber(currentReward.total)}</Text>
            <HStack fontSize="sm">
              <Text color={colors.textSecondary}>{formatNumber(currentReward.perWeek)}</Text>
              <Text color={colors.textTertiary}>{t('edit_farm.per_week')}</Text>
            </HStack>
          </Box>

          <HStack spacing={4} borderTop={`1px solid ${colors.backgroundTransparent12}`} pt="3">
            <Text>{newStartTimeText}</Text>

            {/* divider */}
            <Box fontSize="sm" position="relative">
              <Text position="absolute" top={-2} left="50%" transform="translateX(-50%)" color={colors.textSecondary} whiteSpace="nowrap">
                {newDurationText}
              </Text>
              <Box height="1.5px" width={12} bg={colors.textTertiary} my={4} />
            </Box>

            <HStack>
              <Text>{newEndTimeText}</Text>
              <Text fontSize="sm" color={colors.textSecondary}>
                (UTC)
              </Text>
            </HStack>
          </HStack>
        </SimpleGrid>
      )}

      {/* action buttons */}
      <HStack justify="end" flexWrap="wrap" mb="2">
        {claimableRewardAmount && (
          <Button variant="outline" size="sm" onClick={onClaim}>
            <HStack>
              <Text>{t('edit_farm.claim_unemmitted_rewards')}</Text>
              <Text color={colors.textSecondary} fontSize={'xs'}>
                {toVolume(claimableRewardAmount)} {wSolToSolString(rewardToken.symbol)}
              </Text>
            </HStack>
          </Button>
        )}
        {isUpdated && (
          <Button size="sm" variant="outline" onClick={onReset}>
            {t('button.reset')}
          </Button>
        )}
        {!isRewardEnded && !isEcosystem && !isNewRewards && !isUpdated && (
          <>
            <Button size="sm" isDisabled={!canAddMoreRewards} onClick={onOpenAdjustRewardDialog}>
              {t('edit_farm.button_adjust_rewards')}
            </Button>
            <AdjustRewardDialog
              key={rewardTag}
              oldReward={reward}
              farmTVL={farmTVL}
              isOpen={isAdjustRewardDialogOpen}
              onClose={onCloseAdjustRewardDialog}
              onSave={onSave}
            />
          </>
        )}

        {(isRewardEnded || isEcoSystemAddMore) && !isUpdated && (
          <>
            <Button size="sm" onClick={onOpenAddMoreRewardDialog}>
              {t('edit_farm.button_add_more_rewards')}
            </Button>
            {isAddMoreRewardDialogOpen && (
              <AddMoreRewardDialog
                key={rewardTag}
                header="Add more rewards"
                isEcoSystemAddMore={isEcoSystemAddMore}
                defaultRewardInfo={reward}
                isOpen={true}
                onSave={onSave}
                onClose={onCloseAddMoreRewardDialog}
              />
            )}
          </>
        )}

        {isNewRewards && (
          <Button size="sm" variant="outline" onClick={onDeleteNewReward}>
            {t('button.delete')}
          </Button>
        )}
        {isNewRewards && (
          <>
            <Button size="sm" onClick={onOpenEditDialog}>
              {t('button.edit')}
            </Button>
            <AddMoreRewardDialog
              key={rewardTag}
              tokenFilterFn={filterFn}
              header={t('button.edit')}
              defaultRewardInfo={reward}
              isOpen={isEditDialogOpen}
              onSave={onSave}
              onClose={onCloseEditDialog}
            />
          </>
        )}
      </HStack>
    </>
  )
}
