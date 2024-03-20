import ExclaimationOctagon from '@/icons/misc/ExclaimationOctagon'
import { useAppStore } from '@/store'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { Box, BoxProps, Button, Collapse, Flex, HStack, Text, useDisclosure, useOutsideClick } from '@chakra-ui/react'
import { useRef } from 'react'
import { X } from 'react-feather'
import ChevronUpDownArrow from './ChevronUpDownArrow'

type SubPageNoteProps = {
  /** can collapse and has close button */
  canInteract?: boolean
  title: React.ReactNode
  description: React.ReactNode
}

/** this board is often for a subPage link create-pool edit-farm , to describe how to use this section */
export default function SubPageNote({
  canInteract,
  title,
  description,
  ...boxProps
}: SubPageNoteProps & Omit<BoxProps, keyof SubPageNoteProps>) {
  const isMobile = useAppStore((s) => s.isMobile)
  const boxRef = useRef<HTMLDivElement>(null)

  const { isOpen: isCollapseOpen, onClose: onCloseCollapse, onToggle: onToggleCollapse } = useDisclosure({ defaultIsOpen: true })
  const { isOpen: isPanelOpen, onClose: onClosePanel } = useDisclosure({ defaultIsOpen: true })

  useOutsideClick({
    ref: boxRef,
    handler: () => {
      canInteract && onCloseCollapse()
    }
  })
  if (!isPanelOpen && isMobile) return null
  return (
    <Box
      {...panelCard}
      ref={boxRef}
      borderRadius={['12px', '20px']}
      px={[4, 6]}
      py={6}
      onClick={canInteract ? onToggleCollapse : undefined}
      {...boxProps}
    >
      <HStack align={'flex-start'} spacing={3}>
        <Flex flexGrow={1} direction="column">
          <HStack justify={'space-between'}>
            <HStack>
              <Flex align="center">
                <ExclaimationOctagon color={colors.textSecondary} />
              </Flex>
              <Text color={colors.textSecondary} fontWeight={500} fontSize="md">
                {title}
                {canInteract && !isCollapseOpen ? '...' : ''}
              </Text>
            </HStack>
            {canInteract && (
              <Text
                cursor="pointer"
                color={colors.textSecondary}
                fontWeight="500"
                fontSize="md"
                onClick={() => {
                  onClosePanel()
                }}
              >
                <X />
              </Text>
            )}
          </HStack>
          <Collapse in={!isMobile || isCollapseOpen}>
            <Text pt={3} as="div" color={colors.textSecondary} fontSize="sm">
              {description}
            </Text>
          </Collapse>
        </Flex>
      </HStack>

      {isMobile && (
        <Box translateY={'12px'} transform={'auto'}>
          <Collapse in={!isMobile || isCollapseOpen}>
            <HStack fontSize={'sm'} color={colors} justify={'center'}>
              <Button variant={'ghost'} size="sm">
                <Text>Collapse </Text>
                <ChevronUpDownArrow width={'20px'} height={'20px'} />
              </Button>
            </HStack>
          </Collapse>
        </Box>
      )}
    </Box>
  )
}
