import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg).required(errMsg)

export default function useMarketSchema() {
  // prepare for i18n usage
  const { t } = useTranslation()
  return yup.object().shape({
    baseToken: yup.mixed().required(t('error.select_base_token') ?? ''),
    quoteToken: yup.mixed().required(t('error.select_quote_token') ?? ''),
    orderSize: numberSchema(t('error.enter_order_size') ?? ''),
    priceTick: numberSchema(t('error.enter_price_tick') ?? '')
  })
}
