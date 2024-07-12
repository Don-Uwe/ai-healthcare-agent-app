import Button from '@/components/Button'
import DecimalInput from '@/components/DecimalInput'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore, useLiquidityStore, LIQUIDITY_SLIPPAGE_KEY } from '@/store'
import { useSwapStore, SWAP_SLIPPAGE_KEY } from '@/features/Swap/useSwapStore'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'
import { setStorageItem } from '@/utils/localStorage'
import { KeyboardEvent, useCallback, useState } from 'react'
import Decimal from 'decimal.js'

export function SlippageToleranceSettingField({ variant = 'swap' }: { variant?: 'swap' | 'liquidity' }) {
  const { t } = useTranslation()
  const isSwap = variant === 'swap'
  const SLIPPAGE_KEY = isSwap ? SWAP_SLIPPAGE_KEY : LIQUIDITY_SLIPPAGE_KEY
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentSlippage, setCurrentSlippage] = useState(String(slippage * 100))
  const [isFirstFocused, setIsFirstFocused] = useState(false)
  const handleChange = useEvent((val: string | number) => {
    setIsFirstFocused(false)
    setCurrentSlippage(String(val))
  })
  const handleUpdateSlippage = useEvent((val: string | number) => {
    const setVal = Number(val ?? 0) / 100
    setStorageItem(SLIPPAGE_KEY, setVal)
    if (isSwap) {
      useSwapStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
    } else {
      useLiquidityStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
    }
  })
  const handleBlur = useEvent(() => {
    setIsFirstFocused(false)
    if (!currentSlippage) handleChange(0)
    handleUpdateSlippage(currentSlippage || 0)
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })

  return (
    <SettingField
      fieldName={isSwap ? t('setting_board.slippage_tolerance_swap') : t('setting_board.slippage_tolerance_liquidity')}
      isCollapseDefaultOpen
      tooltip={isSwap ? t('setting_board.slippage_tolerance_tooltip_swap') : t('setting_board.slippage_tolerance_tooltip_liquidity')}
      renderToggleButton={
        isMobile ? (isOpen) => <SettingFieldToggleButton isOpen={isOpen} renderContent={(slippage * 100).toString() + '%'} /> : null
      }
      renderWidgetContent={
        <>
          <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between">
            <Flex gap="2">
              {(isSwap ? [0.1, 0.5, 1] : [1, 2.5, 3.5]).map((v) => (
                <Button
                  key={v}
                  size={'sm'}
                  isActive={new Decimal(slippage).mul(100).eq(v)}
                  variant="capsule-radio"
                  onClick={() => {
                    handleChange(v)
                    handleUpdateSlippage(v)
                  }}
                >
                  {formatToRawLocaleStr(toPercentString(v))}
                </Button>
              ))}
            </Flex>
            <Flex alignItems="center" rounded="full">
              <Text fontSize="xs" whiteSpace={'nowrap'} color={colors.textSecondary}>
                {t('setting_board.custom')}
              </Text>
              <DecimalInput
                variant="filledDark"
                value={isFirstFocused ? '' : currentSlippage}
                placeholder={currentSlippage}
                max={50}
                decimals={2}
                onBlur={handleBlur}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                inputSx={{ textAlign: 'right', rounded: '40px', h: '36px', w: '70px', py: 0, px: '3' }}
              />
              <Text fontSize="xs" color={colors.textSecondary}>
                %
              </Text>
            </Flex>
          </Flex>
          {isSwap && new Decimal(currentSlippage || 0).gt('0.5') ? (
            <Text mt="2" fontSize="sm" color={colors.textPink}>
              {t('setting_board.slippage_tolerance_forerun')}
            </Text>
          ) : null}
        </>
      }
    />
  )
}
