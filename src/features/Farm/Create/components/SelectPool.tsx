import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, HStack, Link, Spacer, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { ApiV3PoolInfoItem, ApiV3PoolInfoConcentratedItem, PoolFetchType } from '@raydium-io/raydium-sdk-v2'
import Button from '@/components/Button'
import PoolSelectDialog from '@/features/Farm/Create/components/PoolSelectDialog'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { useEvent } from '@/hooks/useEvent'
import CircleCheck from '@/icons/misc/CircleCheck'
import SearchIcon from '@/icons/misc/SearchIcon'
import { colors } from '@/theme/cssVariables'
import formatNumber from '@/utils/numberish/formatNumber'
import { getPoolName } from '@/features/Pools/util'
import { CreateFarmType } from '@/features/Liquidity/utils'

import NextLink from 'next/link'
import { Desktop } from '@/components/MobileDesktop'
import { panelCard } from '@/theme/cssBlocks'
// import { QuestionToolTip } from '@/components/QuestionToolTip'

type SelectPoolProps = {
  selectedPoolType: CreateFarmType
  createdClmmPools: ApiV3PoolInfoConcentratedItem[]

  selectedPool?: ApiV3PoolInfoItem
  onSelectPool: (pool?: ApiV3PoolInfoItem) => void

  onClickContinue?: () => void
  onSelectPoolType?: (poolType: CreateFarmType) => void
}

export default function SelectPool(props: SelectPoolProps) {
  const { t } = useTranslation()

  const onDeleteStandardValue = useEvent(() => {
    props.onSelectPool(undefined)
  })

  return (
    <Flex {...panelCard} direction="column" borderRadius="20px" w="full" bg={colors.backgroundLight} p={[4, 6]}>
      <Desktop>
        <Text mb={4} fontWeight="500" fontSize="xl">
          {t('create_farm.select_pool')}
        </Text>
      </Desktop>

      <HStack flexDirection={['column', 'row']} align={['stretch', 'center']} mb={4}>
        <PoolTypeTabItem
          isActive={props.selectedPoolType === 'Concentrated'}
          name={t('create_farm.concentrated_liquidity')}
          onSelect={() => props.onSelectPoolType?.('Concentrated')}
        />
        <PoolTypeTabItem
          isActive={props.selectedPoolType === 'Standard'}
          name={t('create_farm.standard_amm')}
          onSelect={() => props.onSelectPoolType?.('Standard')}
        />
      </HStack>

      <Box mb={5}>
        {props.selectedPoolType === 'Concentrated' ? (
          <SelectPoolConcentratedContent
            createdClmmPools={props.createdClmmPools}
            selectedPool={props.selectedPool}
            onSelectConcentratedValue={props.onSelectPool}
          />
        ) : (
          <SelectPoolStandardContent
            selectedPool={props.selectedPool}
            onSelectStandardValue={props.onSelectPool}
            onDeleteStandardValue={onDeleteStandardValue}
          />
        )}
      </Box>

      <Button isDisabled={!props.selectedPool} onClick={() => props.onClickContinue?.()}>
        {t('button.continue')}
      </Button>
    </Flex>
  )
}

function PoolTypeTabItem({ name, isActive, onSelect: onClickSelf }: { name: string; isActive?: boolean; onSelect?: () => void }) {
  return (
    <HStack
      flexGrow={1}
      color={isActive ? colors.secondary : colors.textTertiary}
      bg={colors.backgroundTransparent12}
      px={3}
      py={1.5}
      rounded="md"
      cursor="pointer"
      onClick={onClickSelf}
    >
      <Box display="grid" placeItems="center">
        <Box gridRow={1} gridColumn={1} rounded="full" p="3px" bg={isActive ? colors.secondary : colors.textSecondary}></Box>
        <Box gridRow={1} gridColumn={1} rounded="full" p="8px" opacity={0.3} bg={isActive ? colors.secondary : colors.textSecondary}></Box>
      </Box>
      <Text whiteSpace="nowrap" fontSize="sm">
        {name}
      </Text>
    </HStack>
  )
}

function SelectPoolStandardContent(props: {
  selectedPool: ApiV3PoolInfoItem | undefined
  onSelectStandardValue: (pool: ApiV3PoolInfoItem) => void
  onDeleteStandardValue: () => void
}) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const onSearchClick = useEvent(() => {
    onOpen()
  })
  return (
    <Box>
      <Box mb={5}>
        {props.selectedPool ? (
          <SelectPoolStandardContentSelectedPool pool={props.selectedPool} onDeleteStandardValue={props.onDeleteStandardValue} />
        ) : (
          <Flex
            justify="space-between"
            align="center"
            h="72px"
            bg={colors.backgroundDark}
            py={3}
            px={4}
            color={colors.textSecondary}
            borderRadius="12px"
            gap={2}
            onClick={onSearchClick}
            cursor="pointer"
          >
            <>
              <Text color={colors.textSecondary} fontSize="sm" opacity={0.5} cursor="pointer">
                {t('input.search_for_a_pair_or_enter_amm_id')}
              </Text>
              <SearchIcon />
            </>
          </Flex>
        )}
      </Box>

      <HStack fontSize={'sm'}>
        <Text color={colors.textTertiary}>{t('create_farm.foot_note')}</Text>
        <Link as={NextLink} href="/liquidity/create-pool">
          <Text cursor="pointer" color={colors.textSeptenary} textDecoration="underline">
            {t('create_farm.foot_note_link')}
          </Text>
        </Link>
      </HStack>
      <PoolSelectDialog poolType={PoolFetchType.Standard} isOpen={isOpen} onSelectValue={props.onSelectStandardValue} onClose={onClose} />
    </Box>
  )
}

