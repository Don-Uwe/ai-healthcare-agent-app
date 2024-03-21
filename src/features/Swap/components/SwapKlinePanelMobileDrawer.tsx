import { useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  HStack,
  Text,
  Box
} from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import Tabs from '@/components/Tabs'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import CandleChart from './CandleChart'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency } from '@/utils/numberish/formatter'
import dayjs from 'dayjs'
import SwapMobileIcon from '@/icons/misc/SwapMobileIcon'

function SwapKlinePanelMobileDrawerContent({
  baseToken,
  quoteToken,
  timeType,
  untilDate,
  onDirectionToggle,
  onTimeTypeChange
}: {
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  untilDate: number
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  const [price, setPrice] = useState<{ current: number; change: number } | undefined>()
  return (
    <>
      <Grid
        gridTemplate={`
        "name   name " auto
        "tabs   tabs " auto
        "chartwrap chartwrap" 1fr / 1fr auto
      `}
        alignItems="center"
        cursor="pointer"
        height="70vh"
      >
        <GridItem gridArea="name" pl={2}>
          <HStack spacing={1}>
            <TokenAvatarPair token1={baseToken} token2={quoteToken} size="xs" />
            <HStack spacing={0.5}>
              <Text fontSize="md" fontWeight="400" color={colors.textSecondary}>
                {baseToken?.symbol}/{quoteToken?.symbol}
              </Text>
              <Box
                cursor="pointer"
                onClick={() => {
                  onDirectionToggle?.()
                }}
              >
                <SwapMobileIcon />
              </Box>
              <Text ml={2} fontSize="xs" color={colors.textTertiary}>
                {dayjs().utc().format('YY/MM/DD HH:MM')}
              </Text>
            </HStack>
          </HStack>
        </GridItem>
        <GridItem gridArea="tabs" mt={3} mb={3} pl={2}>
          <Tabs
            items={['15m', '1H', '4H', '1D', '1W']}
            variant="squarePanel"
            onChange={(t: TimeType) => {
              onTimeTypeChange?.(t)
            }}
            tabItemSX={{ minWidth: '3em', fontSize: 'xs' }}
          ></Tabs>
        </GridItem>
        <GridItem area={'chartwrap'} height="100%">
          <Grid
            gridTemplate={`
            "price  price" auto
            "chart  chart" 1fr / 1fr auto
            `}
            alignItems="center"
            cursor="pointer"
            height="100%"
            bg={colors.backgroundDark}
            borderTopRadius="md"
          >
            <GridItem gridArea="price" pt={4} pl={3}>
              <HStack spacing={2} alignItems="baseline">
                <Text fontSize="xl" fontWeight={700} color={colors.textPrimary}>
                  {price ? formatCurrency(price.current, { maximumDecimalTrailingZeroes: 5 }) : price}
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight={400}
                  color={
                    price && price.change > 0
                      ? colors.priceFloatingUp
                      : price && price.change < 0
                      ? colors.priceFloatingDown
                      : colors.priceFloatingFlat
                  }
                >
                  {price ? toPercentString(price.change, { alwaysSigned: true }) : ''}
                </Text>
              </HStack>
            </GridItem>
            <CandleChart untilDate={untilDate} onPriceChange={setPrice} baseMint={baseToken} quoteMint={quoteToken} timeType={timeType} />
          </Grid>
        </GridItem>
      </Grid>
    </>
  )
}

export function SwapKlinePanelMobileDrawer({
  isOpen,
  onClose,
  untilDate,
  baseToken,
  quoteToken,
  timeType,
  onDirectionToggle,
  onTimeTypeChange
}: {
  isOpen: boolean
  onClose(): void
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent borderTopRadius="3xl">
        <DrawerCloseButton top={6} />
        <DrawerHeader />
        <DrawerBody pl={2} pr={2}>
          <SwapKlinePanelMobileDrawerContent
            untilDate={untilDate}
            baseToken={baseToken}
            quoteToken={quoteToken}
            timeType={timeType}
            onDirectionToggle={onDirectionToggle}
            onTimeTypeChange={onTimeTypeChange}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
