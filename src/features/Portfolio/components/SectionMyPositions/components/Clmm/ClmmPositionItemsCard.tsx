import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, GridItem, HStack, Tag, Text, Tooltip, Skeleton, useDisclosure } from '@chakra-ui/react'
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'
import Button from '@/components/Button'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useSubscribeClmmInfo, { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import Decimal from 'decimal.js'
import SwapHorizontalIcon from '@/icons/misc/SwapHorizontalIcon'
import ChevronDoubleDownIcon from '@/icons/misc/ChevronDoubleDownIcon'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { panelCard } from '@/theme/cssBlocks'
import ClmmPositionAccountItem from './ClmmPositionAccountItem'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { shortenAddress } from '@/utils/token'
import React, { useCallback, useState, useEffect } from 'react'

const LIST_THRESHOLD = 10

export function ClmmPositionItemsCard({
  poolInfo,
  isLoading,
  initRpcPoolData,
  setNoRewardClmmPos,
  ...props
}: {
  poolId: string | PublicKey
  isLoading: boolean
  positions: PositionWithUpdateFn[]
  poolInfo?: FormattedPoolInfoConcentratedItem
  initRpcPoolData?: RpcPoolData
  setNoRewardClmmPos: (val: string, isDelete?: boolean) => void
}) {
  const { t } = useTranslation()
  const { isOpen: baseIn, onToggle } = useDisclosure({ defaultIsOpen: true })
  const { isOpen: isSubscribe, onOpen: onSubscribe } = useDisclosure()
  const data = useSubscribeClmmInfo({ poolInfo, subscribe: isSubscribe || false })
  const { positions: totalPositions } = props
  const [positions, setPositions] = useState<PositionWithUpdateFn[]>([])
  const [pageCurrent, setPageCurrent] = useState(2)
  const pageTotal = Math.ceil(totalPositions.length / LIST_THRESHOLD)

  const rpcData = initRpcPoolData || data

  useEffect(() => {
    const currentIndex = pageCurrent * LIST_THRESHOLD
    const positions = totalPositions.length > currentIndex ? totalPositions.slice(0, currentIndex) : totalPositions
    setPositions(positions)
  }, [totalPositions, pageCurrent])

  const loadMore = useCallback(() => setPageCurrent((s) => (s < pageTotal ? s + 1 : s)), [])

  if (poolInfo && rpcData.currentPrice) poolInfo.price = rpcData.currentPrice
  if (!poolInfo) return isLoading ? <Skeleton w="full" height="140px" rounded="lg" /> : null

  return (
    <Grid
      {...panelCard}
      gridTemplate={[
        `
        "face " auto
        "price " auto
        "items " auto
        "action" auto / 1fr
      `,
        `
        "face price action " auto
        "items items items  " auto / 3fr 3fr 1fr
      `
      ]}
      py={[4, 5]}
      px={[3, 8]}
      bg={colors.backgroundLight}
      gap={[2, 4]}
      borderRadius="xl"
      alignItems={'center'}
    >
      <GridItem area="face" justifySelf={['stretch', 'left']}>
        <HStack justify="space-between">
          <HStack>
            <TokenAvatarPair size={['smi', 'md']} token1={poolInfo.mintA} token2={poolInfo.mintB} />
            <Text fontSize={['md', '20px']} fontWeight="500">
              {poolInfo.poolName.replace(' - ', '/')}
            </Text>
            <Tag size={['sm', 'md']} variant="rounded">
              {formatToRawLocaleStr(toPercentString(poolInfo.feeRate * 100))}
            </Tag>
          </HStack>
          <Text ml={6} color={colors.textTertiary}>
            {t('portfolio.id')}: {shortenAddress(poolInfo.id, 8).toLocaleLowerCase()}
          </Text>
        </HStack>
      </GridItem>

      <GridItem area="price" justifySelf={['stretch', 'left']}>
        <HStack justify="space-between">
          <Text color={colors.textTertiary}>
            {t('field.current_price')}:{' '}
            <Text as="span" color={colors.textPrimary}>
              {baseIn
                ? formatCurrency(poolInfo.price, {
                    decimalPlaces: poolInfo.recommendDecimal(poolInfo.price)
                  })
                : formatCurrency(new Decimal(1).div(poolInfo.price).toString(), {
                    decimalPlaces: poolInfo.recommendDecimal(new Decimal(1).div(poolInfo.price).toString())
                  })}
            </Text>{' '}
            {t('common.per_unit', {
              subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
              subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
            })}
          </Text>
          {/* switch button */}
          <Box alignSelf="center" ml={[0, 2]}>
            <Tooltip label={t('portfolio.section_positions_clmm_switch_direction_tooltip')}>
              <Box
                onClick={onToggle}
                px={['12px', '12px']}
                py={['5px', '6px']}
                color={colors.secondary}
                border="1px solid currentColor"
                rounded={['8px', '8px']}
                cursor="pointer"
                display={'flex'}
                alignItems={'center'}
              >
                <Desktop>
                  <SwapHorizontalIcon height={18} width={18} />
                </Desktop>
                <Mobile>
                  <SwapHorizontalIcon height={12} width={12} />
                </Mobile>
              </Box>
            </Tooltip>
          </Box>
        </HStack>
      </GridItem>

      <GridItem area={'action'} justifySelf={['center', 'right']}>
        <Link href={`/clmm/create-position?pool_id=${poolInfo.id}`}>
          <Button size="sm" variant="outline">
            {t('clmm.create_new_position')}
          </Button>
        </Link>
      </GridItem>

      <GridItem area={'items'}>
        <Flex flexDir="column" mt={[1, 0]} gap={3}>
          {positions.map((position) => (
            <ClmmPositionAccountItem
              key={position.nftMint.toBase58()}
              poolInfo={poolInfo!}
              position={position}
              baseIn={baseIn}
              initRpcPoolData={initRpcPoolData}
              setNoRewardClmmPos={setNoRewardClmmPos}
              onSubscribe={onSubscribe}
            />
          ))}
        </Flex>
        <Flex
          align="center"
          justifyContent="center"
          fontSize="sm"
          color={colors.textSeptenary}
          gap={1}
          mt="5"
          onClick={() => loadMore()}
          display={pageCurrent < pageTotal ? 'flex' : 'none'}
        >
          <Text cursor={'pointer'}>{t('portfolio.load_more')}</Text>
          <ChevronDoubleDownIcon cursor={'pointer'} width={16} height={16} color={colors.textSeptenary} />
        </Flex>
      </GridItem>
    </Grid>
  )
}
