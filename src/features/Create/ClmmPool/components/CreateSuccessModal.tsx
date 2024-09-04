import { Modal, ModalOverlay, ModalContent, ModalFooter, ModalBody, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { routeToPage } from '@/utils/routeTools'
import Button from '@/components/Button'
import { colors } from '@/theme/cssVariables'
import CircleCheck from '@/icons/misc/CircleCheck'

export default function CreateSuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="4">
          <Flex flexDirection="column" alignItems="center">
            <CircleCheck width={32} height={32} color={colors.secondary} />
            <Text variant="dialogTitle" mt="4" mb="2" textAlign="center">
              {t('create_pool.clmm_create_pool_success_title')}
            </Text>
            <Flex
              flexDirection="column"
              borderRadius="lg"
              my="4"
              fontSize="sm"
              color={colors.semanticWarning}
              bg={colors.backgroundDark}
              p="2"
              gap={4}
            >
              <Text>{t('common.note')} </Text>
              <Text>{t('create_pool.clmm_create_pool_success_content')}</Text>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter mb="3">
          <Button w="100%" mr={3} onClick={() => routeToPage('pools')}>
            {t('common.got_it')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
