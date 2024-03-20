import { useState, useEffect } from 'react'
import * as yup from 'yup'
import Decimal from 'decimal.js'
import { EditReward } from '../util'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

interface Props {
  remainSeconds: Decimal
  isDecrease: boolean
  onlineCurrentDate: number
  oldReward: EditReward
  daysExtend?: string | number
  balance: string | number
  amount?: string | number
}

export const ADJUST_REWARD_ERROR = {
  BALANCE_INSUFFICIENT: 'error.insufficient_sub_balance',
  DECREASE: 'error.decrease_reward',
  DECREASE_72h: 'error.decrease_reward_72h',
  DAYS_EXTEND: 'error.add_reward_days'
}

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))
const schema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    amount: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .positive(t('error.enter_token_amount') ?? '')
      .test('is-amount-valid', t('is_amount_valid') ?? '', function () {
        // if (new Decimal(val || 0).gt(this.parent.balance))
        //   return this.createError({
        //     message: ADJUST_REWARD_ERROR.BALANCE_INSUFFICIENT
        //   })
        const isWithin72hrs = this.parent.remainSeconds.gte(0) && this.parent.remainSeconds.lte(3600 * 72)
        if (this.parent.isDecrease) {
          if (!isWithin72hrs)
            return this.createError({
              message: ADJUST_REWARD_ERROR.DECREASE_72h
            })
          return this.createError({ message: ADJUST_REWARD_ERROR.DECREASE })
        }

        return true
      }),
    daysExtend: numberTransform.moreThan(6, ADJUST_REWARD_ERROR.DAYS_EXTEND).lessThan(91, ADJUST_REWARD_ERROR.DAYS_EXTEND)
  })

export default function useAdjustRewardSchema(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      schema(t).validateSync(props)
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}
