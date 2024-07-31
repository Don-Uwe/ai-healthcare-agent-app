import PanelCard from '@/components/PanelCard'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenSelectDialog from '@/components/TokenSelectDialog'
import useFetchPoolByMint from '@/hooks/pool/useFetchPoolByMint'
import SubtractIcon from '@/icons/misc/SubtractIcon'
import EditIcon from '@/icons/misc/EditIcon'
import { useClmmStore } from '@/store/useClmmStore'
import { colors } from '@/theme/cssVariables/colors'
import ConnectedButton from '@/components/ConnectedButton'
import { Select } from '@/components/Select'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useTokenStore } from '@/store'
import { Box, Flex, HStack, SystemStyleObject, Tag, Text, useDisclosure } from '@chakra-ui/react'
import { ApiClmmConfigInfo, ApiV3Token, PoolFetchType, TokenInfo, solToWSol } from '@raydium-io/raydium-sdk-v2'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { percentFormatter } from '@/utils/numberish/formatter'

type Side = 'token1' | 'token2'

interface Props {
  completed: boolean
  isLoading: boolean
  onConfirm: (props: { token1: ApiV3Token; token2: ApiV3Token; ammConfig: ApiClmmConfigInfo }) => void
  onEdit: (step: number) => void
}

const SelectBoxSx: SystemStyleObject = {
  minW: '140px',
  cursor: 'pointer',
  py: '2',
  px: '4'
}

