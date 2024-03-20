import { ModalProps, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import Modal from '@/components/Modal'
import { colors } from '@/theme/cssVariables'

type AutoSwapModalProps = Omit<ModalProps, 'children'> & {
  onConfirm: () => void
  autoSwap: boolean
}

export default function AutoSwapModal(props: AutoSwapModalProps) {
  const { t } = useTranslation()
  return (
    <Modal
      title={!props.autoSwap ? t('liquidity.auto_swap_modal.turn_on_title')! : t('liquidity.auto_swap_modal.turn_off_title')!}
      confirmText={!props.autoSwap ? t('liquidity.auto_swap_modal.turn_on')! : t('liquidity.auto_swap_modal.turn_off')!}
      cancelText={t('button.cancel') ?? ''}
      {...props}
    >
      <Text my={8} fontSize="md" color={colors.textSecondary}>
        {!props.autoSwap ? t('liquidity.auto_swap_modal.turn_on_description')! : t('liquidity.auto_swap_modal.turn_off_description')!}
      </Text>
    </Modal>
  )
}
