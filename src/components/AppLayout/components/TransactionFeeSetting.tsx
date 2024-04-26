import Button from '@/components/Button'
import DecimalInput from '@/components/DecimalInput'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore, FEE_KEY } from '@/store'
import { colors } from '@/theme/cssVariables'
import { Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'
import { setStorageItem } from '@/utils/localStorage'
import { KeyboardEvent, useCallback, useState } from 'react'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'

export function TransactionFeeSetting() {
  const { t } = useTranslation()
  const transactionFee = useAppStore((s) => s.transactionFee)
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentFee, setCurrentFee] = useState<string | undefined>(transactionFee)
  const handleChange = useEvent((val?: string) => {
    setCurrentFee(val)
  })
  const handleBlur = useEvent(() => {
    setStorageItem(FEE_KEY, currentFee === undefined ? '' : String(currentFee))
    useAppStore.setState({ transactionFee: currentFee })
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])

  return (
    <SettingField
      fieldName={t('setting_board.transaction_priority')}
      tooltip={t('setting_board.transaction_priority_desc')}
      renderToggleButton={
        isMobile
          ? (isOpen) => (
              <SettingFieldToggleButton
                isOpen={isOpen}
                renderContent={transactionFee ? `${transactionFee} SOL` : t('setting_board.fee_dynamic')}
              />
            )
          : null
      }
      renderWidgetContent={
        <>
          <Flex justifyContent="space-between">
            <Flex gap="2" flexWrap="wrap">
              {[
                {
                  name: t('setting_board.fee_auto'),
                  val: ''
                },
                {
                  name: t('setting_board.fee_none'),
                  val: '0'
                },
                {
                  name: t('setting_board.fee_high'),
                  val: '0.0001'
                },
                {
                  name: t('setting_board.fee_turbo'),
                  val: '0.001'
                }
              ].map((v) => (
                <Button
                  key={v.name}
                  sx={{ display: 'flex', gap: 3 }}
                  size={'sm'}
                  isActive={v.val === transactionFee}
                  variant="capsule-radio"
                  onClick={() => {
                    handleChange(v.val)
                    setStorageItem(FEE_KEY, v.val === undefined ? '' : String(v.val))
                    useAppStore.setState({ transactionFee: v.val })
                  }}
                >
                  <Flex>{v.name}</Flex>
                  {v.val === '' ? t('setting_board.fee_dynamic') : formatToRawLocaleStr(v.val)}
                  {`${v.val === '' ? '' : ' SOL'}`}
                </Button>
              ))}
            </Flex>
          </Flex>
          <Flex alignItems="center" rounded="full" mt="3">
            <Text fontSize="xs" whiteSpace={'nowrap'} color={colors.textSecondary}>
              {t('setting_board.custom')}
            </Text>
            <DecimalInput
              width="auto"
              variant="filledDark"
              value={currentFee === undefined ? '' : String(currentFee)}
              onBlur={handleBlur}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              inputSx={{ textAlign: 'right', rounded: '40px', h: '36px', w: '12 0px', py: 0, px: '3' }}
            />
            <Text fontSize="xs" color={colors.textSecondary}>
              SOL
            </Text>
          </Flex>
        </>
      }
    />
  )
}
