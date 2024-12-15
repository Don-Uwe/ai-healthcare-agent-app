import { useState, useImperativeHandle, RefObject } from 'react'
import ExistFarmingRewardItem from './FarmingRewardItem'
import { useEvent } from '@/hooks/useEvent'
import { TxCallbackProps } from '@/types/tx'
import { EditReward } from '../util'

export type ActionRef = { getData: () => EditReward[] } | null

interface Props {
  farmTVL?: number
  rewards: EditReward[]
  ownerRemainingRewards: { hasRemaining: boolean; mint: string; remaining: string }[]
  onUpdate: () => void
  actionRef?: RefObject<{ getRewards: () => EditReward[] }>
  isEcosystem: boolean
  onClaimRemaining: (props: { mint: string } & TxCallbackProps) => void
}

export default function ExistFarmingRewards({
  rewards,
  ownerRemainingRewards,
  isEcosystem,
  farmTVL,
  onClaimRemaining,
  onUpdate,
  actionRef
}: Props) {
  const [editedRewards, setEditedRewards] = useState<Map<string, EditReward>>(new Map())
  const handleEditedRewardUpdate = useEvent((mint: string, reward?: EditReward, _?: EditReward) => {
    if (reward) {
      setEditedRewards((preVal) => {
        preVal.set(mint, reward)
        return new Map(Array.from(preVal))
      })
    } else {
      setEditedRewards((preVal) => {
        preVal.delete(mint)
        return new Map(Array.from(preVal))
      })
    }
    onUpdate()
  })

  useImperativeHandle(actionRef, () => ({
    getRewards: () => Array.from(editedRewards).map((r) => r[1])
  }))

  return (
    <>
      {rewards.map((reward) => {
        const rewardToken = reward.mint
        if (!rewardToken) return null
        return (
          <ExistFarmingRewardItem
            key={rewardToken.address}
            onRewardUpdate={handleEditedRewardUpdate}
            reward={reward}
            remainingReward={ownerRemainingRewards.find((r) => r.mint === rewardToken.address)}
            farmTVL={farmTVL}
            isEcosystem={isEcosystem}
            onClaimRemaining={onClaimRemaining}
          />
        )
      })}
    </>
  )
}
