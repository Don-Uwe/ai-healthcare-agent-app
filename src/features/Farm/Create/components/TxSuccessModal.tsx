import AddressChip from '@/components/AddressChip'
import CircleCheck from '@/icons/misc/CircleCheck'
import { colors } from '@/theme/cssVariables'
import { routeToPage } from '@/utils/routeTools'
import { Button, HStack, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function TxSuccessModal(props: { farmId: string; isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} size={'sm'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="none">{t('farm.title_farm_created_success')}</ModalHeader>
        <ModalBody>
          <VStack pt={3} spacing={3}>
            <CircleCheck width={32} height={32} color={colors.semanticSuccess} />
            <Text variant="dialogTitle">{t('farm.info_farm_created_success')}</Text>
            <HStack bg={colors.backgroundDark} rounded={'md'} p={4} w={'full'} justify={'center'}>
              <AddressChip
                renderLabel={
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t('farm.farm_id')}:
                  </Text>
                }
                color={colors.buttonSecondary}
                address={props.farmId}
              />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter mt={8} mb={2} flexDirection="column" gap="1">
          <Button
            w="full"
            onClick={() => {
              routeToPage('portfolio')
            }}
          >
            {t('farm.to_my_created_farms')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
