import { useEffect, useMemo, useState, useRef } from 'react'
import { TokenInfo, RewardType, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { numTransform, trimTrailZero } from '@/utils/numberish/formatter'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore, useTokenAccountStore } from '@/store'

export interface FormData {
  daily: string
  duration: string
  startDate: Date
  endDate: Date
  amount: string
  tokenType: RewardType
}

export interface FormValue {
  daily: string
  duration: string
  startDate: Date | null
  endDate: Date | null
  amount: string
  token?: TokenInfo | ApiV3Token
  tokenType: RewardType
}

interface Props {
  mint?: string
  symbol?: string
  decimals?: number
  initialValues?: Partial<FormValue>
  checkToken?: boolean
  onFormSubmit: (data: FormData) => void
}

export const tokenTypes: RewardType[] = ['Standard SPL', 'Option tokens']

export const defaultInitValue = {
  daily: '',
  duration: '',
  startDate: null,
  endDate: null,
  amount: '',
  tokenType: tokenTypes[0]
}

export default function useAddReward({
  mint,
  symbol,
  decimals: fixedDecimal,
  checkToken,
  initialValues = defaultInitValue,
  onFormSubmit
}: Props) {
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const onlineCurrentDate = new Date(Date.now() + chainTimeOffset)
  const [tokenSymbol, setTokenSymbol] = useState(symbol)
  const [tokenMint, setTokenMint] = useState(mint)
  const formRef = useRef<ReturnType<typeof useFormik<FormValue>> | undefined>()

  const schema = useMemo(
    () =>
      yup.object({
        duration: yup
          .number()
          .required('Insufficient duration')
          .transform(numTransform)
          .min(7, 'Period is shorter than min duration of 7 days')
          .max(90, 'Period is longer than max duration of 90 days'),
        startDate: yup
          .mixed()
          .required('Insufficient duration')
          .test('is-valid-startDate-enough', 'Insufficient startDate', function (val) {
            return dayjs(val).startOf('D').valueOf() >= dayjs(onlineCurrentDate).startOf('D').valueOf()
          }),
        amount: yup
          .number()
          .required(`Enter ${tokenSymbol || 'token'} amount`)
          .positive(`Enter ${tokenSymbol || 'token'} amount`),
        // .max(Number(getTokenBalanceUiAmount({ mint: tokenMint || '' }).text), `Insufficient ${tokenSymbol} balance`),
        token: checkToken ? yup.mixed().required('Confirm reward Token') : yup.mixed().nullable()
      }),
    [tokenSymbol, checkToken, tokenMint, getTokenBalanceUiAmount, onlineCurrentDate]
  )

  const formik = useFormik<FormValue>({
    initialValues: { ...defaultInitValue, ...initialValues },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit: (values) => {
      onFormSubmit({
        ...values,
        startDate: values.startDate!,
        endDate: values.endDate!
      })
    }
  })
  formRef.current = formik

  const decimals = (fixedDecimal || formik.values.token?.decimals) ?? 6

  useEffect(() => {
    setTokenSymbol(formik.values.token?.symbol)
    setTokenMint(formik.values.token?.address)
  }, [formik.values.token])

  useEffect(() => {
    setTimeout(() => {
      formik.validateForm()
    }, 0)
  }, [formik.values])

  const onTokenChange = useEvent((val: TokenInfo | ApiV3Token) => {
    formik.setFieldValue('token', val)
    setTokenSymbol(val.symbol)
    setTokenMint(val.address)
    formik.validateForm()
  })

  const onAmountChange = useEvent((val: string) => {
    formik.setFieldValue('amount', val)
    if (formik.values.duration)
      formik.setFieldValue('daily', val ? trimTrailZero(new Decimal(val).div(formik.values.duration).toFixed(decimals)) : '')
  })

  const onStartDateChange = useEvent((val: Date) => {
    val.setHours(new Date().getHours() - 8)
    val.setMinutes(new Date().getMinutes())
    val.setSeconds(new Date().getSeconds())
    formik.setFieldValue('startDate', val)
    formik.setFieldValue('endDate', formik.values.duration ? dayjs(val).add(Number(formik.values.duration), 'd').toDate() : null)
  })

  const onDurationChange = useEvent((val: string) => {
    const { amount } = formik.values
    formik.setFieldValue('duration', val)
    formik.setFieldValue('endDate', formik.values.startDate && val ? dayjs(formik.values.startDate).add(Number(val), 'd').toDate() : null)
    formik.setFieldValue('daily', amount && val ? trimTrailZero(new Decimal(amount).div(val).toFixed(decimals)) : '')
    setTimeout(() => formik.validateForm(), 0)
  })

  const onDailyChange = useEvent((val: string) => {
    formik.setFieldValue('daily', val)
    formik.setFieldValue(
      'amount',
      val && formik.values.duration ? trimTrailZero(new Decimal(val).mul(formik.values.duration).toFixed(decimals)) : ''
    )
  })

  const onTokenTypeChange = useEvent((val: string) => {
    formik.setFieldValue('tokenType', val)
  })

  const onSubmit = useEvent(() => {
    onFormSubmit({
      ...formik.values,
      startDate: formik.values.startDate!,
      endDate: formik.values.endDate!
    })
  })

  return {
    ...formik,
    formRef,
    schema,
    onlineCurrentDate,
    onTokenChange,
    onAmountChange,
    onStartDateChange,
    onDurationChange,
    onDailyChange,
    onTokenTypeChange,
    onSubmit
  }
}
