import { Trans } from 'react-i18next'
import { Text } from '@chakra-ui/react'
import i18n from '@/i18n'
import { colors } from '@/theme/cssVariables/colors'

const SWAP_TX_MSG = {
  swap: {
    title: 'transaction_history.name_swap',
    desc: 'transaction_history.desc_swap',
    txHistoryTitle: 'transaction_history.name_swap',
    txHistoryDesc: 'transaction_history.desc_swap',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  }
}
export const getTxMeta = ({ action, values = {} }: { action: keyof typeof SWAP_TX_MSG; values?: Record<string, unknown> }) => {
  const meta = SWAP_TX_MSG[action]
  return {
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
