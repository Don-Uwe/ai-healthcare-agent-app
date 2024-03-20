import * as yup from 'yup'
import Decimal from 'decimal.js'
import { TFunction } from 'i18next'

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))

export const liquidityValidateSchema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    balanceB: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .test('is-balanceB-enough', t('error.balance_not_enough') ?? '', function (val) {
        return new Decimal(val || 0).gte(this.parent.tokenAmount[1])
      }),
    balanceA: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .test('is-balanceA-enough', t('error.balance_not_enough') ?? '', function (val) {
        return new Decimal(val || 0).gte(this.parent.tokenAmount[0])
      }),
    tokenAmount: yup
      .array()
      .of(numberTransform)
      .test('is-tokenAmount-valid', t('error.enter_token_amount') ?? '', (value: any) => {
        if ((value as number[]).some((val) => val > 0)) return true
        return false
      })
  })

export const removeValidateSchema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    positionAmountB: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .test('is-balanceB-enough', 'exceed position amount', function (val) {
        return new Decimal(val || 0).gte(this.parent.tokenAmount[1])
      }),
    positionAmountA: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .test('is-balanceA-enough', 'exceed position amount', function (val) {
        return new Decimal(val || 0).gte(this.parent.tokenAmount[0])
      }),
    tokenAmount: yup
      .array()
      .of(numberTransform)
      .test('is-tokenAmount-valid', t('error.enter_token_amount') ?? '', (value: any) => {
        if ((value as number[]).some((val) => val > 0)) return true
        return false
      })
  })
