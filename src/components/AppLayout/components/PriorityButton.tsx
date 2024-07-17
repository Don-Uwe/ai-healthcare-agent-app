import React, { useRef, useState, useEffect } from 'react'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { Flex, Button, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'
import { useAppStore, FEE_KEY, PriorityLevel, PriorityMode } from '@/store/useAppStore'
import { useEvent } from '@/hooks/useEvent'
import { setStorageItem } from '@/utils/localStorage'
import { PriorityModalContent } from './PriorityModalContent'
import PriorityFastIcon from '@/icons/misc/PriorityFastIcon'
import PriorityTurboIcon from '@/icons/misc/PriorityTurboIcon'
import PriorityUltraIcon from '@/icons/misc/PriorityUltraIcon'
import PriorityFixIcon from '@/icons/misc/PriorityFixIcon'

export function PriorityButton() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const isMobile = useAppStore((s) => s.isMobile)
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

  const PriorityIcon = () => {
    if (isExact) {
      return <PriorityFixIcon />
    }

    switch (priorityLevel) {
      case PriorityLevel.Fast:
        return <PriorityFastIcon />
      case PriorityLevel.Turbo:
        return <PriorityTurboIcon />
      case PriorityLevel.Ultra:
        return <PriorityUltraIcon />
      default:
        return null
    }
  }

  return (
    <>
      <Flex align="center" onClick={() => onOpen()} ref={triggerRef}>
        {isMobile ? (
          <Flex color={colors.textSecondary} cursor="pointer">
            <PriorityIcon />
          </Flex>
        ) : (
          <Button
            size="sm"
            border={feeWarn ? `1px solid ${colors.semanticWarning}` : '1px solid transparent'}
            bg={feeWarn ? { md: colors.warnButtonBg } : { md: 'transparent' }}
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
        )}
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
