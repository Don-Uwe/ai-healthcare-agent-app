import { useState, useImperativeHandle, useCallback, RefObject } from 'react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import ExistFarmingRewardItem from './FarmingRewardItem'
import { EditReward } from '../util'

export type ActionRef = { getData: () => EditReward[]; addNewReward: (reward: EditReward) => void } | null

interface Props {
  farmTVL?: number
  onCheckRemaining: () => void
  tokenFilterFn: (token: TokenInfo) => boolean
  actionRef?: RefObject<{ getRewards: () => EditReward[]; addNewReward: (reward: EditReward) => void }>
}

export default function NewRewards({ farmTVL, tokenFilterFn, onCheckRemaining, actionRef }: Props) {
  const [newRewards, setNewRewards] = useState<Map<string, EditReward>>(new Map())
  const handleNewRewardUpdate = useCallback((mint: string, reward?: EditReward, orgReward?: EditReward) => {
    if (reward)
      return setNewRewards((preVal) => {
        if (orgReward && reward && orgReward.mint.address !== reward.mint.address) {
          const orgArray = Array.from(preVal)
          const idx = orgArray.findIndex((r) => r[0] === orgReward.mint.address)
          orgArray[idx] = [reward.mint.address, reward]
          return new Map(orgArray)
        }
        preVal.set(mint, reward)
        return new Map(Array.from(preVal))
      })
    setNewRewards((preVal) => {
      preVal.delete(mint)
      return new Map(Array.from(preVal))
    })

    onCheckRemaining()
  }, [])

  useImperativeHandle(actionRef, () => ({
    getRewards: () => Array.from(newRewards).map((r) => r[1]),
    addNewReward: (reward: EditReward) => handleNewRewardUpdate(reward.mint.address, reward)
  }))

  return (
    <>
      {Array.from(newRewards).map((reward) => {
        const rewardToken = reward[1].mint
        if (!rewardToken) return null
        return (
          <ExistFarmingRewardItem
            key={rewardToken.address}
            onRewardUpdate={handleNewRewardUpdate}
            reward={reward[1]}
            farmTVL={farmTVL}
            tokenFilterFn={tokenFilterFn}
          />
        )
      })}
    </>
  )
}
