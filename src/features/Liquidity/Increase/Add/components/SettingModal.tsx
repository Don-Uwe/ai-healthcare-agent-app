import { Box, ModalProps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { SlippageToleranceSettingField } from '@/components/AppLayout/components/SlippageToleranceSettingField'
import Modal from '@/components/Modal'

type SettingModalProps = Omit<ModalProps, 'children'> & {
  onConfirm: () => void
}

export default function SettingModal(props: SettingModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('liquidity.setting_modal.title')!}
      confirmText={t('button.confirm') ?? ''}
      cancelText={t('button.cancel') ?? ''}
      {...props}
    >
      <Box my={6}>
        <SlippageToleranceSettingField />
      </Box>
    </Modal>
  )
}
