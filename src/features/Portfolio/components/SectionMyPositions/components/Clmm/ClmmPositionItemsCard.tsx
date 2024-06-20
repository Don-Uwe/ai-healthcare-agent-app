import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, GridItem, HStack, Tag, Text, Tooltip, Skeleton, useDisclosure } from '@chakra-ui/react'
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'
import Button from '@/components/Button'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import List from '@/components/List'
import { colors } from '@/theme/cssVariables'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useSubscribeClmmInfo, { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import Decimal from 'decimal.js'
import SwapHorizontalIcon from '@/icons/misc/SwapHorizontalIcon'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { panelCard } from '@/theme/cssBlocks'
import ClmmPositionAccountItem from './ClmmPositionAccountItem'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'

const LIST_THRESHOLD = 5

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

  const rpcData = initRpcPoolData || data

  if (poolInfo && rpcData.currentPrice) poolInfo.price = rpcData.currentPrice
  if (!poolInfo) return isLoading ? <Skeleton w="full" height="140px" rounded="lg" /> : null

  const renderPoolListItem = (position: PositionWithUpdateFn) => {
    return (
      <ClmmPositionAccountItem
        key={position.nftMint.toBase58()}
        poolInfo={poolInfo!}
        position={position}
        baseIn={baseIn}
        initRpcPoolData={initRpcPoolData}
        setNoRewardClmmPos={setNoRewardClmmPos}
        onSubscribe={onSubscribe}
      />
    )
  }
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
        "items items items  " auto / 1fr 1fr 1fr
      `
      ]}
      py={[4, 5]}
      px={[3, 8]}
      bg={colors.backgroundLight}
      gap={[2, 4]}
      borderRadius="xl"
      alignItems={'center'}
    >
      <GridItem area="face">
        <HStack>
          <TokenAvatarPair size={['smi', 'md']} token1={poolInfo.mintA} token2={poolInfo.mintB} />

          <Text fontSize={['md', '20px']} fontWeight="500">
            {poolInfo.poolName}
          </Text>

          <Tag size={['sm', 'md']} variant="rounded">
            {formatToRawLocaleStr(toPercentString(poolInfo.feeRate * 100))}
          </Tag>

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

      <GridItem area="price" justifySelf={['left', 'left']}>
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
      </GridItem>

      <GridItem area={'action'} justifySelf={['center', 'right']}>
        <Link href={`/clmm/create-position?pool_id=${poolInfo.id}`}>
          <Button size="sm" variant="outline">
            {t('clmm.create_new_position')}
          </Button>
        </Link>
      </GridItem>

      <GridItem area={'items'}>
        <Flex flexDir="column" mt={[1, 0]} gap={props.positions.length > LIST_THRESHOLD ? 0 : 3}>
          {props.positions.length > LIST_THRESHOLD ? (
            <List
              maxHeight="400px"
              overflowX="hidden"
              gap={3}
              items={props.positions}
              initRenderCount={LIST_THRESHOLD + 1}
              reachBottomMargin={100}
              getItemKey={(position) => position.nftMint.toBase58()}
            >
              {renderPoolListItem}
            </List>
          ) : (
            props.positions.map((position) => (
              <ClmmPositionAccountItem
                key={position.nftMint.toBase58()}
                poolInfo={poolInfo!}
                position={position}
                baseIn={baseIn}
                initRpcPoolData={initRpcPoolData}
                setNoRewardClmmPos={setNoRewardClmmPos}
                onSubscribe={onSubscribe}
              />
            ))
          )}
        </Flex>
      </GridItem>
    </Grid>
  )
}
