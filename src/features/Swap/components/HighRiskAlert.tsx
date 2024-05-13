import { Text, Button, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalFooter } from '@chakra-ui/react'
import { useTranslation, Trans } from 'react-i18next'
import CircleInfo from '@/icons/misc/CircleInfo'
import { colors } from '@/theme/cssVariables'

export default function HighRiskAlert({
  isOpen,
  percent,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  percent: number
}) {
  const { t } = useTranslation()

  return (
    <Modal size="md" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ bg: 'rgba(28, 36, 62, 1)' }}>
        <ModalHeader display="flex" flexDirection="column" alignItems="center" gap="6" px="12" fontSize="xl">
          <CircleInfo fill={colors.semanticError} width={24} height={24} />
          <Text variant="dialogTitle">{t('swap.alert_high_price_warn_title')}</Text>
        </ModalHeader>
        <ModalBody textAlign="center">
          <Text variant="title" fontSize="md" mb="6" fontWeight="400">
            <Trans
              i18nKey="swap.alert_high_price_warn_desc" // optional -> fallbacks to defaults if not provided
              components={{ sub: <Text display="inline-block" color={colors.textPink} variant="title" /> }}
              values={{ percent: `${percent}%` }}
            />
          </Text>
        </ModalBody>
        <ModalFooter flexDirection="column" gap="2" px="0" py="0" mt="4">
          <Button onClick={onClose} w="100%">
            {t('button.cancel')}
          </Button>
          <Button variant="ghost" onClick={onConfirm} w="100%">
            {t('swap.swap_anyway')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
