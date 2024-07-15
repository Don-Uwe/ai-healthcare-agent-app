import React, { KeyboardEvent, useState, useCallback, useEffect } from 'react'
import {
  Flex,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  Text,
  VStack
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'
import DecimalInput from '@/components/DecimalInput'
import { colors } from '@/theme/cssVariables'
import { useLiquidityStore, LIQUIDITY_SLIPPAGE_KEY } from '@/store'
import { useSwapStore, SWAP_SLIPPAGE_KEY } from '@/features/Swap/useSwapStore'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { useEvent } from '@/hooks/useEvent'
import { setStorageItem } from '@/utils/localStorage'
import WarningIcon from '@/icons/misc/WarningIcon'
import { QuestionToolTip } from '@/components/QuestionToolTip'

export function SlippageSettingModal(props: { variant: 'swap' | 'liquidity'; isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const isSwap = props.variant === 'swap'
  const SLIPPAGE_KEY = isSwap ? SWAP_SLIPPAGE_KEY : LIQUIDITY_SLIPPAGE_KEY
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const [currentSlippage, setCurrentSlippage] = useState<string>(new Decimal(slippage).mul(100).toFixed())
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
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })

  const handleSaveFee = useEvent(() => {
    handleUpdateSlippage(currentSlippage || 0)
    props.onClose()
  })

  useEffect(() => {
    setCurrentSlippage(new Decimal(slippage).mul(100).toFixed())
  }, [slippage, props.isOpen])

  const slippageDecimal = new Decimal(currentSlippage || 0)
  const isForerun = slippageDecimal.gt('3')
  const isFailrun = slippageDecimal.lt('0.5')
  const isWarn = isSwap && (isForerun || isFailrun)
  const warnText = isForerun ? t('setting_board.slippage_tolerance_forerun') : isFailrun ? t('setting_board.slippage_tolerance_fail') : ''

  return (
    <Modal size={'md'} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        borderRadius="20px"
        border={`1px solid ${colors.backgroundDark}`}
        boxShadow="0px 8px 48px 0px #4F53F31A"
        paddingInline="2rem"
        py="2rem"
      >
        <ModalHeader marginTop={0} marginBottom={'48px'}>
          <HStack spacing="6px">
            <Text>{isSwap ? t('setting_board.slippage_tolerance_swap') : t('setting_board.slippage_tolerance_liquidity')}</Text>
            <QuestionToolTip
              label={isSwap ? t('setting_board.slippage_tolerance_tooltip_swap') : t('setting_board.slippage_tolerance_tooltip_liquidity')}
              iconProps={{ color: colors.textSecondary }}
            />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4} alignItems="flex-start">
            <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between" w="full">
              <Flex gap="2">
                {(isSwap ? [0.1, 0.5, 1] : [1, 2.5, 3.5]).map((v) => (
                  <Button
                    key={v}
                    size={'sm'}
                    isActive={Number(currentSlippage) == v}
                    variant="capsule-radio"
                    onClick={() => {
                      handleChange(v)
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
            {isWarn ? (
              <Flex
                px={4}
                py={2}
                bg={colors.warnButtonLightBg}
                color={colors.semanticWarning}
                fontSize="sm"
                fontWeight="medium"
                borderRadius="8px"
                w="full"
              >
                <Text pt={0.5}>
                  <WarningIcon />
                </Text>
                <Text pl={2}>{warnText}</Text>
              </Flex>
            ) : null}
            <Button
              w="full"
              rounded="lg"
              background={colors.solidButtonBg}
              isDisabled={Number(currentSlippage) <= 0}
              onClick={handleSaveFee}
            >
              <Text fontSize="md" fontWeight="medium" bgClip="text" color={colors.buttonSolidText}>
                {t('button.save')}
              </Text>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
