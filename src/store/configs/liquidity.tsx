import { Trans } from 'react-i18next'
import { Text } from '@chakra-ui/react'
import i18n from '@/i18n'
import { colors } from '@/theme/cssVariables/colors'

const LIQUIDITY_TX_MSG = {
  addLiquidity: {
    title: 'transaction_history.name_add_liquidity',
    desc: 'transaction_history.add_liquidity_desc',
    txHistoryTitle: 'transaction_history.name_add_liquidity',
    txHistoryDesc: 'transaction_history.add_liquidity_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  removeLiquidity: {
    title: 'transaction_history.name_remove_liquidity',
    desc: 'transaction_history.remove_liquidity_desc',
    txHistoryTitle: 'transaction_history.name_remove_liquidity',
    txHistoryDesc: 'transaction_history.remove_liquidity_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  createPool: {
    title: 'liquidity.create_pool_tx_title',
    desc: 'liquidity.create_pool_tx_desc',
    txHistoryTitle: '',
    txHistoryDesc: '',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  removeLpBeforeMigrate: {
    title: 'transaction_history.name_remove_liquidity',
    desc: 'transaction_history.name_remove_liquidity',
    txHistoryTitle: '',
    txHistoryDesc: '',
    components: {}
  },
  migrateToClmm: {
    title: 'migrate_clmm.migrate_clmm_tx_title',
    desc: 'migrate_clmm.migrate_clmm_tx_desc',
    txHistoryTitle: '',
    txHistoryDesc: '',
    components: {}
  }
}
export const getTxMeta = ({ action, values = {} }: { action: keyof typeof LIQUIDITY_TX_MSG; values?: Record<string, unknown> }) => {
  const meta = LIQUIDITY_TX_MSG[action]
  return {
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
