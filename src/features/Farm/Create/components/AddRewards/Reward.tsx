import { useRef } from 'react'
import { Box, Collapse, useDisclosure, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'

import { NewRewardInfo } from '../../type'
import RewardBody from './RewardBody'
import RewardHeader from './RewardHeader'
import useRewardSchema from '../useRewardSchema'

export type AddRewardItemProps = {
  isDefaultOpen?: boolean
  index: number
  rewardInfo: NewRewardInfo
  onChange: (rewardInfo: NewRewardInfo) => void
  onDeleteReward(): void
  tokenFilterFn: (token: ApiV3Token) => boolean
}

export default function AddRewardItem({ isDefaultOpen, index, rewardInfo, tokenFilterFn, onChange, onDeleteReward }: AddRewardItemProps) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isDefaultOpen })
  const domRef = useRef<HTMLDivElement>(null)
  const schema = useRewardSchema()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const balance = getTokenBalanceUiAmount({ mint: rewardInfo.token?.address || '' }).text

  const validateReward = useEvent((rewardInfo: NewRewardInfo) => {
    let error = undefined

    try {
      schema.validateSync({
        ...rewardInfo,
        balance
      })
    } catch (e: any) {
      error = e.message
    }
    return error
  })

  const onRewardEdit = useEvent((rewardInfo: NewRewardInfo) => {
    const error = validateReward(rewardInfo)
    onChange({ ...rewardInfo, error, isValid: !error })
  })

  return (
    <Box
      ref={domRef}
      onClick={(ev) => {
        if (ev.target === domRef.current) onToggle()
      }}
      borderRadius="20px"
      bg={colors.backgroundLight}
      py={['18px', 7]}
      px={[4, 6]}
    >
      <RewardHeader
        onToggle={onToggle}
        onDeleteReward={onDeleteReward}
        index={index}
        isOpen={isOpen}
        token={rewardInfo.token}
        amount={rewardInfo.amount}
        perWeek={rewardInfo.perWeek}
      />
      <Collapse in={isOpen} animateOpacity>
        <RewardBody rewardInfo={rewardInfo} onChange={onRewardEdit} tokenFilterFn={tokenFilterFn} />
      </Collapse>
      <Text color="red">{rewardInfo.error}</Text>
    </Box>
  )
}
