import * as yup from 'yup'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'

export default function useRewardSchema() {
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
    token: yup.mixed().required('Select reward token')
  })
}
