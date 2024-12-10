import * as yup from 'yup'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useTranslation } from 'react-i18next'

export default function useRewardSchema() {
  const { t } = useTranslation()
  return yup.object().shape({
    speed: yup.mixed().test('is-amount-enough', 'Emission rewards is lower than min required', function () {
      const minBoundary =
        this.parent.farmEnd && this.parent.farmStart && this.parent.token
          ? new Decimal((this.parent.farmEnd - this.parent.farmStart) / 1000).div(10 ** this.parent.token.decimals)
          : undefined
      return new Decimal(this.parent.amount || 0).gte(minBoundary || 0)
    }),
    perWeek: yup
      .string()
      .required('set per week')
      .test('is-balance-enough', 'balance not enough', function (val) {
        return new Decimal(val || 0).gte(0)
      }),
    farmEnd: yup
      .number()
      .required('select end time')
      .test('is-starttime-valid', 'end time invalid', function (val) {
        return dayjs(val || 0).isAfter(dayjs(this.parent.farmStart))
      }),
    farmStart: yup
      .number()
      .required('select start time')
      .test('is-starttime-valid', 'start time invalid', function (val) {
        return dayjs(val || 0).isAfter(dayjs())
      }),
    amount: yup.string().test('is-balance-enough', 'balance not enough', function (val) {
      if (new Decimal(val || 0).lte(0)) return this.createError({ message: 'input token amount' })
      return new Decimal(this.parent.balance || 0).gte(val || 0)
    }),
    token: yup
      .mixed()
      .required('Select reward token')
      .test('is-token-valid', t('error.farm_not_support_2022') || 'Farm does not support token 2022', function (val: ApiV3Token) {
        return val.programId === TOKEN_PROGRAM_ID.toBase58()
      })
  })
}
