import { useEffect } from 'react'
import { Modal, ModalOverlay, ModalContent, ModalFooter, ModalBody, Flex, Text, useDisclosure, useClipboard } from '@chakra-ui/react'
import { routeToPage } from '@/utils/routeTools'
import Button from '@/components/Button'
import { colors } from '@/theme/cssVariables'
import CircleCheck from '@/icons/misc/CircleCheck'
import CopyIcon from '@/icons/misc/CopyIcon'
import { toastSubject } from '@/hooks/toast/useGlobalToast'

interface Props {
  ammId: string
}

export default function CreateSuccessModal({ ammId }: Props) {
  const { isOpen, onClose } = useDisclosure({ isOpen: true })
  const { onCopy, setValue, hasCopied, value } = useClipboard(ammId)

  useEffect(() => {
    setValue(ammId)
  }, [ammId])

  useEffect(() => {
    if (!hasCopied) return
    toastSubject.next({ status: 'success', title: 'copied!', description: value })
  }, [hasCopied, value])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="4">
          <Flex flexDirection="column" alignItems="center">
            <CircleCheck width={32} height={32} color={colors.secondary} />
            <Text variant="dialogTitle" mt="4" mb="2">
              Pool created successfully!
            </Text>
            <Flex alignItems="center" maxW="100%" flexWrap="wrap" gap="1.5">
              <Text fontSize="sm" color={colors.primary}>
                AMMID:
              </Text>
              <Text fontSize="md" color={colors.textPurple} maxW="80%">
                {ammId}
                <CopyIcon cursor="pointer" onClick={onCopy} style={{ display: 'inline-block', marginLeft: '2px', marginBottom: '2px' }} />
              </Text>
            </Flex>
            <Text borderRadius="lg" my="4" fontSize="sm" color={colors.semanticWarning} bg={colors.backgroundDark} p="2">
              Note: Your pool may take a few minutes before appearing in the pool list. Please kindly wait and refresh the page, and then
              search the pool list for your pool before attempting to create a farm.
            </Text>
          </Flex>
        </ModalBody>

        <ModalFooter mb="3">
          <Button w="100%" mr={3} onClick={() => routeToPage('pools')}>
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
