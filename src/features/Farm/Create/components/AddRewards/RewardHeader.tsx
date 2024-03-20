import TokenAvatar from '@/components/TokenAvatar'
import DeleteIcon from '@/icons/misc/DeleteIcon'
import EditIcon from '@/icons/misc/EditIcon'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, Grid, GridItem, HStack, Highlight, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

type RewardHeaderProps = {
  index: number
  isOpen: boolean
  onToggle: () => void
  token: ApiV3Token | undefined
  amount?: string
  perWeek?: string
  onDeleteReward(): void
}

export default function RewardHeader({ index, isOpen, onToggle, token, amount, perWeek, onDeleteReward }: RewardHeaderProps) {
  return (
    <Box onClick={onToggle} cursor="pointer">
      <Flex justify="space-between" align="center">
        <Grid gridTemplate={`"index token week"`} gridTemplateColumns="auto 1fr auto" alignItems="center" gap={['10px', '30px']}>
          <GridItem gridArea="index">
            <Text fontWeight="medium" fontSize={['lg', 'xl']}>
              Reward Token {index + 1}
            </Text>
          </GridItem>
          {!isOpen && (
            <>
              <GridItem gridArea="token" mr={3}>
                <HStack spacing={1}>
                  <TokenAvatar token={token} size="sm" />
                  <Text fontWeight="medium">{amount}</Text>
                  <Text color={colors.textSecondary}>{token?.symbol}</Text>
                </HStack>
              </GridItem>
              <GridItem gridArea="week">
                <Text>
                  {perWeek ? (
                    <Highlight query="/week" styles={{ color: colors.textTertiary }}>
                      {`${perWeek.toString()}/week`}
                    </Highlight>
                  ) : null}
                </Text>
              </GridItem>
            </>
          )}
        </Grid>
        <Box onClick={isOpen ? onDeleteReward : onToggle} cursor="pointer">
          {isOpen ? <DeleteIcon /> : <EditIcon />}
        </Box>
      </Flex>
    </Box>
  )
}
