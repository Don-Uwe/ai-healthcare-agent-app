import { Box, Flex, Grid, GridItem, HStack, Highlight, Text } from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import DeleteIcon from '@/icons/misc/DeleteIcon'
import EditIcon from '@/icons/misc/EditIcon'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'

type RewardHeaderProps = {
  index: number
  isOpen: boolean
  onToggle: () => void
  token: TokenInfo | ApiV3Token | undefined
  amount?: number
  perWeek?: number
}

export default function RewardHeader({ index, isOpen, onToggle, token, amount, perWeek }: RewardHeaderProps) {
  return (
    <Box onClick={onToggle} cursor="pointer">
      <Flex justify={'space-between'} align="center">
        <Grid gridTemplate={`"index token week"`} gridTemplateColumns={'177px auto auto'} alignItems="center">
          <GridItem gridArea="index">
            <Text fontWeight="medium" fontSize="xl">
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
                    <Highlight query={'/week'} styles={{ color: colors.textTertiary }}>
                      {`${perWeek.toString()}/week`}
                    </Highlight>
                  ) : null}
                </Text>
              </GridItem>
            </>
          )}
        </Grid>
        <Box onClick={onToggle} cursor="pointer">
          {isOpen ? <DeleteIcon /> : <EditIcon />}
        </Box>
      </Flex>
    </Box>
  )
}
