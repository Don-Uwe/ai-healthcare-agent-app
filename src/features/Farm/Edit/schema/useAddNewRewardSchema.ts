import { useState, useEffect } from 'react'
import * as yup from 'yup'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

interface Props {
  onlineCurrentDate: number
  balance: string | number
  amount?: string | number
  endTime: number
  openTime: number
  mint?: ApiV3Token
  checkMint?: boolean
}

const schema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    speed: yup.mixed().test('is-amount-enough', t('error.emission_rewards_low') ?? '', function () {
      const minBoundary =
        this.parent.endTime && this.parent.openTime && this.parent.mint
          ? new Decimal((this.parent.endTime - this.parent.openTime) / 1000).div(10 ** this.parent.mint.decimals)
          : undefined
      return new Decimal(this.parent.amount || 0).gte(minBoundary || 0)
    }),
    openTime: yup.number().test('is-duration-valid', t('error.insufficient_duration') ?? '', function (val) {
      return dayjs(val).isAfter(this.parent.onlineCurrentDate)
    }),
    amount: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .positive(t('error.enter_token_amount') ?? '')
      .test('is-amount-valid', t('error.insufficient_sub_balance') ?? '', function (val) {
        return new Decimal(this.parent.balance).gte(val || '0')
      }),
    mint: yup.mixed().test('is-mint-valid', t('error.select_reward_token') ?? '', function (val) {
      return this.parent.checkMint ? !!val : true
    })
  })

export default function useAddNewRewardSchema(props: Props) {
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
