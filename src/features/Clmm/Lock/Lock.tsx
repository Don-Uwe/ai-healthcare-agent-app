import { Box, Button, Flex, Grid, GridItem, HStack, Skeleton, Text, useDisclosure } from '@chakra-ui/react'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { colors } from '@/theme/cssVariables/colors'
import { routeBack } from '@/utils/routeTools'
import LiquidityItem from './components/LiquidityItem'
import LiquidityLockModal from './components/LiquidityLockModal'
import useAllPositionInfo from '@/hooks/portfolio/useAllPositionInfo'
import { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { BN } from 'bn.js'

export default function Lock() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { clmmBalanceInfo, formattedClmmDataMap, clmmLockInfo, mutateClmmLockInfo, isLoading } = useAllPositionInfo({ shouldFetch: false })
  const { data: tokenPrices } = useTokenPrice({
    mintList: Object.values(formattedClmmDataMap)
      .map((pool) => [pool.mintA.address, pool.mintB.address])
      .flat()
  })
  const [selectedPosition, setSelectedPosition] = useState<ClmmPosition | null>(null)

  const handleSelectPosition = useCallback((position: ClmmPosition) => {
    setSelectedPosition(position)
  }, [])

  const allPosition: ClmmPosition[] = useMemo(() => {
    const positionsByPool = Array.from(clmmBalanceInfo.values())
    positionsByPool.sort(
      (a, b) => (formattedClmmDataMap[b[0].poolId.toBase58()]?.tvl || 0) - (formattedClmmDataMap[a[0].poolId.toBase58()]?.tvl || 0)
    )
    positionsByPool.forEach((positions) => {
      positions.sort((a, b) => {
        if (a.liquidity.isZero() && !b.liquidity.isZero()) return 1
        if (b.liquidity.isZero() && !a.liquidity.isZero()) return -1
        return a.tickLower - b.tickLower
      })
    })
    return positionsByPool.flat().filter((p) => p.liquidity.gt(new BN(0)))
  }, [clmmBalanceInfo, formattedClmmDataMap])

  useEffect(() => {
    if (!allPosition.length) setSelectedPosition(null)
  }, [allPosition.length])

  return (
    <>
      <Grid
        gridTemplate={[
          `
            "back  " auto
            "panel  " minmax(80px, 1fr) / 1fr  
          `,
          `
            "back panel  " auto / 1fr minmax(640px, 2fr) 1fr
          `,
          `
            "back panel  . " auto / 1fr minmax(auto, 640px) 1fr
          `
        ]}
        columnGap={[4, '5%']}
        rowGap={[4, '2vh']}
        mt={[2, 8]}
      >
        <GridItem area={'back'}>
          <Flex>
            <HStack
              cursor="pointer"
              onClick={() => {
                routeBack()
              }}
              color={colors.textTertiary}
              fontWeight="500"
              fontSize={['md', 'xl']}
            >
              <ChevronLeftIcon />
              <Text>{t('common.back')}</Text>
            </HStack>
          </Flex>
        </GridItem>

        <GridItem area="panel">
          <Flex
            flexDirection="column"
            bg={colors.backgroundLight}
            border={`1px solid ${colors.buttonSolidText}`}
            borderRadius="20px"
            px={[3, 7]}
            py={6}
          >
            <Text fontSize="xl" fontWeight="medium" lineHeight="26px" mb={3}>
              {t('liquidity.lock_title')}
            </Text>
            <Box color={colors.lightPurple} fontSize="md" lineHeight="20px" mb={7}>
              <Text mb={7}>{t('liquidity.lock_desc1')}</Text>
              <Text mb={7}>
                <Trans i18nKey="liquidity.lock_desc2">
                  <Text as="span" fontWeight="bold"></Text>
                </Trans>
              </Text>
              <Text>{t('liquidity.lock_desc3')}</Text>
            </Box>
            <Flex flexDirection="column" gap={3} mb={7}>
              {isLoading ? (
                <Flex direction={['column']} gap={3}>
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                </Flex>
              ) : allPosition.length === 0 ? (
                <Box textAlign="center" fontSize="sm" color={colors.lightPurple} bg={colors.backgroundDark} rounded="md" py={7}>
                  {t('liquidity.lock_clmm_positions_empty')}
                </Box>
              ) : (
                allPosition.map((position) => {
                  const positionNft = position.nftMint.toBase58()
                  const poolId = position.poolId.toBase58()
                  const poolInfo = formattedClmmDataMap[poolId]
                  if (!poolInfo || clmmLockInfo[poolId]?.[positionNft]) return null
                  return (
                    <LiquidityItem
                      key={positionNft}
                      position={position}
                      poolInfo={poolInfo}
                      tokenPrices={tokenPrices}
                      isSelected={selectedPosition?.nftMint.toBase58() === positionNft}
                      onClick={() => handleSelectPosition(position)}
                    />
                  )
                })
              )}
            </Flex>
            <Button isDisabled={selectedPosition === null} width="100%" onClick={onOpen}>
              {t('liquidity.lock_liquidity')}
            </Button>
          </Flex>
        </GridItem>
      </Grid>
      {selectedPosition && formattedClmmDataMap[selectedPosition.poolId.toBase58()] && (
        <LiquidityLockModal
          isOpen={isOpen}
          onClose={onClose}
          tokenPrices={tokenPrices}
          position={selectedPosition}
          poolInfo={formattedClmmDataMap[selectedPosition.poolId.toBase58()]}
          onRefresh={mutateClmmLockInfo}
        />
      )}
    </>
  )
}