function SelectPoolStandardContentSelectedPool({
  pool,
  onDeleteStandardValue
}: {
  pool: ApiV3PoolInfoItem
  onDeleteStandardValue: () => void
}) {
  const { t } = useTranslation()
  const poolName = useMemo(() => `${pool.mintA.symbol}-${pool.mintB.symbol}`, [pool.id])
  return (
    <VStack align={'stretch'}>
      <HStack
        borderWidth={'2px'}
        borderStyle="solid"
        borderColor={colors.secondary}
        bg={colors.backgroundDark}
        p={4}
        pl={6}
        rounded={'md'}
        cursor={'pointer'}
      >
        <TokenAvatarPair token1={pool.mintA} token2={pool.mintB} />
        <Text whiteSpace="nowrap" fontSize="xl" fontWeight={500}>
          {poolName}
        </Text>
        <Spacer />
        <Box>
          <Text fontSize="sm" color={colors.textSecondary} align={'end'}>
            {pool.id.slice(0, 6)}...{pool.id.slice(-6)}
          </Text>
          <Text whiteSpace="nowrap" fontSize="sm" color={colors.textTertiary} align={'end'}>
            TVL: {formatNumber(pool.tvl)}
          </Text>
        </Box>
      </HStack>

      <HStack fontSize={'sm'} alignSelf={'end'}>
        <Text cursor="pointer" color={colors.textSeptenary} textDecoration="underline" onClick={onDeleteStandardValue}>
          {t('button.reset')}
        </Text>
      </HStack>
    </VStack>
  )
}

function SelectPoolConcentratedContent(props: {
  createdClmmPools: ApiV3PoolInfoConcentratedItem[]
  selectedPool: ApiV3PoolInfoItem | undefined
  onSelectConcentratedValue: (pool: ApiV3PoolInfoItem) => void
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <HStack mb={4} color={colors.textSecondary} fontSize="sm">
        <Text>{t('create_farm.select_from_your_created_pools')}:</Text>
        {/* <QuestionToolTip label={t('create_farm.select_from_your_created_pools_tooltip')} iconProps={{ color: colors.textSecondary }} /> */}
      </HStack>

      <VStack spacing={3} mb={[3, 5]} align={'stretch'}>
        {props.createdClmmPools.map((pool) => (
          <CreatedPoolClmmItem
            key={pool.id}
            isActive={pool.id === props.selectedPool?.id}
            pool={pool}
            onSelect={props.onSelectConcentratedValue}
          />
        ))}
      </VStack>

      <HStack fontSize={'sm'}>
        <Text color={colors.textTertiary}>{t('create_farm.foot_note')}</Text>
        <Link as={NextLink} href="/clmm/create-pool">
          {t('create_farm.foot_note_link')}
        </Link>
      </HStack>
    </Box>
  )
}

function CreatedPoolClmmItem({
  pool,
  isActive,
  onSelect
}: {
  pool: ApiV3PoolInfoItem
  isActive?: boolean
  onSelect?(pool: ApiV3PoolInfoItem): void
}) {
  return (
    <HStack
      borderWidth={'2px'}
      borderStyle="solid"
      borderColor={isActive ? colors.secondary : 'transparent'}
      bg={colors.backgroundDark}
      py={4}
      px={[3, 6]}
      rounded={'md'}
      cursor={'pointer'}
      onClick={() => onSelect?.(pool)}
    >
      <TokenAvatarPair size={['28px', 'md']} token1={pool.mintA} token2={pool.mintB} />
      <Text flex={1} fontSize={['lg', 'xl']} fontWeight={500}>
        {getPoolName(pool)}
      </Text>
      <Box>
        <Text fontSize={['xs', 'sm']} color={colors.textSecondary} align={'end'}>
          {pool.id.slice(0, 6)}...{pool.id.slice(-6)}
        </Text>
        <Text whiteSpace="nowrap" fontSize={['xs', 'sm']} color={colors.textTertiary} align={'end'}>
          TVL: {formatNumber(pool.tvl)}
        </Text>
      </Box>
      <Box display="grid" placeItems={'center'} color={colors.secondary}>
        {isActive ? <CircleCheck></CircleCheck> : <Box width={4} height={4}></Box>}
      </Box>
    </HStack>
  )
}
