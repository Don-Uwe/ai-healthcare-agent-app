import React, { useRef, useState, useEffect } from 'react'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { Flex, Button, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { useAppStore, FEE_KEY, PriorityLevel, PriorityMode } from '@/store/useAppStore'
import { useEvent } from '@/hooks/useEvent'
import { setStorageItem } from '@/utils/localStorage'
import { PriorityModalContent } from './PriorityModalContent'

export function PriorityButton() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const transactionFee = useAppStore((s) => s.transactionFee)
  const feeConfig = useAppStore((s) => s.feeConfig)
  const priorityLevel = useAppStore((s) => s.priorityLevel)
  const priorityMode = useAppStore((s) => s.priorityMode)
  const isExact = priorityMode === PriorityMode.Exact

  const triggerRef = useRef<HTMLDivElement>(null)
  const [currentFee, setCurrentFee] = useState<string | undefined>()
  const feeWarn = Number(currentFee) <= (feeConfig[0] ?? 0)
  const handleChangeFee = useEvent((val?: string) => {
    setCurrentFee(val)
  })
  const handleSaveFee = useEvent(() => {
    setStorageItem(FEE_KEY, currentFee === undefined ? '' : String(currentFee))
    useAppStore.setState({ transactionFee: currentFee })
    onClose()
  })

  useEffect(() => {
    setCurrentFee(transactionFee)
  }, [transactionFee, isOpen])

  return (
    <>
      <Flex align="center" onClick={() => onOpen()} ref={triggerRef}>
        <Button
          size="sm"
          border={feeWarn ? `1px solid ${colors.semanticWarning}` : '1px solid transparent'}
          bg={feeWarn ? { md: colors.warnButtonBg } : { md: colors.backgroundApp }}
          _hover={{ borderColor: colors.textLink, bg: colors.infoButtonBg }}
          {...(isOpen && {
            zIndex: 1401,
            border: feeWarn ? `1px solid ${colors.semanticWarning}` : `1px solid ${colors.textLink}`,
            bg: feeWarn ? colors.warnButtonBg : colors.infoButtonBg
          })}
          borderRadius="full"
          px={{ base: '2', md: '3' }}
          height={{ base: '8', lg: '9' }}
        >
          <Text as="span" fontSize="md" color={colors.textSecondary}>
            Priority:
            <Text as="span" color={colors.textLink} ml="1">
              {isExact ? `${transactionFee} SOL` : PriorityLevel[priorityLevel]}
            </Text>
          </Text>
        </Button>
      </Flex>
      <PriorityModalContent
        isOpen={isOpen}
        triggerRef={triggerRef}
        onClose={onClose}
        currentFee={currentFee}
        onChangeFee={handleChangeFee}
        onSaveFee={handleSaveFee}
      />
    </>
  )
}
