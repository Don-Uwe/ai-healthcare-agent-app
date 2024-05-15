import React, { KeyboardEvent, useRef, useState, useCallback, useEffect } from 'react'
import {
  Collapse,
  Divider,
  Flex,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  TabList,
  Tabs,
  Tab
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { SOLMint } from '@raydium-io/raydium-sdk-v2'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import DecimalInput from '@/components/DecimalInput'
import { colors } from '@/theme/cssVariables'
import { useAppStore, PriorityLevel, PriorityMode, PRIORITY_LEVEL_KEY, PRIORITY_MODE_KEY } from '@/store/useAppStore'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useTranslation } from 'react-i18next'
import WarningIcon from '@/icons/misc/WarningIcon'
import { formatCurrency } from '@/utils/numberish/formatter'
import { setStorageItem } from '@/utils/localStorage'
import { useEvent } from '@/hooks/useEvent'

export function PriorityModalContent(props: {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLDivElement>
  currentFee: string | undefined
  onChangeFee: (val: string) => void
  onSaveFee: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerPanelGap = 24
  const isMobile = useAppStore((s) => s.isMobile)

  const feeConfig = useAppStore((s) => s.feeConfig)
  const appPriorityLevel = useAppStore((s) => s.priorityLevel)
  const appPriorityMode = useAppStore((s) => s.priorityMode)

  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()
  const { currentFee, onChangeFee, onSaveFee, isOpen } = props
  const feeWarn = Number(currentFee) <= (feeConfig[0] ?? 0)

  const [priorityMode, setPriorityMode] = useState(PriorityMode.MaxCap)
  const [priorityLevel, setPriorityLevel] = useState(PriorityLevel.Turbo)

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])

  const handlePriorityLevelChange = useCallback((index: number) => {
    setPriorityLevel(index)
  }, [])
  const handlePriorityModeChange = useCallback((index: number) => {
    setPriorityMode(index)
  }, [])

  const handleSave = useEvent(() => {
    setStorageItem(PRIORITY_LEVEL_KEY, priorityLevel)
    setStorageItem(PRIORITY_MODE_KEY, priorityMode)
    useAppStore.setState({
      priorityLevel,
      priorityMode
    })
    onSaveFee()
  })

  const { data: tokenPrice } = useTokenPrice({
    mintList: [SOLMint.toBase58()]
  })
  const price = tokenPrice[SOLMint.toBase58()]?.value
  const totalPrice = price && currentFee ? new Decimal(price ?? 0).mul(currentFee).toString() : ''

  useEffect(() => {
    setPriorityLevel(appPriorityLevel)
    setPriorityMode(appPriorityMode)
  }, [appPriorityLevel, appPriorityMode, isOpen])

  return (
    <Modal size={'md'} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        css={{
          transform: (() => {
            const triggerRect = getTriggerRect()
            return (
              triggerRect ? `translate(${isMobile ? 0 : -38}px, ${triggerRect.bottom + triggerPanelGap}px) !important` : undefined
            ) as string | undefined
          })()
        }}
        ref={contentRef}
        marginTop={0}
        marginRight={['auto', 0]}
        borderRadius="20px"
        border={`1px solid ${colors.backgroundDark}`}
        boxShadow="0px 8px 48px 0px #4F53F31A"
        paddingInline="2rem"
      >
        <ModalHeader>
          <HStack spacing="6px">
            <Text>{t('setting_board.transaction_priority_fee')}</Text>
            <QuestionToolTip
              label={
                <Text as="span" fontSize="sm">
                  {t('setting_board.transaction_priority_fee_tip')}
                </Text>
              }
              iconProps={{ color: colors.textSecondary }}
            />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4}>
            <Text fontSize="md" color={colors.textQuaternary}>
              {t('setting_board.transaction_priority_fee_usage')}
            </Text>
            <Divider />
            <Collapse in={priorityMode === 0} animateOpacity style={{ width: '100%' }}>
              <VStack width="full" align="flex-start">
                <Text fontSize="sm" color={colors.textSecondary}>
                  {t('setting_board.priority_level')}
                </Text>
                <Tabs index={priorityLevel} w="full" variant="roundedLight" bg={colors.backgroundDark} onChange={handlePriorityLevelChange}>
                  <TabList>
                    <Tab
                      flex="1"
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>{t('setting_board.priority_level_fast')}</Text>
                    </Tab>
                    <Tab
                      flex="1"
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>{t('setting_board.priority_level_turbo')}</Text>
                    </Tab>
                    <Tab
                      flex="1"
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>{t('setting_board.priority_level_ultra')}</Text>
                    </Tab>
                  </TabList>
                </Tabs>
              </VStack>
              <Divider />
            </Collapse>
            <VStack width="full" align="stretch" gap={3}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={colors.textSecondary}>
                  {t('setting_board.priority_mode')}
                </Text>
                <Tabs variant="roundedLight" bg={colors.backgroundDark} index={priorityMode} onChange={handlePriorityModeChange}>
                  <TabList>
                    <Tab
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>{t('setting_board.priority_mode_max_cap')}</Text>
                    </Tab>
                    <Tab
                      fontSize="xs"
                      fontWeight="normal"
                      color={colors.textSecondary}
                      opacity={0.5}
                      sx={{ _selected: { bg: colors.dividerBg, rounded: 'lg', opacity: 1 } }}
                    >
                      <Text>{t('setting_board.priority_mode_exact_fee')}</Text>
                    </Tab>
                  </TabList>
                </Tabs>
              </Flex>
              <Text fontSize="md" opacity={0.5} color={colors.textPrimary}>
                {priorityMode === 0 ? t('setting_board.priority_fee_auto_optimizes') : t('setting_board.priority_fee_exact')}
              </Text>
              <Flex justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>
                  {priorityMode === 0 ? t('setting_board.priority_mode_set_max_cap') : t('setting_board.priority_mode_exact_fee')}
                </Text>
                <Text fontSize="sm" opacity={0.5} color={colors.textPrimary}>
                  {`~${formatCurrency(totalPrice, { symbol: '$', decimalPlaces: 2 })}`}
                </Text>
              </Flex>
              <DecimalInput
                postFixInField
                width="100%"
                variant="filledDark"
                value={currentFee === undefined ? '' : String(currentFee)}
                placeholder={t('input.enter_custom_value') ?? undefined}
                onChange={onChangeFee}
                onKeyDown={handleKeyDown}
                inputSx={{ textAlign: 'right', rounded: '40px', h: '34px', w: '12 0px', py: 0, px: '3' }}
                ctrSx={{ bg: colors.backgroundDark, borderRadius: '32px' }}
                inputGroupSx={{ w: '100%', bg: colors.backgroundDark, alignItems: 'center', borderRadius: '32px' }}
                postfix={
                  <Text variant="label" size="sm" whiteSpace="nowrap">
                    SOL
                  </Text>
                }
              />
            </VStack>
            {feeWarn && (
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
                <Text pl={2}>{t('setting_board.priority_fee_below_market_rate')}</Text>
              </Flex>
            )}
            <Divider />
            <Button
              w="full"
              rounded="lg"
              mt="1rem"
              background={colors.solidButtonBg}
              isDisabled={Number(currentFee) <= 0}
              onClick={handleSave}
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
