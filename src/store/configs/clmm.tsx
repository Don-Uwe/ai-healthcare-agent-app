import { Trans } from 'react-i18next'
import { Text } from '@chakra-ui/react'
import i18n from '@/i18n'
import { colors } from '@/theme/cssVariables/colors'

export const CLMM_FEE_CONFIGS = {
  '9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x': {
    id: '9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x',
    index: 4,
    protocolFeeRate: 120000,
    tradeFeeRate: 100,
    tickSpacing: 1,
    fundFeeRate: 40000,
    fundOwner: 'FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4',
    description: 'Best for very stable pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.1, 0.2]
  },
  HfERMT5DRA6C1TAqecrJQFpmkf3wsWTMncqnj3RDg5aw: {
    id: 'HfERMT5DRA6C1TAqecrJQFpmkf3wsWTMncqnj3RDg5aw',
    index: 2,
    protocolFeeRate: 120000,
    tradeFeeRate: 500,
    tickSpacing: 10,
    fundFeeRate: 40000,
    fundOwner: 'FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4',
    description: 'Best for stable pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.1, 0.2]
  },
  E64NGkDLLCdQ2yFNPcavaKptrEgmiQaNykUuLC1Qgwyp: {
    id: 'E64NGkDLLCdQ2yFNPcavaKptrEgmiQaNykUuLC1Qgwyp',
    index: 1,
    protocolFeeRate: 120000,
    tradeFeeRate: 2500,
    tickSpacing: 60,
    fundFeeRate: 40000,
    fundOwner: 'FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4',
    description: 'Best for most pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5]
  },
  A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x: {
    id: 'A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x',
    index: 3,
    protocolFeeRate: 120000,
    tradeFeeRate: 10000,
    tickSpacing: 120,
    fundFeeRate: 40000,
    fundOwner: 'FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4',
    description: 'Best for exotic pairs',
    defaultRange: 0.1,
    defaultRangePoint: [0.01, 0.05, 0.1, 0.2, 0.5, 0.6, 0.7, 0.8, 0.9]
  }
}

export const CREATE_POS_DEVIATION = 0.985 // ask Rudy for detail

const CLMM_TX_MSG = {
  harvest: {
    title: 'transaction_history.harvest_rewards',
    desc: 'transaction_history.harvest_clmm_reward_desc',
    txHistoryTitle: 'transaction_history.harvest_rewards',
    txHistoryDesc: 'transaction_history.harvest_clmm_reward_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  openPosition: {
    title: 'transaction_history.name_add_liquidity',
    desc: 'transaction_history.add_liquidity_desc',
    txHistoryTitle: 'transaction_history.name_add_liquidity',
    txHistoryDesc: 'transaction_history.add_liquidity_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  closePosition: {
    title: 'clmm.position_closed',
    desc: 'clmm.close_mint_position',
    txHistoryTitle: 'clmm.position_closed',
    txHistoryDesc: 'clmm.close_mint_position',
    components: {}
  },
  increaseLiquidity: {
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
  updateRewards: {
    title: 'transaction_history.update_reward_title',
    desc: 'transaction_history.update_reward_desc',
    txHistoryTitle: 'transaction_history.update_reward_title',
    txHistoryDesc: 'transaction_history.update_reward_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  },
  createPool: {
    title: 'transaction_history.create_pool',
    desc: 'transaction_history.create_clmm_pool',
    txHistoryTitle: 'transaction_history.create_pool',
    txHistoryDesc: 'transaction_history.create_clmm_pool',
    components: {}
  },
  createFarm: {
    title: 'transaction_history.create_farm',
    desc: 'transaction_history.create_clmm_farm_desc',
    txHistoryTitle: 'transaction_history.create_farm',
    txHistoryDesc: 'transaction_history.create_clmm_farm_desc',
    components: {}
  },
  harvestAll: {
    title: 'transaction_history.harvest_rewards',
    desc: 'transaction_history.harvest_rewards_desc',
    txHistoryTitle: 'transaction_history.harvest_rewards',
    txHistoryDesc: 'transaction_history.harvest_rewards_desc',
    components: { sub: <Text as="span" color={colors.textSecondary} fontWeight="700" /> }
  }
}

export const getTxMeta = ({ action, values }: { action: keyof typeof CLMM_TX_MSG; values: Record<string, unknown> }) => {
  const meta = CLMM_TX_MSG[action]
  return {
    title: i18n.t(meta.title, values),
    description: <Trans i18nKey={meta.desc} values={values} components={meta.components} />,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
