import { useCallback, useMemo } from 'react'
import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Text,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useClipboard
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import TokenAvatar from '@/components/TokenAvatar'
import { aprColors, PoolListItemAprLine } from '@/features/Pools/components/PoolListItemAprLine'
import CopyIcon from '@/icons/misc/CopyIcon'
import ExternalLinkLargeIcon from '@/icons/misc/ExternalLinkLargeIcon'
import { colors } from '@/theme/cssVariables'
import Decimal from 'decimal.js'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { wSolToSolString } from '@/utils/token'
import { encodeStr } from '@/utils/common'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import { panelCard } from '@/theme/cssBlocks'
import toPercentString from '@/utils/numberish/toPercentString'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import { useAppStore, supportedExplorers } from '@/store/useAppStore'

export default function PoolInfo({ pool }: { pool?: FormattedPoolInfoStandardItem }) {
  const { t } = useTranslation()
  const [baseToken, quoteToken] = [pool?.mintA, pool?.mintB]

  const feeApr = pool?.allApr.week.find((s) => s.isTradingFee)
  const rewardApr = pool?.allApr.week.filter((s) => !s.isTradingFee && !!s.token) || []
  const aprData = useMemo(
    () => ({
      fee: {
        apr: feeApr?.apr || 0,
        percentInTotal: feeApr?.percent || 0
      },
      rewards:
        rewardApr.map((r) => ({
          apr: r.apr,
          percentInTotal: r.percent,
          mint: r.token!
        })) || [],
      apr: rewardApr.reduce((acc, cur) => acc + cur.apr, 0)
    }),
    [pool]
  )

  const onCopySuccess = useCallback((content: string) => {
    toastSubject.next({
      status: 'success',
      title: t('common.copy_success'),
      description: content
    })
  }, [])

  return (
    <Flex {...panelCard} bg={colors.backgroundLight} borderRadius="20px" py={7} px={6} direction="column">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize={['xs', 'sm']} color={colors.textTertiary}>
            {t('liquidity.total_apr_7d')}
          </Text>
          <Text mt={1} mb="6px" fontSize={['md', 'lg']} fontWeight={500} color={colors.textPrimary}>
            {toPercentString(pool?.week.apr)}
          </Text>
          <PoolListItemAprLine aprData={aprData} />
        </Box>
        <Popover trigger="hover" placement="top-end">
          <PopoverTrigger>
            <div>
              <InfoCircleIcon width={18} height={18} color={colors.secondary} />
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <Grid gap={4} py={1} rowGap="2px" templateColumns={'fit-content(60px) fit-content(80px) fit-content(30px)'}>
                {baseToken && (
                  <InfoRowItem symbol={wSolToSolString(baseToken.symbol)} address={baseToken.address} onCopySuccess={onCopySuccess} />
                )}
                {quoteToken && (
                  <InfoRowItem symbol={wSolToSolString(quoteToken.symbol)} address={quoteToken.address} onCopySuccess={onCopySuccess} />
                )}
                {pool?.lpMint?.address && (
                  <InfoRowItem symbol={t('common.lp')} address={pool.lpMint.address} onCopySuccess={onCopySuccess} />
                )}
                {pool?.id && <InfoRowItem symbol={t('common.amm_id')} address={pool.id} onCopySuccess={onCopySuccess} />}
                {pool?.marketId && <InfoRowItem symbol={t('common.market_id')} address={pool.marketId} onCopySuccess={onCopySuccess} />}
              </Grid>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
      <VStack spacing={0} mt={8}>
        {pool?.allApr.week.map(({ apr, isTradingFee, token }, idx) => (
          <Flex
            w="full"
            key={`reward-${idx}-${isTradingFee ? 'Trade Fees' : wSolToSolString(token?.symbol)}`}
            justify={'space-between'}
            align="center"
          >
            <Flex fontWeight="normal" color={colors.textSecondary} justify="flex-start" align="center">
              <Box rounded="full" bg={aprColors[idx]} w="7px" h="7px" mr="10px" />
              <Text color={colors.textTertiary} fontSize="sm" mr={1}>
                {isTradingFee ? t('common.fees') : t('common.reward')}
              </Text>
              {token && (
                <HStack spacing="-2px">
                  <TokenAvatar token={token} size="xs" />
                </HStack>
              )}
            </Flex>
            <Text fontSize="sm" color={colors.textSecondary}>
              {toPercentString(Math.floor(Number(apr || 0) * 100) / 100)}
            </Text>
          </Flex>
        ))}
      </VStack>

      <Flex justify={'space-between'} align="center" mt="33px" mb={1}>
        <Text color={colors.textSecondary} fontSize="sm">
          {t('liquidity.pool_liquidity')}
        </Text>
        <Text color={colors.textSecondary} fontSize="sm" opacity={0.6}>
          {pool ? `$${formatLocaleStr(new Decimal(pool.lpAmount).mul(pool.lpPrice).toString())}` : '-'}
        </Text>
      </Flex>
      <Flex mt={2} justify={'space-between'} align="center">
        <HStack spacing="6px">
          <Text color={colors.textSecondary} fontSize="sm" opacity={0.6}>
            {t('liquidity.pooled')} {wSolToSolString(baseToken?.symbol)}
          </Text>
          <TokenAvatar token={baseToken} size="sm" />
        </HStack>
        <Text color={colors.textSecondary} fontSize="sm" fontWeight="medium">
          {pool ? formatLocaleStr(pool.mintAmountA) : '-'}
        </Text>
      </Flex>
      <Flex mt={2} justify="space-between" align="center">
        <HStack spacing="6px">
          <Text color={colors.textSecondary} fontSize="sm" opacity={0.6}>
            {t('liquidity.pooled')} {wSolToSolString(quoteToken?.symbol)}
          </Text>
          <TokenAvatar token={quoteToken} size="sm" />
        </HStack>
        <Text color={colors.textSecondary} fontSize="sm" fontWeight="medium">
          {pool ? formatLocaleStr(pool.mintAmountB) : '-'}
        </Text>
      </Flex>
    </Flex>
  )
}

function InfoRowItem({ onCopySuccess, symbol, address }: { onCopySuccess?(text: string): void; symbol?: string | null; address?: string }) {
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const copyContent = address ?? ''
  const { onCopy, hasCopied } = useClipboard(copyContent)
  return (
    <>
      <GridItem>
        <Text fontSize="xs" color={colors.textSecondary}>
          {symbol}
        </Text>
      </GridItem>
      <GridItem>
        <Text fontSize="xs" color={colors.textTertiary}>
          {encodeStr(address, 6, 3)}
        </Text>
      </GridItem>
      <GridItem>
        <HStack spacing={0}>
          <Box
            cursor={hasCopied ? 'default' : 'pointer'}
            onClick={
              hasCopied
                ? undefined
                : () => {
                    onCopy()
                    onCopySuccess?.(copyContent)
                  }
            }
          >
            <CopyIcon fill={colors.textSecondary} />
          </Box>
          {address && (
            <a
              href={explorerUrl === supportedExplorers[0]?.host ? `${explorerUrl}/token/${address}` : `${explorerUrl}/address/${address}`}
              rel="noreferrer"
              target="_blank"
            >
              <Box cursor="pointer">
                <ExternalLinkLargeIcon color={colors.textSecondary} />
              </Box>
            </a>
          )}
        </HStack>
      </GridItem>
    </>
  )
}
