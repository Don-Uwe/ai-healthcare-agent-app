import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'
import { ApiCpmmConfigInfo, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { wSolToSol } from '@/utils/token'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'
import { TFunction } from 'i18next'
import BN from 'bn.js'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg).required(errMsg)

interface Props {
  startTime?: Date
  tokenAmount?: { base: string; quote: string }
  quoteToken?: ApiV3Token
  baseToken?: ApiV3Token
  feeConfig?: ApiCpmmConfigInfo
  isAmmV4?: boolean
}

// new BN(baseAmount).mul(new BN(quoteAmount)).gt(new BN(1).mul(new BN(10 ** baseToken.decimals)).pow(new BN(2)))

export default function useInitPoolSchema({ startTime, baseToken, quoteToken, tokenAmount, feeConfig, isAmmV4 }: Props) {
  // prepare for i18n usage
  const { t } = useTranslation()

  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const [error, setError] = useState<string | undefined>()

  const baseBalance = getTokenBalanceUiAmount({ mint: wSolToSol(baseToken?.address) || '', decimals: baseToken?.decimals }).text
  const quoteBalance = getTokenBalanceUiAmount({ mint: wSolToSol(quoteToken?.address) || '', decimals: quoteToken?.decimals }).text

  const schema = (t: TFunction<'translation', undefined, 'translation'>) =>
    yup.object().shape({
      ...(isAmmV4 ? {} : { feeConfig: yup.mixed().required(t('common.select') + t('field.fee_tier') ?? '') }),
      ...(isAmmV4
        ? {
            liquidity: yup.mixed().test('is-liquidity-valid', t('error.initial_liquidity_low') ?? 'initial liquidity too low', function () {
              if (this.parent.baseToken && this.parent.quoteToken && this.parent.baseAmount && this.parent.quoteAmount) {
                return new BN(new Decimal(this.parent.baseAmount).mul(10 ** this.parent.baseToken.decimals).toFixed(0))
                  .mul(new BN(new Decimal(this.parent.quoteAmount).mul(10 ** this.parent.quoteToken.decimals).toFixed(0)))
                  .gt(new BN(1).mul(new BN(10 ** this.parent.baseToken.decimals)).pow(new BN(2)))
              }
              return true
            })
          }
        : {}),
      startTime: yup.mixed().test('is-date-valid', t('error.start_time_should_later') ?? '', function (val: Date) {
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
      quote: yup
        .mixed()
        .test(
          'is-mint-prgoram-valid',
          (t('error.amm_not_support_2022') || 'Amm V4 pool does not support token 2022') + ' (Quote Mint)',
          function () {
            if (!isAmmV4) return true
            if (this.parent.quoteToken && this.parent.quoteToken.programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
              return false
            }
            return true
          }
        ),
      quoteToken: yup.mixed().required(t('error.select_token', { side: 'quote' }) ?? ''),
      base: yup
        .mixed()
        .test(
          'is-mint-prgoram-valid',
          (t('error.amm_not_support_2022') || 'Amm V4 pool does not support token 2022') + ' (Base mint)',
          function () {
            if (!isAmmV4) return true
            if (this.parent.baseToken && this.parent.baseToken.programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
              return false
            }
            return true
          }
        ),
      baseToken: yup.mixed().required(t('error.select_token', { side: 'base' }) ?? '')
    })

  useEffect(() => {
    try {
      schema(t).validateSync({
        baseToken,
        quoteToken,
        baseAmount: tokenAmount?.base,
        quoteAmount: tokenAmount?.quote,
        startTime,
        baseBalance,
        quoteBalance,
        feeConfig
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message)
    }
  }, [baseToken, quoteToken, tokenAmount, startTime, baseBalance, quoteBalance, feeConfig])

  return error
}
