import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { colors } from '@/theme/cssVariables'
import { Text, Flex } from '@chakra-ui/react'
import TokenAvatar from '../../TokenAvatar'

export interface TokenSelectDialogProps {
  onSelectValue: (token: TokenInfo) => void
  isOpen: boolean
  filterFn?: (token: TokenInfo) => boolean
  onClose: () => void
}

export default function PopularTokenCell({
  disabled,
  token,
  onClick
}: {
  disabled?: boolean
  token: TokenInfo | undefined
  onClick?: (token: TokenInfo) => void
}) {
  return (
    <Flex
      bg={colors.backgroundDark}
      alignItems="center"
      justifyContent={'space-around'}
      gap="4px"
      padding="6px 12.5%"
      rounded="4px"
      onClick={disabled ? undefined : () => token && onClick?.(token)}
      cursor={token && !disabled ? 'pointer' : 'default'}
      opacity={disabled ? 0.5 : 1}
    >
      {token && (
        <>
          <TokenAvatar token={token} size="sm"></TokenAvatar>
          <Text fontSize="sm" color={colors.textSecondary}>
            {token.symbol}
          </Text>
        </>
      )}
    </Flex>
  )
}
