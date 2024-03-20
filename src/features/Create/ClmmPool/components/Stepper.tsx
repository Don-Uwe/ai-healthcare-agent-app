import Steps, { StepsRef } from '@/components/Steps'
import { useAppStore } from '@/store'
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'

export default function Stepper({ stepRef, onChange }: { stepRef?: RefObject<StepsRef>; onChange: (step: number) => void }) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  return (
    <Steps
      variant={isMobile ? 'row-title' : 'column-list'}
      ctrSx={{ height: 'fit-content', width: ['unset', 'clamp(300px, 100%, 500px)'] }}
      steps={[
        { title: t('common.unit_step', { num: 1 }), description: t('clmm.select_token_fee_tier') },
        { title: t('common.unit_step', { num: 2 }), description: t('clmm.set_initial_price_range') },
        { title: t('common.unit_step', { num: 3 }), description: t('clmm.enter_deposit_amount') }
      ]}
      onChange={onChange}
      ref={stepRef}
    />
  )
}
