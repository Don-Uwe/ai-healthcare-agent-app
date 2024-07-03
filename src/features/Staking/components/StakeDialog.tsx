import TokenInput from '@/components/TokenInput'
import { useFarmStore } from '@/store/useFarmStore'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'
import { useAppStore } from '@/store/useAppStore'
import { wSolToSolString } from '@/utils/token'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react'
import { ApiStakePool } from '@raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEvent } from '@/hooks/useEvent'
interface Props {
  isOpen: boolean
  onClose(): void
  pool?: ApiStakePool
  userAuxiliaryLedgers?: string[]
}

function StakeDialog({ isOpen, onClose, pool, userAuxiliaryLedgers }: Props) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.addFarm)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const depositFarmAct = useFarmStore((s) => s.depositFarmAct)
  const token = pool?.symbolMints[0]
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  const error = new Decimal(value || 0).gt(getTokenBalanceUiAmount({ mint: token?.address || '', decimals: token?.decimals }).amount)
    ? t('error.balance_not_enough')
    : undefined

  useEffect(() => {
    setLoading(false)
  }, [isOpen])

  const handleClose = useEvent(() => {
    setLoading(false)
    onClose()
  })

  const handleConfirm = () => {
    if (!pool) return
    setLoading(true)

    depositFarmAct({
      farmInfo: pool,
      amount: value,
      userAuxiliaryLedgers,
      onFinally: () => {
        setValue('')
        handleClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('staking.stake_modal_header', { symbol: wSolToSolString(token?.symbol) })}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5}>
          <TokenInput value={value} onChange={setValue} token={token} disableSelectToken />
        </ModalBody>

        <ModalFooter>
          <VStack width="full" spacing={0} alignItems="flex-start">
            <Button
              w="full"
              isDisabled={featureDisabled || loading || !value || new Decimal(value).lte(0) || !!error}
              isLoading={loading}
              onClick={handleConfirm}
            >
              {featureDisabled
                ? t('common.disabled')
                : error || t('staking.stake_modal_confirm_text', { symbol: wSolToSolString(token?.symbol) })}
            </Button>
            <Button w="full" variant="ghost" onClick={onClose}>
              {t('button.cancel')}
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default StakeDialog
