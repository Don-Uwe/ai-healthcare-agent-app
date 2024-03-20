import { Desktop, Mobile } from '@/components/MobileDesktop'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { getPoolName } from '@/features/Pools/util'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { Box, HStack, Text } from '@chakra-ui/react'
import { ApiV3PoolInfoItem } from '@raydium-io/raydium-sdk-v2'
import { useTranslation } from 'react-i18next'

type PoolReviewItemProps = {
  poolInfo: ApiV3PoolInfoItem
}

export default function PoolReviewItem({ poolInfo }: PoolReviewItemProps) {
  return (
    <>
      <Desktop>
        <HStack fontWeight={500} rounded="md" bg={colors.backgroundLight} justify="space-between" px={6} py={3}>
          <RewardPoolItemHeadLabel poolInfo={poolInfo}></RewardPoolItemHeadLabel>
          <RewardPoolItemTVLInfoBox tvl={poolInfo.tvl}></RewardPoolItemTVLInfoBox>
          <RewardPoolItemAPRInfoBox apr={poolInfo.day.apr}></RewardPoolItemAPRInfoBox>
        </HStack>
      </Desktop>
      <Mobile>
        <Box rounded="md" overflow={'hidden'}>
          <HStack gap={4} fontWeight={500} bg={colors.backgroundLight} px={6} py={3}>
            <RewardPoolItemHeadLabel poolInfo={poolInfo}></RewardPoolItemHeadLabel>
          </HStack>
          <HStack bg={colors.backgroundTransparent12} py={2} px={6} justify={'space-around'}>
            <RewardPoolItemTVLInfoBox tvl={poolInfo.tvl}></RewardPoolItemTVLInfoBox>
            <RewardPoolItemAPRInfoBox apr={poolInfo.day.apr}></RewardPoolItemAPRInfoBox>
          </HStack>
        </Box>
      </Mobile>
    </>
  )
}

function RewardPoolItemHeadLabel(props: { poolInfo: ApiV3PoolInfoItem }) {
  const { t } = useTranslation()
  return (
    <HStack>
      <TokenAvatarPair token1={props.poolInfo.mintA} token2={props.poolInfo.mintB} />
      <Text fontSize="xl">{getPoolName(props.poolInfo)}</Text>
      <QuestionToolTip label={t('create_farm.item_reward_tooltip')} iconProps={{ color: colors.textTertiary }} />
    </HStack>
  )
}

function RewardPoolItemTVLInfoBox(props: { tvl: number }) {
  return (
    <Box>
      <Text fontSize={'xs'} color={colors.textTertiary}>
        TVL
      </Text>
      <Text>{toUsdVolume(props.tvl)}</Text>
    </Box>
  )
}

function RewardPoolItemAPRInfoBox(props: { apr: number }) {
  return (
    <Box>
      <Text fontSize={'xs'} color={colors.textTertiary}>
        APR
      </Text>
      <Text>
        {toPercentString(props.apr, {
          alreadyPercented: true
        })}
      </Text>
    </Box>
  )
}
