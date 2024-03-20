import { useState, useEffect } from 'react'
import { ApiClmmConfigInfo, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import * as yup from 'yup'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

interface Props {
  config?: ApiClmmConfigInfo
  currentPrice: string
  priceRange: string[]
  tokenAmount: string[]
  tokens: {
    token1?: TokenInfo
    token2?: TokenInfo
  }
}

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg)

const schema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    tokenAmount: yup
      .array()
      .of(numberTransform)
      .test('is-tokenAmount-valid', t('error.enter_token_amount') ?? '', (value: any) => {
        if ((value as number[]).some((val) => val > 0)) return true
        return false
      }),
    upperPrice: numberSchema(t('error.enter_upper_price')),
    lowerPrice: numberSchema(t('error.enter_lower_price')),
    currentPrice: numberSchema(t('error.enter_current_price')),
    config: yup.mixed().required(t('error.select_pool_fee') ?? ''),
    token2: yup.mixed().required(t('error.select_pool_token_2') ?? ''),
    token1: yup.mixed().required(t('error.select_pool_token_1') ?? '')
  })

export default function useValidate(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      const { priceRange, tokens, tokenAmount } = props
      schema(t).validateSync({
        ...props,
        ...tokens,
        tokenAmount,
        lowerPrice: priceRange[0],
        upperPrice: priceRange[1]
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}

const priceRangeSchema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    startTime: yup.number().test('is-startTime-valid', 'invalid starttime', (value: any) => {
      if (value && dayjs(value).isAfter(Date.now())) return true
      return false
    }),
    minPrice: numberSchema(t('error.enter_min_price')).test(
      'is-minPrice-valid',
      t('error.invalid_min_price') as string,
      function (value?: number) {
        if (this.parent.focusMintA && (value ?? 0) > this.parent.maxPrice) return false
        return true
      }
    ),
    maxPrice: numberSchema(t('error.enter_max_price')).test(
      'is-maxOrice-valid',
      t('error.invalid_max_price') as string,
      function (value?: number) {
        if (!this.parent.focusMintA && (value ?? 0) < this.parent.minPrice) return false
        return true
      }
    ),
    currentPrice: numberSchema(t('error.enter_current_price'))
  })

export function usePriceRangeValidate(props: { startTime: number; currentPrice: string; priceRange: string[]; focusMintA: boolean }) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()

  useEffect(() => {
    try {
      const { priceRange } = props
      priceRangeSchema(t).validateSync({
        ...props,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}
