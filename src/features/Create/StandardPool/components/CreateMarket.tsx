import Button from '@/components/Button'
import TokenSelectBox from '@/components/TokenSelectBox'
import { tabValueModeMapping } from '@/features/Liquidity/utils'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import { useAppStore } from '@/store'
import { useCreateMarketStore } from '@/store/useCreateMarketStore'
import { colors } from '@/theme/cssVariables'
import { setUrlQuery } from '@/utils/routeTools'
import {
  Box,
  Collapse,
  Flex,
  Highlight,
  HStack,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Switch,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import { solToWSol, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { useFormik } from 'formik'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionToolTip } from '../../../../components/QuestionToolTip'
import useMarketSchema from '../hooks/useMarketSchema'
export interface FormValue {
  baseToken?: TokenInfo
  quoteToken?: TokenInfo
  orderSize?: string
  priceTick?: string
}

export const defaultInitValue = {}

export default function CreateMarket() {
  const OPEN_BOOK_PROGRAM = useAppStore((s) => s.programIdConfig.OPEN_BOOK_PROGRAM.toString())
  const isMobile = useAppStore((s) => s.isMobile)
  const isPc = !isMobile
  const { t } = useTranslation()
  const createMarketAct = useCreateMarketStore((s) => s.createMarketAct)
  const { isOpen, onToggle } = useDisclosure()
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  const marketRef = useRef('')
  const schema = useMarketSchema()

  const { errors, values, setFieldValue, submitForm } = useFormik<FormValue>({
    initialValues: defaultInitValue,
    validationSchema: schema,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: (values) => {
      onSending()
      createMarketAct({
        ...(values as Required<FormValue>),
        onSent: (marketId) => {
          marketRef.current = marketId
        },
        onConfirmed: () => {
          offSending()
          setUrlQuery({ mode: tabValueModeMapping['I have an ID'], id: marketRef.current })
        },
        onFinally: offSending
      })
    }
  })

  const error = Object.values(errors)[0]

  const handleBaseTokenChange = useCallback(
    (token?: TokenInfo) => setFieldValue('baseToken', token),
    [setFieldValue, values.quoteToken?.address]
  )

  const handleQuoteTokenChange = useCallback((token?: TokenInfo) => setFieldValue('quoteToken', token), [])

  const tokenFilterFn = useCallback(
    (val: TokenInfo) => {
      const tokenSet = new Set([
        values.baseToken ? solToWSol(values.baseToken.address).toString() : undefined,
        values.quoteToken ? solToWSol(values.quoteToken.address).toString() : undefined
      ])
      return !tokenSet.has(solToWSol(val.address).toBase58())
    },
    [values.baseToken?.address, values.quoteToken?.address]
  )

  return (
    <VStack bg={colors.backgroundLight} p={[3, 6]} align={'stretch'} spacing={[4, 5]}>
      <Box>
        <Text fontSize="sm" color={colors.textSecondary} textAlign={'center'} mb={4}>
          {t('create_standard_pool.market_create_orderbook')}
        </Text>

        {isPc && (
          <Text fontSize="sm" fontWeight="500" mb={4} color={colors.textPrimary}>
            {t('create_standard_pool.market_open_book_id')}
          </Text>
        )}

        <Box
          bg={colors.backgroundTransparent07}
          borderWidth={'1px'}
          borderStyle={'solid'}
          borderColor={colors.backgroundTransparent10}
          fontSize="sm"
          py={'10px'}
          px={4}
          rounded={'md'}
          color={colors.textSecondary}
        >
          {isMobile && (
            <Text fontSize="sm" fontWeight="500" mb={1} color={colors.textTertiary}>
              {t('create_standard_pool.market_open_book_id')}
            </Text>
          )}
          <Text wordBreak={'break-all'}>{OPEN_BOOK_PROGRAM}</Text>
        </Box>
      </Box>
      {/* token selectors */}
      <Flex direction="column" align={'flex-start'} gap={4}>
        {isMobile ? null : (
          <Text fontWeight="medium" fontSize="sm">
            {t('create_standard_pool.market_tokens')}
          </Text>
        )}
        <SimpleGrid w="full" autoFlow={'column'} gridAutoColumns={'1fr'} gap={4}>
          <TokenSelectBox
            sx={{ bg: colors.backgroundDark }}
            name="baseToken"
            label={t('common.base_token')}
            token={values.baseToken}
            filterTokenFn={tokenFilterFn}
            onSelectToken={handleBaseTokenChange}
          />
          <TokenSelectBox
            sx={{ bg: colors.backgroundDark }}
            name="quoteToken"
            label={t('common.quote_token')}
            token={values.quoteToken}
            filterTokenFn={tokenFilterFn}
            onSelectToken={handleQuoteTokenChange}
          />
        </SimpleGrid>
      </Flex>

      {/* order size, price tick */}
      <SimpleGrid autoFlow={'column'} gridAutoColumns={'1fr'} gap={4} alignItems={'stretch'}>
        {/* order size */}
        <Flex flex={2} direction="column" gap={4}>
          {isMobile ? null : (
            <HStack spacing="6px">
              <Text fontWeight="medium" fontSize="sm">
                {t('create_standard_pool.market_min_order_size')}
              </Text>
              <QuestionToolTip
                label={
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t('create_standard_pool.market_min_order_size_tip')}
                  </Text>
                }
              />
            </HStack>
          )}

          <Flex direction="column" bg={colors.backgroundDark} py={3} px={4} color={colors.textSecondary} borderRadius="12px" gap={2}>
            <Text fontSize="xs" color={colors.textTertiary}>
              {t('create_standard_pool.market_min_order_size_label')}
            </Text>
            <NumberInput variant="clean">
              <NumberInputField onChange={(e) => setFieldValue('orderSize', e.currentTarget.value)} />
            </NumberInput>
          </Flex>
        </Flex>
        {/* price tick */}
        <Flex direction="column" gap={4}>
          {isMobile ? null : (
            <HStack spacing="6px">
              <Text fontWeight="medium" fontSize="sm">
                {t('create_standard_pool.market_price_tick')}
              </Text>
              <QuestionToolTip label={t('create_standard_pool.market_price_tick_tip')} iconProps={{ color: colors.textTertiary }} />
            </HStack>
          )}
          <Flex direction="column" bg={colors.backgroundDark} py={3} px={4} color={colors.textSecondary} borderRadius="12px" gap={2}>
            <Text fontSize="xs" color={colors.textTertiary}>
              {t('create_standard_pool.market_price_tick_label')}
            </Text>
            <NumberInput variant="clean">
              <NumberInputField onChange={(e) => setFieldValue('priceTick', e.currentTarget.value)} />
            </NumberInput>
          </Flex>
        </Flex>
      </SimpleGrid>
      {/* Advanced options */}
      <HStack>
        <Text fontSize="sm" fontWeight="medium" color={colors.textSecondary}>
          {t('create_standard_pool.market_advance_options')}
        </Text>
        <Switch isChecked={isOpen} onChange={onToggle} />
        <QuestionCircleIcon color={colors.textTertiary} />
      </HStack>
      {/* Advanced collapse content */}
      <Collapse in={isOpen} animateOpacity>
        <Flex direction="column" w="full" align={'flex-start'} gap={4}>
          <Text fontSize="sm" color={colors.textTertiary}>
            {t('create_standard_pool.market_advance_options_desc')}
          </Text>
          <Flex gap={3}>
            <Flex direction="column" bg={colors.backgroundDark} py={3} px={4} color={colors.textSecondary} borderRadius="12px" gap={2}>
              <Text fontSize="xs" color={colors.textTertiary}>
                {t('create_standard_pool.market_event_queue')}
              </Text>
              <NumberInput variant="clean">
                <NumberInputField />
              </NumberInput>
            </Flex>
            <Flex direction="column" bg={colors.backgroundDark} py={3} px={4} color={colors.textSecondary} borderRadius="12px" gap={2}>
              <Text fontSize="xs" color={colors.textTertiary}>
                {t('create_standard_pool.market_request_queue')}
              </Text>
              <NumberInput variant="clean">
                <NumberInputField />
              </NumberInput>
            </Flex>
            <Flex direction="column" bg={colors.backgroundDark} py={3} px={4} color={colors.textSecondary} borderRadius="12px" gap={2}>
              <Text fontSize="xs" color={colors.textTertiary}>
                {t('create_standard_pool.market_orderbook')}
              </Text>
              <NumberInput variant="clean">
                <NumberInputField />
              </NumberInput>
            </Flex>
          </Flex>
        </Flex>
      </Collapse>

      <Button isDisabled={!!error} isLoading={isSending} onClick={submitForm}>
        {error || t('create_standard_pool.market_create_button')}
      </Button>

      <Text alignSelf={'center'} maxW="300px" fontSize="sm" color={colors.textTertiary} textAlign="center">
        <Highlight
          query={t('create_standard_pool.market_create_note_highlight') || ''}
          styles={{ fontWeight: 'medium', color: colors.textSecondary }}
        >
          {t('create_standard_pool.market_create_note') || ''}
        </Highlight>
      </Text>
    </VStack>
  )
}
