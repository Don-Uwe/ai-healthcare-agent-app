import { Trans } from 'react-i18next'
import { Text } from '@chakra-ui/react'
import i18n from '@/i18n'
import { colors } from '@/theme/cssVariables/colors'

const FARM_TX_MSG = {
  deposit: {
    title: 'liquidity.tx_message.staked_successfully',
    desc: 'liquidity.tx_message.staked_desc',
    txHistoryTitle: 'transaction_history.liquidity_staked_title',
    txHistoryDesc: 'transaction_history.liquidity_staked_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  withdraw: {
    title: 'liquidity.tx_message.unStaked_successfully',
    desc: 'liquidity.tx_message.unStaked_desc',
    txHistoryTitle: 'transaction_history.unStaked_successfully',
    txHistoryDesc: 'transaction_history.unStaked_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  claimIdo: {
    title: 'portfolio.acceleraytor_tx_title',
    desc: 'portfolio.acceleraytor_tx_desc',
    txHistoryTitle: 'portfolio.acceleraytor_tx_title',
    txHistoryDesc: 'portfolio.acceleraytor_tx_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  claimIdo1: {
    title: 'portfolio.acceleraytor_tx_title',
    desc: 'portfolio.acceleraytor_tx_1_desc',
    txHistoryTitle: 'portfolio.acceleraytor_tx_title',
    txHistoryDesc: 'portfolio.acceleraytor_tx_1_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  harvest: {
    title: 'transaction_history.harvest_rewards',
    desc: 'transaction_history.harvest_farm_reward_desc',
    txHistoryTitle: 'transaction_history.harvest_reward_title',
    txHistoryDesc: 'transaction_history.harvest_farm_reward_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  updateRewards: {
    title: 'transaction_history.update_reward_title',
    desc: 'transaction_history.update_reward_desc',
    txHistoryTitle: 'transaction_history.update_reward_title',
    txHistoryDesc: 'transaction_history.update_reward_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  }
}

export const getTxMeta = ({ action, values }: { action: keyof typeof FARM_TX_MSG; values: Record<string, unknown> }) => {
  const meta = FARM_TX_MSG[action]
  return {
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
