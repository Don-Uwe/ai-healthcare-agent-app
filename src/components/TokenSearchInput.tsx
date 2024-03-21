import { useState, useEffect, useMemo, useCallback, MouseEvent, KeyboardEvent, useRef, useDeferredValue } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, BoxProps, Flex, Text, Input, Popover, PopoverAnchor, PopoverContent, PopoverBody, HStack } from '@chakra-ui/react'
import { ApiV3Token, solToWSol } from '@raydium-io/raydium-sdk-v2'
import AddressChip from '@/components/AddressChip'
import Close from '@/icons/misc/Close'
import { debounce } from '@/utils/functionMethods'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import TokenAvatar from './TokenAvatar'
import { useTokenStore } from '@/store/useTokenStore'
import { colors } from '@/theme/cssVariables/colors'
import SearchIcon from '@/icons/misc/SearchIcon'
import useResizeObserver from '@/hooks/useResizeObserver'
import { filterTokenFn } from '@/utils/token'
import { isValidPublicKey } from '@/utils/publicKey'
import shallow from 'zustand/shallow'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  selectedListValue?: ApiV3Token[]
  onSelectedListChange?: (value: ApiV3Token[]) => void
  hideAutoComplete?: boolean
} & Omit<BoxProps, 'value' | 'onChange'>

