import { useCallback } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { HelpCircle } from 'react-feather'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import TokenSelectBox from '@/components/TokenSelectBox'
import DecimalInput from '@/components/DecimalInput'
import Button from '@/components/Button'
import { numTransform } from '@/utils/numberish/formatter'
import { useCreateMarketStore } from '@/store/useCreateMarketStore'
import { FormValue } from './type'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { TFunction } from 'i18next'

const schema = (t: TFunction<'translation', undefined, 'translation'>) =>
  yup.object().shape({
    priceTick: yup
      .number()
      .transform(numTransform)
      .positive(t('error.should_input_valid_price_tick') ?? '')
      .required(t('error.should_input_valid_price_tick') ?? ''),
    orderSize: yup
      .number()
      .transform(numTransform)
      .positive(t('error.should_input_valid_minimum_order_size') ?? '')
      .required(t('error.should_input_valid_minimum_order_size') ?? ''),
    quoteToken: yup.mixed().required(t('error.select_quote_token') ?? ''),
    baseToken: yup.mixed().required(t('error.select_base_token') ?? '')
  })

const initialValues = {
  orderSize: '1',
  priceTick: '0.01'
}

export default function CreateMarket() {
  const createMarketAct = useCreateMarketStore((s) => s.createMarketAct)

  const formik = useFormik<FormValue>({
    initialValues,
    validationSchema: schema,
    validateOnChange: true,
    onSubmit: (values) => {
      createMarketAct(values as Required<FormValue>)
    }
  })

  const { values, setFieldValue, handleSubmit, errors } = formik
  const error = Object.values(errors)
    .reverse()
    .find((e) => !!e)

  const handleTokenChange = useCallback(
    (token?: TokenInfo, name?: string) => {
      setFieldValue(name!, token)
    },
    [setFieldValue]
  )

  const handleInputChange = useCallback(
    (val: string, _: number, name?: string) => {
      setFieldValue(name!, val)
    },
    [setFieldValue]
  )

  return (
    <Flex flexDirection="column" gap="3">
      <div>Create OpenBook Market</div>
      <Flex gap="2">
        <Box flex="1">OpenBook Program id:</Box>
        <Box flex="2">srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX</Box>
      </Flex>
      <Flex gap="2">
        <Box flex="1">Select tokens :</Box>
        <Flex flex="2" gap="2">
          <TokenSelectBox sx={{ flex: 1 }} name="baseToken" label="Base token" token={values.baseToken} onSelectToken={handleTokenChange} />
          <TokenSelectBox
            sx={{ flex: 1 }}
            name="quoteToken"
            label="Quote token"
            token={values.quoteToken}
            onSelectToken={handleTokenChange}
          />
        </Flex>
      </Flex>
      <Flex gap="2">
        <Flex flex="1" gap="1" alignItems="center">
          Minimum order size
          <HelpCircle display="inline-block" size="12" />:
        </Flex>
        <Box flex="2">
          <DecimalInput value={values.orderSize} side="orderSize" onChange={handleInputChange} />
        </Box>
      </Flex>
      <Flex gap="2">
        <Flex flex="1" gap="1" alignItems="center">
          Minimum price tick size
          <HelpCircle size="12" />:
        </Flex>
        <Box flex="2">
          <DecimalInput value={values.priceTick} side="priceTick" onChange={handleInputChange} />
        </Box>
      </Flex>
      <Button disabled={!!error} onClick={() => handleSubmit()}>
        {error || 'Create Market'}
      </Button>
    </Flex>
  )
}
