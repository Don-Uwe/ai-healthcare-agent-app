import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'
import Decimal from 'decimal.js'

const numberTransform = yup.number().transform((value) => (isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg)

export default function useValidateSchema(props: { priceUpper: string; priceLower: string }) {
  const { t } = useTranslation()

  const [error, setError] = useState<string | undefined>()

  const schema = yup.object().shape({
    priceUpper: numberSchema('upperPrice').test('is-upper-valid', 'upperPrice', function (val) {
      return new Decimal(val || 0).gt(this.parent.priceLower)
    }),
    priceLower: numberSchema('lowerPrice').test('is-lower-valid', 'lowerPrice', function (val) {
      return new Decimal(val || 0).lt(this.parent.priceUpper)
    })
  })

  useEffect(() => {
    try {
      schema.validateSync(props)
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}
