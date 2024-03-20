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

export default function PoolInfo({ pool }: { pool?: FormattedPoolInfoStandardItem }) {
  const { t } = useTranslation()
  const { onCopy, setValue } = useClipboard('')
  const [baseToken, quoteToken] = [pool?.mintA, pool?.mintB]

  const handleCopy = useCallback((val: string) => {
    setValue(val)
    onCopy()
    toastSubject.next({
      status: 'success',
      title: t('common.copy_success'),
      description: val
    })
  }, [])

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
                  <>
                    <GridItem>
                      <Text fontSize="xs" color={colors.textSecondary}>
                        {wSolToSolString(baseToken.symbol)}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="xs" color={colors.textTertiary}>
                        {encodeStr(baseToken.address, 6, 3)}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={0}>
                        <CopyIcon
                          fill={colors.textSecondary}
                          cursor="pointer"
                          onClick={baseToken ? () => handleCopy(baseToken.address) : undefined}
                        />
                        <ExternalLinkLargeIcon color={colors.textSecondary} />
                      </HStack>
                    </GridItem>
                  </>
                )}
                {quoteToken && (
                  <>
                    <GridItem>
                      <Text fontSize="xs" color={colors.textSecondary}>
                        {wSolToSolString(quoteToken.symbol)}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="xs" color={colors.textTertiary}>
                        {encodeStr(quoteToken.address, 6, 3)}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={0}>
                        <CopyIcon
                          fill={colors.textSecondary}
                          cursor="pointer"
                          onClick={quoteToken ? () => handleCopy(quoteToken.address) : undefined}
                        />
                        <ExternalLinkLargeIcon color={colors.textSecondary} />
                      </HStack>
                    </GridItem>
                  </>
                )}
                <GridItem>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    {t('common.lp')}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {pool ? encodeStr(pool.lpMint.address, 6, 3) : '-'}
                  </Text>
                </GridItem>
                <GridItem>
                  <HStack spacing={0}>
                    <CopyIcon
                      fill={colors.textSecondary}
                      cursor="pointer"
                      onClick={pool ? () => handleCopy(pool.lpMint.address) : undefined}
                    />
                    <ExternalLinkLargeIcon color={colors.textSecondary} />
                  </HStack>
                </GridItem>
                <GridItem>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    {t('common.amm_id')}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {pool ? encodeStr(pool.id, 6, 3) : '-'}
                  </Text>
                </GridItem>
                <GridItem>
                  <HStack spacing={0}>
                    <CopyIcon fill={colors.textSecondary} cursor="pointer" onClick={pool ? () => handleCopy(pool.id) : undefined} />
                    <ExternalLinkLargeIcon color={colors.textSecondary} />
                  </HStack>
                </GridItem>
                <GridItem>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    {t('common.market_id')}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="xs" color={colors.textTertiary}>
                    {pool ? encodeStr(pool.programId, 6, 3) : '-'}
                  </Text>
                </GridItem>
                <GridItem>
                  <HStack spacing={0}>
                    <CopyIcon fill={colors.textSecondary} cursor="pointer" onClick={pool ? () => handleCopy(pool.programId) : undefined} />
                    <ExternalLinkLargeIcon color={colors.textSecondary} />
                  </HStack>
                </GridItem>
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
