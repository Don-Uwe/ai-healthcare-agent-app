import { Box, Flex, Text } from '@chakra-ui/react'
import { useState, useCallback, useEffect } from 'react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { useTranslation } from 'react-i18next'
import List from '@/components/List'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import RemoveTokenIcon from '@/icons/misc/RemoveTokenIcon'

export default function TokenListSetting() {
  const unsetExtraTokenList = useTokenStore((s) => s.unsetExtraTokenList)
  const tokenList = useTokenStore((s) => s.extraLoadedTokenList)
  const [getTokenBalanceUiAmount] = useTokenAccountStore((s) => [s.getTokenBalanceUiAmount])
  const [displayList, setDisplayList] = useState<TokenInfo[]>([])

  useEffect(() => {
    setDisplayList(tokenList)
  }, [tokenList])

  const getBalance = useCallback((token: TokenInfo) => getTokenBalanceUiAmount({ mint: token.address }).text, [getTokenBalanceUiAmount])

  const handleRemoveUnknownTokenClick = useCallback((token: TokenInfo) => {
    unsetExtraTokenList(token)
  }, [])

  const renderTokenItem = useCallback(
    (token: TokenInfo) => (
      <TokenRowItem
        token={token}
        balance={() => getBalance(token)}
        onRemoveUnknownTokenClick={() => handleRemoveUnknownTokenClick(token)}
      />
    ),
    [getBalance]
  )

  return (
    <Flex direction="column" flexGrow={1} css={{ contain: 'size' }} height="100%" mx="8px">
      <List height="100%" preventResetOnChange items={displayList} getItemKey={(token) => token.name}>
        {renderTokenItem}
      </List>
    </Flex>
  )
}

function TokenRowItem({
  token,
  balance,
  onRemoveUnknownTokenClick
}: {
  token: TokenInfo
  balance: () => string
  onRemoveUnknownTokenClick: (token: TokenInfo) => void
}) {
  const { t } = useTranslation()

  return (
    <Flex
      justifyContent={'space-between'}
      alignItems="center"
      _hover={{
        bg: colors.backgroundDark50
      }}
      rounded="md"
      py="12px"
      px="12px"
      maxW={'100%'}
      overflow={'hidden'}
    >
      <Flex w="full" justifyContent={'space-between'}>
        <Flex w="0" flexGrow={1} minW="0">
          <TokenAvatar token={token} mr="2" />
          <Box w="100%" minW="0" overflow="hidden">
            <Box display="flex" gap={2} alignItems="center">
              <Text color={colors.textSecondary} mt="0.5">
                {token.symbol}
              </Text>
              <Box
                display="flex"
                alignSelf="center"
                alignItems="center"
                cursor="pointer"
                onClick={(ev) => {
                  ev.stopPropagation()
                  onRemoveUnknownTokenClick?.(token)
                }}
              >
                <RemoveTokenIcon />
                <Text fontSize={'sm'} lineHeight="16px" pl={1} fontWeight="medium" color={colors.textSeptenary}>
                  {t('common.remove_token')}
                </Text>
              </Box>
            </Box>
            <Text color={colors.textTertiary} isTruncated fontSize="xs">
              {token.name}
            </Text>
          </Box>
        </Flex>
        <Box flexShrink={0}>
          <Text color={colors.textSecondary} textAlign="right">
            {balance()}
            <AddressChip
              onClick={(ev) => ev.stopPropagation()}
              color={colors.textTertiary}
              canExternalLink
              fontSize="xs"
              address={token.address}
            />
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}
