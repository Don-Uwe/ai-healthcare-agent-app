import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  SystemStyleObject,
  VStack
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables'

import Button from './Button'
import { Desktop, Mobile } from './MobileDesktop'

type ResponsiveModalProps = ModalProps & {
  title?: string | null
  confirmText?: string
  onConfirm?: () => void
  cancelText?: string
  hasSecondaryButton?: boolean
  footerSX?: SystemStyleObject
  showFooter?: boolean
  closeOnClickConfirmButton?: boolean
  propOfModalContent?: ModalContentProps
}

/**
 * used for desktop: Modal; mobile: Drawer
 */
export default function ResponsiveModal({
  title,
  confirmText,
  cancelText,
  isOpen,
  onClose,
  onConfirm,
  children,
  footerSX = {},
  hasSecondaryButton = true,
  showFooter = false,
  closeOnClickConfirmButton = true,
  propOfModalContent,
  ...rest
}: ResponsiveModalProps) {
  const { t } = useTranslation()
  return (
    <>
      <Desktop>
        <Modal {...rest} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent {...propOfModalContent}>
            <ModalHeader color={colors.textPrimary} fontWeight="medium" fontSize="xl" pt={8} mb={6}>
              {title}
            </ModalHeader>
            <ModalCloseButton size="lg" color={colors.textSecondary} />
            <ModalBody>{children}</ModalBody>

            {showFooter && (
              <ModalFooter mt={4}>
                <VStack w="full" sx={footerSX}>
                  <Button
                    w="full"
                    onClick={() => {
                      onConfirm?.()
                      if (closeOnClickConfirmButton) onClose?.()
                    }}
                  >
                    {confirmText ?? t('button.confirm')}
                  </Button>
                  {hasSecondaryButton && (
                    <Button w="full" variant="unstyled" color={colors.textSeptenary} fontWeight="medium" fontSize="sm" onClick={onClose}>
                      {cancelText ?? t('button.cancel')}
                    </Button>
                  )}
                </VStack>
              </ModalFooter>
            )}
          </ModalContent>
        </Modal>
      </Desktop>
      <Mobile>
        <Drawer {...rest} isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{title}</DrawerHeader>
            <DrawerBody>{children}</DrawerBody>
            {showFooter && (
              <DrawerFooter py={4}>
                <VStack w="full">
                  <Button
                    w="full"
                    onClick={() => {
                      onConfirm?.()
                      if (closeOnClickConfirmButton) onClose?.()
                    }}
                  >
                    {confirmText ?? t('button.confirm')}
                  </Button>
                  {hasSecondaryButton && (
                    <Button w="full" variant="unstyled" color={colors.textSeptenary} fontWeight="medium" fontSize="sm" onClick={onClose}>
                      {cancelText ?? t('button.cancel')}
                    </Button>
                  )}
                </VStack>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      </Mobile>
    </>
  )
}