export default function TokenSearchInput({
  value,
  onChange,
  hideAutoComplete,
  selectedListValue,
  onSelectedListChange,
  ...boxProps
}: SearchBarProps) {
  const { t } = useTranslation()
  const [displayTokenList, tokenMap, setExtraTokenList, setDisplayTokenListAct] = useTokenStore(
    (s) => [s.displayTokenList, s.tokenMap, s.setExtraTokenList, s.setDisplayTokenListAct],
    shallow
  )

  const ref = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<ApiV3Token[]>(selectedListValue || [])

  const { tokenInfo: newToken } = useTokenInfo({
    mint: value && !tokenMap.get(value) && isValidPublicKey(value) ? value : undefined
  })

  const debounceUpdate = useCallback(
    debounce((val: string) => {
      !hideAutoComplete && val.length && setOpen(true)
      setSearchValue(val)
    }, 150),
    [hideAutoComplete]
  )

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setOpen(false)
    }, 100)
  }, [])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const token = tokenMap.get(e.currentTarget.dataset.mint!)
      if (token) {
        onSelectedListChange ? onSelectedListChange([...selectedList.concat([token])]) : setSelectedList([...selectedList.concat([token])])
        onChange('')
      }
      handleClose()
    },
    [tokenMap, selectedList, handleClose, onChange, onSelectedListChange]
  )

  const handleRemove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const idx = Number(e.currentTarget.dataset.idx)
      selectedList.splice(idx, 1)
      onSelectedListChange ? onSelectedListChange([...selectedList]) : setSelectedList([...selectedList])
    },
    [tokenMap, selectedList, onSelectedListChange, handleClose]
  )

  const handleCleanInput = useCallback(() => {
    onChange('')
    onSelectedListChange ? onSelectedListChange([]) : setSelectedList([])
  }, [onSelectedListChange])

  useEffect(() => {
    if (!newToken) return
    setExtraTokenList({ token: newToken })
    setDisplayTokenListAct()
  }, [newToken, setExtraTokenList, setDisplayTokenListAct])

  useEffect(() => {
    debounceUpdate(value)
  }, [value])

  useEffect(() => {
    setSelectedList(selectedListValue || [])
  }, [selectedListValue])

  useEffect(() => {
    if (hideAutoComplete) setOpen(false)
  }, [hideAutoComplete])

  const _filteredList = useMemo(() => {
    if (!searchValue) return []
    const selectedSet = new Set(selectedList.map((token) => token.address))
    return filterTokenFn(displayTokenList, {
      searchStr: searchValue,
      skipFn: (data) => selectedSet.has(data.address)
    })
  }, [searchValue, displayTokenList, selectedList])
  const filteredList = useDeferredValue(_filteredList)

  const [triggerWidth, setTriggerWidth] = useState(0)
  const anchorRef = useRef<HTMLDivElement>(null)
  useResizeObserver(anchorRef, ({ el }) => {
    setTriggerWidth(el.clientWidth)
  })

  // use keyboard arrow keys set active token
  const getEnabledActiveIndex = (index: number, offset = 1): number => {
    const len = filteredList.length
    for (let i = 0; i < len; i += 1) {
      const current = (index + i * offset + len) % len
      const { chainId } = filteredList[current] || {}
      if (chainId) {
        return current
      }
    }
    return -1
  }

  const [activeIndex, setActiveIndex] = useState(() => getEnabledActiveIndex(0))

  // Auto active first item when list length or searchValue changed
  useEffect(() => {
    setActiveIndex(getEnabledActiveIndex(0))
  }, [filteredList.length, searchValue])
  const listRef = useRef<HTMLDivElement>(null)
  const scrollIntoView = (args: number) => {
    const itemElement = listRef?.current?.children[args] as HTMLElement | undefined
    itemElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const { key } = event
      switch (key) {
        // >>> Arrow keys
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault()
          let offset = 0
          if (key === 'ArrowUp') {
            offset = -1
          } else if (key === 'ArrowDown') {
            offset = 1
          }
          if (offset !== 0) {
            const nextActiveIndex = getEnabledActiveIndex(activeIndex + offset, offset)
            scrollIntoView(nextActiveIndex)
            setActiveIndex(nextActiveIndex)
          }
          break
        }
        // >>> Select
        case 'Enter': {
          const item = filteredList[activeIndex]
          if (item) {
            const token = tokenMap.get(item.address!)
            if (token) {
              onSelectedListChange
                ? onSelectedListChange([...selectedList.concat([token])])
                : setSelectedList([...selectedList.concat([token])])
              onChange('')
            }
          } else {
            onChange('')
          }
          if (open) {
            event.preventDefault()
          }
          break
        }
        // >>> Close
        case 'Escape': {
          handleClose()
          event.currentTarget.blur()
          if (open) {
            event.stopPropagation()
          }
        }
      }
    },
    [filteredList, tokenMap, open, scrollIntoView, onSelectedListChange]
  )

  return (
    <Box {...boxProps}>
      <Popover isOpen={open} autoFocus={false} closeOnBlur={false} placement="bottom-start">
        <PopoverAnchor>
          <HStack
            ref={anchorRef}
            color={colors.textTertiary}
            background={colors.backgroundTransparent12}
            _hover={{ bg: colors.backgroundTransparent07 }}
            px="4"
            placeItems={'center'}
            borderRadius="100px"
            h={['34px', 10]}
          >
            {selectedList.length > 0 ? (
              <HStack>
                {selectedList.map((token, idx) => (
                  <TokenTag key={token.address} handleRemove={handleRemove} token={token} idx={idx}></TokenTag>
                ))}
              </HStack>
            ) : (
              <Box>
                <SearchIcon />
              </Box>
            )}
            {/* {selectedList.length ? selectedList.map((token) => <Tag key={token.address}>{token.symbol}</Tag>) : null} */}
            <Input
              flexGrow={1}
              ref={ref}
              onFocus={() => setOpen(true)}
              onBlur={handleClose}
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedList.length ? '' : t('common.search_all')!}
              h={['34px', 10]}
              borderRadius="100px"
              px={1}
              sx={{
                w: 'full',
                bg: 'transparent',
                caretColor: colors.textSecondary,
                _hover: {
                  bg: 'transparent'
                },
                _focus: {
                  borderColor: 'transparent',
                  bg: 'transparent'
                },
                _focusVisible: {
                  borderColor: 'transparent',
                  boxShadow: 'none'
                }
              }}
            />
            <Box flexShrink={0}>
              <Close
                width="10"
                height="10"
                color={colors.textSecondary}
                cursor="pointer"
                onClick={handleCleanInput}
                opacity={selectedList.length ? 1 : 0}
              />
            </Box>
          </HStack>
        </PopoverAnchor>

        <PopoverContent minW={['none', '400px']} maxW={'100%'}>
          <PopoverBody ref={listRef} py="2" px="4" maxH="200px" overflowY="auto" width={`${triggerWidth}px`}>
            {filteredList.length ? (
              filteredList.map((token, idx) => (
                <Flex
                  key={token.address}
                  data-mint={token.address}
                  onClick={handleClick}
                  onMouseMove={() => {
                    if (activeIndex === idx) {
                      return
                    }
                    setActiveIndex(idx)
                  }}
                  p="2"
                  bg={activeIndex === idx ? colors.backgroundDark : 'transparent'}
                  cursor="pointer"
                  borderRadius="4px"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="2"
                  mb={idx !== filteredList.length - 1 ? '3' : '0'}
                >
                  <Flex alignItems="flex-start" gap="2">
                    <TokenAvatar size="sm" mt="0.5" token={token} />
                    <Flex alignItems="center" gap="2" flexWrap="wrap">
                      <Text variant="title" color={colors.textPrimary} fontSize="md">
                        {token.symbol}
                      </Text>
                      <Text variant="label" fontSize="md">
                        {token.name}
                      </Text>
                    </Flex>
                  </Flex>
                  <AddressChip
                    textProps={{ px: '2', bg: colors.backgroundDark, borderRadius: '4px' }}
                    address={solToWSol(token.address).toString()}
                    canCopy={false}
                    canExternalLink
                    iconProps={{ fill: colors.textSecondary }}
                  />
                </Flex>
              ))
            ) : (
              <Text variant="label" fontSize="sm">
                {searchValue ? t('error.no_matches') : t('input.enter_search_token')}
              </Text>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}

function TokenTag(props: { token: ApiV3Token; handleRemove: (e: MouseEvent<HTMLDivElement>) => void; idx: number }) {
  return (
    <HStack rounded={'full'} p={1} gap={1} alignItems="center" bg={colors.backgroundDark}>
      <TokenAvatar flex={'none'} size="sm" token={props.token} />
      <Text flex={'none'} lineHeight={1} color={colors.textPrimary}>
        {props.token.symbol}
      </Text>
      <Box flex={'none'} onClick={props.handleRemove} ml={2} mr={1} data-idx={props.idx} cursor="pointer">
        <Close width={10} height={10} color={colors.textSecondary} />
      </Box>
    </HStack>
  )
}