export default function SelectPoolTokenAndFee({ completed, isLoading, onConfirm, onEdit }: Props) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const clmmFeeConfigs = useClmmStore((s) => s.clmmFeeConfigs)
  const clmmFeeOptions = Object.values(clmmFeeConfigs)
  const [tokens, setTokens] = useState<{
    token1?: ApiV3Token
    token2?: ApiV3Token
  }>({})
  const { token1, token2 } = tokens
  const [currentConfig, setCurrentConfig] = useState<ApiClmmConfigInfo | undefined>()
  const poolKey = `${token1?.address}-${token2?.address}`
  const selectRef = useRef<Side>('token1')

  useTokenPrice({
    mintList: token1 && token2 ? [token1.address, token2.address] : [],
    timeout: 100
  })
  const whiteListMap = useTokenStore((s) => s.whiteListMap)

  const { data, isLoading: isExistingLoading } = useFetchPoolByMint({
    shouldFetch: !!token1 && !!token2,
    mint1: token1 ? solToWSol(token1.address).toString() : '',
    mint2: token2 ? solToWSol(token2.address || '').toString() : '',
    type: PoolFetchType.Concentrated
  })

  const existingPools: Map<string, string> = useMemo(
    () =>
      (data || [])
        .filter((pool) => {
          const [token1Mint, token2Mint] = [
            token1 ? solToWSol(token1.address).toString() : '',
            token2 ? solToWSol(token2.address || '').toString() : ''
          ]
          return (
            (pool.mintA?.address === token1Mint && pool.mintB?.address === token2Mint) ||
            (pool.mintA?.address === token2Mint && pool.mintB?.address === token1Mint)
          )
        })
        .reduce((acc, cur) => acc.set(cur.id, cur.config.id), new Map()),
    [token1?.address, token2?.address, data]
  )

  const isSelectedExisted = !!currentConfig && new Set(existingPools.values()).has(currentConfig.id)
  useEffect(() => () => setCurrentConfig(undefined), [poolKey, isSelectedExisted])

  useEffect(() => {
    if (isExistingLoading) return
    const defaultConfig = Object.values(clmmFeeConfigs || {}).find((c) => c.tradeFeeRate === 2500)
    if (!new Set(existingPools.values()).has(defaultConfig?.id || '')) {
      if (defaultConfig) setCurrentConfig(defaultConfig)
      return
    }
  }, [poolKey, existingPools, clmmFeeConfigs, isExistingLoading])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      selectRef.current = e.currentTarget.dataset['side'] as Side
      onOpen()
    },
    [onOpen]
  )

  const handleSelect = useCallback((val: ApiV3Token) => {
    if (val?.tags.includes('hasFreeze') && !whiteListMap.has(val.address)) {
      // toastSubject.next({
      //   title: t('token_selector.token_freeze_warning'),
      //   description: t('token_selector.token_has_freeze_disable'),
      //   status: 'warning'
      // })
      // return
    }
    onClose()
    setTokens((preVal) => {
      const anotherSide = selectRef.current === 'token1' ? 'token2' : 'token1'
      const isDuplicated = val.address === preVal[anotherSide]?.address
      return { [anotherSide]: isDuplicated ? undefined : preVal[anotherSide], [selectRef.current]: val }
    })
  }, [])

  const filterFn = useCallback((t: TokenInfo) => t.address !== tokens[selectRef.current]?.address, [tokens])

  const handleConfirm = () => {
    onConfirm({
      token1: tokens.token1!,
      token2: tokens.token2!,
      ammConfig: currentConfig!
    })
  }
  let error = tokens.token1 ? (tokens.token2 ? undefined : 'common.quote_token') : 'common.base_token'
  error = error || (currentConfig ? undefined : 'field.fee_tier')

  if (completed) {
    return (
      <PanelCard px={[3, 6]} py="3">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex gap="2" alignItems="center">
            <TokenAvatarPair {...tokens} />
            <Text fontSize="lg" fontWeight="500" color={colors.textPrimary}>
              {tokens.token1?.symbol} / {tokens.token2?.symbol}
            </Text>
            <Tag size="sm" variant="rounded">
              {t('field.fee')} {percentFormatter.format((currentConfig?.tradeFeeRate || 0) / 1000000)}
            </Tag>
          </Flex>
          <EditIcon cursor="pointer" onClick={() => onEdit(0)} />
        </Flex>
      </PanelCard>
    )
  }
  return (
    <PanelCard p={[3, 6]}>
      <Text variant="title" mb="4">
        {t('common.tokens')}
      </Text>
      <Flex gap="2" alignItems="center" mb="6">
        <Box data-side="token1" flex="1" bg={colors.backgroundDark} rounded="xl" onClick={handleClick} sx={SelectBoxSx}>
          <Text variant="label" mb="2">
            {t('common.base_token')}
          </Text>
          <Flex gap="2" alignItems="center" justifyContent="space-between">
            {tokens.token1 ? (
              <Flex gap="2" alignItems="center">
                <TokenAvatar token={tokens.token1} />
                <Text variant="title" color={colors.textPrimary}>
                  {tokens.token1.symbol}
                </Text>
              </Flex>
            ) : (
              <Text variant="title" fontSize="lg" opacity="0.5">
                {t('common.select')}
              </Text>
            )}
            <ChevronDown color={colors.textSecondary} opacity="0.5" />
          </Flex>
        </Box>
        <Box data-side="token2" flex="1" bg={colors.backgroundDark} rounded="xl" onClick={handleClick} sx={SelectBoxSx}>
          <Text variant="label" mb="2">
            {t('common.quote_token')}
          </Text>
          <Flex gap="2" alignItems="center" justifyContent="space-between">
            {tokens.token2 ? (
              <Flex gap="2" alignItems="center">
                <TokenAvatar token={tokens.token2} />
                <Text variant="title" color={colors.textPrimary}>
                  {tokens.token2.symbol}
                </Text>
              </Flex>
            ) : (
              <Text variant="title" fontSize="lg" opacity="0.5">
                {t('common.select')}
              </Text>
            )}
            <ChevronDown color={colors.textSecondary} opacity="0.5" />
          </Flex>
        </Box>
      </Flex>
      <TokenSelectDialog onClose={onClose} isOpen={isOpen} filterFn={filterFn} onSelectValue={handleSelect} />

      <Text variant="title" mb="4">
        {t('field.fee_tier')}
      </Text>
      <Flex w="full" gap="2">
        <Select
          variant="filledDark"
          items={clmmFeeOptions}
          value={currentConfig}
          renderItem={(v, idx) => {
            if (v) {
              const existed = new Set(existingPools.values()).has(v.id)
              const selected = currentConfig?.id === v.id
              const isLastItem = idx === clmmFeeOptions.length - 1
              return (
                <HStack
                  color={colors.textPrimary}
                  opacity={existed ? 0.5 : 1}
                  cursor={existed ? 'not-allowed' : 'pointer'}
                  justifyContent="space-between"
                  mx={4}
                  py={2.5}
                  fontSize="sm"
                  borderBottom={isLastItem ? 'none' : `1px solid ${colors.buttonBg01}`}
                  _hover={{
                    borderBottom: '1px solid transparent'
                  }}
                >
                  <Text>{percentFormatter.format(v.tradeFeeRate / 1000000)}</Text>
                  {selected && <SubtractIcon />}
                </HStack>
              )
            }
            return null
          }}
          renderTriggerItem={(v) => (v ? <Text fontSize="sm">{percentFormatter.format(v.tradeFeeRate / 1000000)}</Text> : null)}
          onChange={(val) => {
            const existed = new Set(existingPools.values()).has(val.id)
            const selected = currentConfig?.id === val.id
            !existed && !selected && setCurrentConfig(val)
          }}
          sx={{
            w: 'full',
            height: '42px'
          }}
          popoverContentSx={{
            border: `1px solid ${colors.selectInactive}`,
            py: 0
          }}
          popoverItemSx={{
            p: 0,
            lineHeight: '18px',
            _hover: {
              bg: colors.modalContainerBg
            }
          }}
          icons={{
            open: <ChevronUp color={colors.textSecondary} opacity="0.5" />,
            close: <ChevronDown color={colors.textSecondary} opacity="0.5" />
          }}
        />
      </Flex>
      <ConnectedButton mt="8" isDisabled={!!error || !currentConfig} isLoading={isLoading || isExistingLoading} onClick={handleConfirm}>
        {error ? `${t('common.select')} ${t(error)}` : t('button.continue')}
      </ConnectedButton>
    </PanelCard>
  )
}
