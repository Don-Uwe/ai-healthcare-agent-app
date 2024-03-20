import { useState, useImperativeHandle, RefObject } from 'react'
import ExistFarmingRewardItem from './FarmingRewardItem'
import { useEvent } from '@/hooks/useEvent'
import { EditReward } from '../util'

export type ActionRef = { getData: () => EditReward[] } | null

interface Props {
  farmTVL?: number
  rewards: EditReward[]
  onUpdate: () => void
  actionRef?: RefObject<{ getRewards: () => EditReward[] }>
  isEcosystem?: boolean
}

export default function ExistFarmingRewards({ rewards, isEcosystem, farmTVL, onUpdate, actionRef }: Props) {
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
            farmTVL={farmTVL}
            isEcosystem={isEcosystem}
          />
        )
      })}
    </>
  )
}
