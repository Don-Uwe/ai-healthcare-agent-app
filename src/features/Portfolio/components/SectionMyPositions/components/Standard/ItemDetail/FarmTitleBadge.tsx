import FarmRewardIcon from '@/icons/pool/FarmRewardIcon'
import { colors } from '@/theme/cssVariables'
import { Box, Text } from '@chakra-ui/react'

function TopRightCountDot(props: { count: number }) {
  return (
    <Box
      display={'grid'}
      placeItems={'center'}
      rounded={'full'}
      bg={colors.secondary}
      minWidth={'10px'}
      height={'10px'}
      px={'2px'}
      position={'absolute'}
      top={0}
      right={0}
      transform="auto"
      translateX={'50%'}
      translateY={'-50%'} // overflow={'hidden'}
    >
      <Text fontSize={'8px'} fontWeight={'500'} color={colors.backgroundDark}>
        {props.count}
      </Text>
    </Box>
  )
}

export function FarmTitleBadge(props: { stakeFarmCount: number }) {
  return (
    <Box
      py={'3px'}
      px={'6px'}
      lineHeight={0}
      position={'relative'}
      bg={colors.backgroundTransparent12}
      gap={1}
      borderRadius="4px"
      color={colors.textSecondary}
    >
      {props.stakeFarmCount > 1 && <TopRightCountDot count={props.stakeFarmCount} />}
      {props.stakeFarmCount > 0 && <FarmRewardIcon width={12} height={12} />}
    </Box>
  )
}
