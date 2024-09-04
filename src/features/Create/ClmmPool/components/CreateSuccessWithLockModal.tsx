import { Modal, ModalOverlay, ModalContent, ModalFooter, ModalBody, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { routeToPage } from '@/utils/routeTools'
import Button from '@/components/Button'
import { colors } from '@/theme/cssVariables'
import CircleCheck from '@/icons/misc/CircleCheck'

export default function CreateSuccessWithLockModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="4">
          <Flex flexDirection="column" alignItems="center">
            <CircleCheck width={32} height={32} color={colors.secondary} />
            <Text variant="dialogTitle" mt="4" mb="2" textAlign="center">
              {t('create_pool.clmm_create_pool_fullrange_success_title')}
            </Text>
            <Text color={colors.lightPurple} textAlign="center">
              {t('create_pool.clmm_create_pool_fullrange_success_content')}
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter flexDirection="column" gap="2">
          <Button w="100%" onClick={() => routeToPage('pools')}>
            {t('common.got_it')}
          </Button>
          <Button variant="ghost" w="100%" fontSize="sm" onClick={() => routeToPage('lock')}>
            {t('liquidity.lock_my_liquidity')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
