import AmountSlider from '@/components/AmountSlider'
import TokenInput from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { wSolToSolString } from '@/utils/token'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack } from '@chakra-ui/react'
import { ApiStakePool } from '@raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  isOpen: boolean
  depositedAmount: string
  userAuxiliaryLedgers?: string[]
  onClose(): void
  pool?: ApiStakePool
}

export default function UnstakeDialog({ isOpen, onClose, depositedAmount, userAuxiliaryLedgers, pool }: Props) {
  const { t } = useTranslation()
  const featureDisabled = useAppStore((s) => s.featureDisabled.removeFarm)
  const withdrawFarmAct = useFarmStore((s) => s.withdrawFarmAct)

  const token = pool?.symbolMints[0]
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [percent, setPercent] = useState(0)
  const isAbleToStake =
    !loading && new Decimal(depositedAmount || 0).gt(0) && new Decimal(value || 0).gt(0) && new Decimal(value || 0).lte(depositedAmount)

  useEffect(() => () => setPercent(0), [])

  const handleClose = useEvent(() => {
    setLoading(false)
    onClose()
  })

  const handleConfirm = () => {
    if (!pool) return
    setLoading(true)

    withdrawFarmAct({
      farmInfo: pool,
      amount: value,
      userAuxiliaryLedgers,
      onFinally: () => {
        setValue('')
        setPercent(0)
        handleClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('staking.unstake_modal_header', { symbol: wSolToSolString(token?.symbol) })}</ModalHeader>
        <ModalCloseButton />

        <ModalBody mb={5} overflow={'visible'}>
          <VStack spacing={6} align="stretch">
            <TokenInput
              token={token}
              hideControlButton
              disableSelectToken
              forceBalanceAmount={depositedAmount}
              renderTopRightPrefixLabel={() => 'Deposited: '}
              value={value}
              onChange={(v) => {
                setValue(v)
                setPercent(
                  new Decimal(v || 0)
                    .div(depositedAmount || 1)
                    .mul(100)
                    .toDecimalPlaces(2, Decimal.ROUND_FLOOR)
                    .toNumber()
                )
              }}
            />
            <AmountSlider
              percent={percent}
              onChange={(percent) => {
                setPercent(percent)
                setValue(
                  new Decimal(depositedAmount || 0)
                    .mul(percent / 100)
                    .toDecimalPlaces(token?.decimals || 0, Decimal.ROUND_FLOOR)
                    .toString()
                )
              }}
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <VStack width="full" spacing={0} alignItems="flex-start">
            <Button w="full" isDisabled={!isAbleToStake || featureDisabled} isLoading={loading} onClick={handleConfirm}>
              {featureDisabled ? t('common.disabled') : t('staking.unstake_modal_confirm_text', { symbol: wSolToSolString(token?.symbol) })}
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
