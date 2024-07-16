import React, { useState, useEffect } from 'react'
import { Flex, Button } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { useLiquidityStore } from '@/store'
import { useSwapStore } from '@/features/Swap/useSwapStore'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import MoreListControllers from '@/icons/misc/MoreListControllers'
import { SlippageSettingModal } from './SlippageSettingModal'
import Decimal from 'decimal.js'

export function SlippageAdjuster({ variant = 'swap', onClick }: { variant?: 'swap' | 'liquidity'; onClick?: () => void }) {
  const { isOpen, onClose, onToggle } = useDisclosure()
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const isSwap = variant === 'swap'
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const [currentSlippage, setCurrentSlippage] = useState<string | undefined>()
  const [isWarn, setIsWarn] = useState(false)

  useEffect(() => {
    const slippageDecimal = new Decimal(slippage * 100)
    setCurrentSlippage(slippageDecimal.toDecimalPlaces(2).toString())
    const warn = isSwap && (slippageDecimal.gt('0.5') || slippageDecimal.lt('0.1'))
    setIsWarn(warn)
  }, [slippage, isSwap])
  const handleOnClick = () => {
    onToggle()
  }
  return (
    <>
      <Flex align="center" onClick={onClick || handleOnClick}>
        <Button
          size="xs"
          height="fit-content"
          py={1}
          px={2}
          borderRadius="full"
          bg={isWarn ? colors.warnButtonBg : colors.buttonBg01}
          color={isWarn ? colors.semanticWarning : colors.textSecondary}
          fontSize={'sm'}
          fontWeight="normal"
          border={isWarn ? `1px solid ${colors.semanticWarning}` : '1px solid transparent'}
          _hover={{
            borderColor: colors.secondary,
            color: colors.secondary,
            bg: colors.buttonBg01,
            '.chakra-icon-hover': {
              fill: colors.secondary
            }
          }}
          _focus={{ boxShadow: 'outline' }}
          iconSpacing={1}
          leftIcon={
            <MoreListControllers
              width="14"
              height="14"
              className="chakra-icon chakra-icon-hover"
              color={isWarn ? colors.semanticWarning : colors.textSecondary}
            />
          }
          variant={'ghost'}
        >
          {currentSlippage}%
        </Button>
      </Flex>
      <SlippageSettingModal variant={variant} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
