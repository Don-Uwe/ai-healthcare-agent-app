import { Box, Grid, GridItem, HStack, VStack } from '@chakra-ui/react'
import { RAYMint } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useMemo, useState, useRef } from 'react'

import PanelCard from '@/components/PanelCard'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import SwapChatEmptyIcon from '@/icons/misc/SwapChatEmptyIcon'
import SwapChatIcon from '@/icons/misc/SwapChatIcon'
import { useAppStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { getVHExpression } from '../../theme/cssValue/getViewportExpression'
import { getSwapPairCache, setSwapPairCache } from './util'
import { SwapKlinePanel } from './components/SwapKlinePanel'
import { SwapKlinePanelMobileDrawer } from './components/SwapKlinePanelMobileDrawer'
import { SwapKlinePanelMobileThumbnail } from './components/SwapKlinePanelMobileThumbnail'
import { SwapPanel } from './components/SwapPanel'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'

export default function Swap() {
  const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [inputMint, setInputMint] = useState<string>(cacheInput || PublicKey.default.toBase58())
  const [outputMint, setOutputMint] = useState<string>(cacheOutput !== cacheInput ? cacheOutput : RAYMint.toBase58())
  const [isPCChartShown, setIsPCChartShown] = useState<boolean>(true)
  const [isMobileChartShown, setIsMobileChartShown] = useState<boolean>(false)
  const isMobile = useAppStore((s) => s.isMobile)
  const [directionReverse, setDirectionReverse] = useState<boolean>(false)
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType>('15m')
  const untilDate = useRef(Math.floor(Date.now() / 1000))
  const swapPanelRef = useRef<HTMLDivElement>(null)
  const klineRef = useRef<HTMLDivElement>(null)

  const baseMint = directionReverse ? outputMint : inputMint
  const quoteMint = directionReverse ? inputMint : outputMint
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const baseToken = useMemo(() => tokenMap.get(baseMint), [tokenMap, baseMint])
  const quoteToken = useMemo(() => tokenMap.get(quoteMint), [tokenMap, quoteMint])
  // reset directionReverse when inputMint or outputMint changed
  useIsomorphicLayoutEffect(() => {
    setDirectionReverse(false)
    setSwapPairCache({
      inputMint,
      outputMint
    })
  }, [inputMint, outputMint])

  useIsomorphicLayoutEffect(() => {
    if (klineRef.current) {
      const height = `${swapPanelRef.current?.getBoundingClientRect().height}px`
      klineRef.current.style.height = height
    }
  }, [])

  return (
    <VStack
      mx={['unset', 'auto']}
      mt={[0, getVHExpression([0, 800], [32, 1300])]}
      width={!isMobile && isPCChartShown ? 'min(100%, 1300px)' : undefined}
    >
      <HStack alignSelf="flex-end" my={[1, 0]}>
        <Box
          cursor="pointer"
          onClick={() => {
            if (!isMobile) {
              setIsPCChartShown((b) => !b)
            } else {
              setIsMobileChartShown(true)
            }
          }}
        >
          {isMobile || isPCChartShown ? (
            <SwapChatIcon />
          ) : (
            <Box color={colors.textSecondary}>
              <SwapChatEmptyIcon />
            </Box>
          )}
        </Box>
      </HStack>
      <Grid
        width="full"
        gridTemplate={[
          `
            "panel" auto
            "kline" auto / auto
          `,
          isPCChartShown
            ? `
            "kline  panel" auto / 1.5fr 1fr
            `
            : `"panel" auto / auto`
        ]}
        gap={[3, isPCChartShown ? 4 : 0]}
      >
        <GridItem ref={swapPanelRef} gridArea="panel">
          <PanelCard p={[3, 6]} flexGrow={['1', 'unset']}>
            <SwapPanel onInputMintChange={setInputMint} onOutputMintChange={setOutputMint} />
          </PanelCard>
        </GridItem>

        <GridItem gridArea="kline" {...(isMobile ? { mb: 3 } : {})}>
          <PanelCard ref={klineRef} p={[3, 3]} gap={4} height="100%" {...(isMobile || !isPCChartShown ? { display: 'none' } : {})}>
            <SwapKlinePanel
              untilDate={untilDate.current}
              baseToken={baseToken}
              quoteToken={quoteToken}
              timeType={selectedTimeType}
              onDirectionToggle={() => setDirectionReverse((b) => !b)}
              onTimeTypeChange={setSelectedTimeType}
            />
          </PanelCard>
          {isMobile && (
            <PanelCard
              p={[3, 6]}
              gap={0}
              onClick={() => {
                setIsMobileChartShown(true)
              }}
              height="100%"
            >
              <SwapKlinePanelMobileThumbnail
                untilDate={untilDate.current}
                baseToken={baseToken}
                quoteToken={quoteToken}
                // onDirectionToggle={() => setDirectionReverse((b) => !b)}
                // onTimeTypeChange={setSelectedTimeType}
              />
              <SwapKlinePanelMobileDrawer
                untilDate={untilDate.current}
                isOpen={isMobileChartShown}
                onClose={() => setIsMobileChartShown(false)}
                baseToken={baseToken}
                quoteToken={quoteToken}
                timeType={selectedTimeType}
                onDirectionToggle={() => setDirectionReverse((b) => !b)}
                onTimeTypeChange={setSelectedTimeType}
              />
            </PanelCard>
          )}
        </GridItem>
      </Grid>
    </VStack>
  )
}
