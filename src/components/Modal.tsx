import {
  Modal as _Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps as _ModalProps,
  VStack,
  SystemStyleObject
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables'

import Button from './Button'

type ModalProps = _ModalProps & {
  title?: string
  confirmText?: string
  onConfirm?: () => void
  cancelText?: string
  hasSecondaryButton?: boolean
  footerSX?: SystemStyleObject
  showFooter?: boolean
}

/**
 * @deprecated DON't use this component, use Modal from `@chakra-ui/react` instead
 */
export default function Modal({
  title,
  confirmText,
  cancelText,
  isOpen,
  onClose,
  onConfirm,
  children,
  footerSX = {},
  hasSecondaryButton = true,
  showFooter = true,
  ...rest
}: ModalProps) {
  const { t } = useTranslation()
  return (
    <_Modal {...rest} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minWidth="min-content">
        <ModalHeader color={colors.textPrimary} fontWeight="medium" fontSize="xl" pt={8} mb={6}>
          {title}
        </ModalHeader>
        <ModalCloseButton size="lg" color={colors.textSecondary} />
        <ModalBody>{children}</ModalBody>

        {showFooter && (
          <ModalFooter pb={0}>
            <VStack w="full" sx={footerSX}>
              <Button w="full" onClick={onConfirm}>
                {confirmText ?? t('button.confirm')}
              </Button>
              {hasSecondaryButton && (
                <Button w="full" variant="ghost" fontWeight="500" fontSize="sm" onClick={onClose}>
                  {cancelText ?? t('button.cancel')}
                </Button>
              )}
            </VStack>
          </ModalFooter>
        )}
      </ModalContent>
    </_Modal>
  )
}
