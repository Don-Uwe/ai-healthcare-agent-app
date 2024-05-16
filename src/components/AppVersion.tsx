import { useAppStore, PRIORITY_LEVEL_KEY, PRIORITY_MODE_KEY, PriorityLevel, PriorityMode } from '@/store/useAppStore'
import { useCallback, useEffect } from 'react'
import { Modal, ModalBody, ModalOverlay, ModalHeader, ModalContent, ModalFooter, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { getStorageItem } from '@/utils/localStorage'

export default function AppVersion() {
  const { t } = useTranslation()
  const [checkAppVersionAct, needRefresh] = useAppStore((s) => [s.checkAppVersionAct, s.needRefresh])

  const onClose = useCallback(() => {
    useAppStore.setState({ needRefresh: false })
  }, [])

  useEffect(() => {
    useAppStore.setState({
      priorityLevel: getStorageItem(PRIORITY_LEVEL_KEY) ? Number(getStorageItem(PRIORITY_LEVEL_KEY)) : PriorityLevel.Turbo,
      priorityMode: getStorageItem(PRIORITY_MODE_KEY) ? Number(getStorageItem(PRIORITY_MODE_KEY)) : PriorityMode.MaxCap
    })

    const interval = window.setInterval(() => {
      checkAppVersionAct()
    }, 60 * 1000 * 2)
    checkAppVersionAct()
    useAppStore.getState().fetchPriorityFeeAct()
    return () => window.clearInterval(interval)
  }, [checkAppVersionAct])

  return (
    <Modal isOpen={needRefresh} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('common.app_version_available')}</ModalHeader>
        <ModalBody>{t('common.refresh_update')}</ModalBody>
        <ModalFooter mt="4" justifyContent="space-between" gap="2">
          <Button flex="1" onClick={() => window.location.reload()}>
            {t('common.refresh')}
          </Button>
          <Button flex="1" variant="outline" onClick={onClose}>
            {t('common.update_later')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
