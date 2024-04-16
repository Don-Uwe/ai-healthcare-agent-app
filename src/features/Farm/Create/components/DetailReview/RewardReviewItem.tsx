import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { parseDateInfo } from '@/utils/date'
import { formatCurrency } from '@/utils/numberish/formatter'
import { Box, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { NewRewardInfo } from '@/features/Farm/Create/type'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { Desktop, Mobile } from '@/components/MobileDesktop'

type RewardReviewItemProps = {
  rewardInfo: NewRewardInfo
}

export default function RewardReviewItem({ rewardInfo }: RewardReviewItemProps) {
  const rewardToken = rewardInfo.token
  const startTimeInfo = parseDateInfo(rewardInfo.farmStart)
  const startT = rewardInfo.farmStart ? `${startTimeInfo.year}/${startTimeInfo.month}/${startTimeInfo.day}` : undefined

  const endTimeInfo = parseDateInfo(rewardInfo.farmEnd)
  const endT = rewardInfo.farmEnd ? `${endTimeInfo.year}/${endTimeInfo.month}/${endTimeInfo.day}` : undefined

  const duration =
    rewardInfo.farmEnd && rewardInfo.farmStart ? `${(rewardInfo.farmEnd - rewardInfo.farmStart) / (60 * 60 * 24 * 1000)}D` : undefined

  return (
    <>
      <Desktop>
        <SimpleGrid
          gridAutoFlow="column"
          gridTemplateColumns="1fr 1.3fr 2fr"
          gap={4}
          fontWeight={500}
          rounded="md"
          bg={colors.backgroundLight}
          justifyContent="space-between"
          px={6}
          py={3}
        >
          <RewardItemHeadLabel rewardToken={rewardToken} />
          <AmountInfo rewardInfo={rewardInfo} />
          <DurationInfo startT={startT} endT={endT} duration={duration} />
        </SimpleGrid>
      </Desktop>
      <Mobile>
        <Box rounded="md" overflow={'hidden'}>
          <SimpleGrid
            gridAutoFlow="column"
            gridTemplateColumns="1fr 2fr"
            gap={4}
            fontWeight={500}
            bg={colors.backgroundLight}
            justifyContent="space-between"
            px={6}
            py={3}
          >
            <RewardItemHeadLabel rewardToken={rewardToken} />
            <AmountInfo rewardInfo={rewardInfo} />
          </SimpleGrid>
          <HStack bg={colors.backgroundTransparent12} py={2} px={6} justify={'center'}>
            <DurationInfo startT={startT} endT={endT} duration={duration} />
          </HStack>
        </Box>
      </Mobile>
    </>
  )
}
function RewardItemHeadLabel(props: { rewardToken?: ApiV3Token }) {
  return (
    <HStack>
      <TokenAvatar token={props.rewardToken} />
      <Text fontSize="xl">{props.rewardToken?.symbol}</Text>
    </HStack>
  )
}

function AmountInfo(props: { rewardInfo: NewRewardInfo }) {
  return (
    <Box>
      <Text>{formatCurrency(props.rewardInfo.amount, { decimalPlaces: 2 })}</Text>
      <HStack fontSize="sm">
        <Text color={colors.textSecondary}>{formatCurrency(props.rewardInfo.perWeek, { decimalPlaces: 2 })}</Text>
        <Text color={colors.textTertiary}>/week</Text>
      </HStack>
    </Box>
  )
}

function DurationInfo(props: { startT?: string; endT?: string; duration?: string }) {
  return (
    <HStack spacing={4}>
      <Text>{props.startT}</Text>

      {/* divider */}
      <Box fontSize="sm" position="relative">
        <Text position="absolute" top={-2} left="50%" transform="translateX(-50%)" color={colors.textSecondary} whiteSpace="nowrap">
          {props.duration}
        </Text>
        <Box height="1.5px" width={12} bg={colors.textTertiary} my={4} />
      </Box>

      <HStack>
        <Text>{props.endT}</Text>
        <Text fontSize="sm" color={colors.textSecondary}>
          (UTC)
        </Text>
      </HStack>
    </HStack>
  )
}
