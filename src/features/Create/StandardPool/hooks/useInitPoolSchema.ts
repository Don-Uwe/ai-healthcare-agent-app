import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { wSolToSol } from '@/utils/token'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'
import { TFunction } from 'i18next'

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg).required(errMsg)

interface Props {
  startTime?: Date
  tokenAmount?: { base: string; quote: string }
  quoteToken?: ApiV3Token
  baseToken?: ApiV3Token
  price?: string
}

export default function useInitPoolSchema({ startTime, price, baseToken, quoteToken, tokenAmount }: Props) {
  // prepare for i18n usage
  const { t } = useTranslation()

  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const [error, setError] = useState<string | undefined>()

  const baseBalance = getTokenBalanceUiAmount({ mint: wSolToSol(baseToken?.address) || '', decimals: baseToken?.decimals }).text
  const quoteBalance = getTokenBalanceUiAmount({ mint: wSolToSol(quoteToken?.address) || '', decimals: quoteToken?.decimals }).text

  const schema = (t: TFunction<'translation', undefined, 'translation'>) =>
    yup.object().shape({
      startTime: yup.mixed().test('is-date-valid', t('error.start time should later than now') ?? '', function (val: Date) {
        return !val || val.valueOf() > Date.now()
      }),
      quoteBalance: yup
        .string()
        .test('is-balance-enough', t('error.balance_not_enough_token', { side: 'quote' }) ?? '', function (val?: string) {
          return new Decimal(val || 0).gte(this.parent.quoteAmount)
        }),
      baseBalance: yup
        .string()
        .test('is-balance-enough', t('error.balance_not_enough_token', { side: 'base' }) ?? '', function (val?: string) {
          return new Decimal(val || 0).gte(this.parent.baseAmount)
        }),
      quoteAmount: numberSchema(t('error.should_input_positive_amount', { side: 'quote' })),
      baseAmount: numberSchema(t('error.should_input_positive_amount', { side: 'base' })),
      quoteToken: yup.mixed().required(t('error.select_token', { side: 'quote' }) ?? ''),
      baseToken: yup.mixed().required(t('error.select_token', { side: 'base' }) ?? ''),
      price: numberSchema(t('error.enter_starting_price'))
    })

  useEffect(() => {
    try {
      schema(t).validateSync({
        price,
        baseToken,
        quoteToken,
        baseAmount: tokenAmount?.base,
        quoteAmount: tokenAmount?.quote,
        startTime,
        baseBalance,
        quoteBalance
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message)
    }
  }, [price, baseToken, quoteToken, tokenAmount, startTime, baseBalance, quoteBalance])

  return error
}
