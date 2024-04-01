import TokenAvatarPair from '@/components/TokenAvatarPair'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, HStack } from '@chakra-ui/react'
import { FarmTitleBadge } from './FarmTitleBadge'

export default function ItemName(props: {
  /** @default 'item-face' */
  variant?: 'drawer' | 'item-face'
  baseToken: FormattedPoolInfoStandardItem['mintA']
  quoteToken: FormattedPoolInfoStandardItem['mintB']
  poolName: FormattedPoolInfoStandardItem['poolName']
  hasStakeFarm: boolean
  stakeFarmCount: number
}) {
  return (
    <Flex
      flexWrap={'wrap'}
      direction={props.variant === 'item-face' ? 'column' : ['row', 'column']}
      alignItems={props.variant === 'item-face' ? 'center' : undefined}
      rowGap={props.variant === 'item-face' ? 1 : 2}
      columnGap={1}
    >
      <TokenAvatarPair size={props.variant === 'item-face' ? '40px' : undefined} token1={props.baseToken} token2={props.quoteToken} />
      <HStack spacing={props.variant === 'item-face' ? 2 : 1}>
        <Box color={colors.textPrimary} fontWeight="500" fontSize="20px" whiteSpace={'nowrap'}>
          {props.poolName}
        </Box>
        {props.hasStakeFarm && props.stakeFarmCount !== 0 && <FarmTitleBadge stakeFarmCount={props.stakeFarmCount} />}
      </HStack>
    </Flex>
  )
}
