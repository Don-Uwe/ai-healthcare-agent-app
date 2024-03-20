import { Box, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { AprKey, timeBasisOptions } from '@/hooks/pool/type'
import FaceContentCollapse from '@/components/FaceContentCollapse'
import AddLiquidityModal from '@/features/Clmm/LiquidityEditModal/AddLiquidityModal'
import RemoveLiquidityModal from '@/features/Clmm/LiquidityEditModal/RemoveLiquidityModal'
import useFetchClmmRewardInfo from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { getPositionAprCore } from '@/features/Clmm/utils/calApr'
import ClmmPositionAccountItemDetail from './ClmmPositionAccountItemDetail'
import ClmmPositionAccountItemDetailMobileDrawer from './ClmmPositionAccountItemDetailMobileDrawer'
import ClmmPositionAccountItemFace from './ClmmPositionAccountItemFace'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store'
import { useClmmStore } from '@/store/useClmmStore'
import { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import { getOpenCache, setOpenCache } from '../../utils'
import BN from 'bn.js'

type ClmmPositionAccountItemProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: PositionWithUpdateFn
  baseIn: boolean
  initRpcPoolData?: RpcPoolData
  setNoRewardClmmPos: (val: string, isDelete?: boolean) => void
}

const ZERO = new BN(0)

export default function ClmmPositionAccountItem({
  poolInfo,
  position,
  baseIn,
  initRpcPoolData,
  setNoRewardClmmPos
}: ClmmPositionAccountItemProps) {
  const isMobile = useAppStore((s) => s.isMobile)
  const removeLiquidityAct = useClmmStore((s) => s.removeLiquidityAct)
  const closePositionAct = useClmmStore((s) => s.closePositionAct)

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: getOpenCache(position.nftMint.toBase58()) })
  const { isOpen: isRemoveOpen, onClose: onRemoveClose, onOpen: onRemoveOpen } = useDisclosure()
  const { isOpen: isAddOpen, onClose: onAddClose, onOpen: onAddOpen } = useDisclosure()
  const [timeBasis, setTimeBasis] = useState<AprKey>(timeBasisOptions[0].value)
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })

  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const aprData = getPositionAprCore({
    poolInfo,
    positionAccount: position,
    poolLiquidity: initRpcPoolData?.poolInfo.liquidity || new BN(0),
    tokenPrices,
    timeBasis,
    planType: 'D',
    chainTimeOffsetMs: chainTimeOffset
  })

  const { totalPendingYield, isEmptyReward } = useFetchClmmRewardInfo({
    poolInfo,
    initRpcPoolData,
    position,
    subscribe: false,
    shouldFetch: false,
    tickLowerPrefetchData: position.tickLowerRpcData,
    tickUpperPrefetchData: position.tickUpperRpcData
  })

  useEffect(() => {
    setNoRewardClmmPos(position.nftMint.toBase58(), !isEmptyReward)
  }, [isEmptyReward, setNoRewardClmmPos])

  const handleClosePosition = useEvent(({ onSend, onFinally }: { onSend?: () => void; onFinally?: () => void }) => {
    onSend?.()
    closePositionAct({
      poolInfo,
      position,
      onFinally
    })
  })
  const handleHarvest = useEvent(({ onSend, onFinally }: { onSend?: () => void; onFinally?: () => void }) => {
    onSend?.()
    removeLiquidityAct({
      poolInfo,
      position,
      liquidity: ZERO,
      amountMinA: ZERO,
      amountMinB: ZERO,
      onFinally
    })
  })

  useEffect(() => {
    setOpenCache(position.nftMint.toBase58(), isOpen)
  }, [isOpen, position.nftMint.toBase58()])

  useEffect(() => {
    position.updateClmmPendingYield({ nftMint: position.nftMint.toString(), pendingYield: totalPendingYield })
  }, [totalPendingYield, position.nftMint.toBase58()])

  return position.tickLower !== undefined && position.tickUpper !== undefined ? (
    <Box>
      <FaceContentCollapse
        isViewOpen={isOpen}
        thumbnail={
          <ClmmPositionAccountItemFace
            poolInfo={poolInfo}
            poolLiquidity={initRpcPoolData?.poolInfo.liquidity}
            tokenPrices={tokenPrices}
            position={position}
            baseIn={baseIn}
            onClickCloseButton={handleClosePosition}
            onClickMinusButton={onRemoveOpen}
            onClickPlusButton={onAddOpen}
            onClickViewTrigger={onToggle}
          />
        }
        detail={
          isOpen ? (
            isMobile ? (
              <ClmmPositionAccountItemDetailMobileDrawer
                onHarvest={handleHarvest}
                poolInfo={poolInfo}
                position={position}
                aprData={aprData}
                timeBasis={timeBasis}
                onTimeBasisChange={setTimeBasis}
                nftMint={position.nftMint.toString()}
                totalPendingYield={totalPendingYield.toString()}
                baseIn={baseIn}
                onClickCloseButton={handleClosePosition}
                onClickMinusButton={onRemoveOpen}
                onClickPlusButton={onAddOpen}
                onClickViewTrigger={onToggle}
              />
            ) : (
              <ClmmPositionAccountItemDetail
                onHarvest={handleHarvest}
                poolInfo={poolInfo}
                aprData={aprData}
                timeBasis={timeBasis}
                onTimeBasisChange={setTimeBasis}
                position={position}
                nftMint={position.nftMint.toString()}
                totalPendingYield={totalPendingYield.toString()}
                baseIn={baseIn}
                onClickCloseButton={handleClosePosition}
                onClickMinusButton={onRemoveOpen}
                onClickPlusButton={onAddOpen}
                onClickViewTrigger={onToggle}
              />
            )
          ) : null
        }
      />
      <RemoveLiquidityModal isOpen={isRemoveOpen} onClose={onRemoveClose} poolInfo={poolInfo} position={position} />
      {isAddOpen ? (
        <AddLiquidityModal baseIn={baseIn} isOpen={isAddOpen} onClose={onAddClose} poolInfo={poolInfo} position={position} />
      ) : null}
    </Box>
  ) : null
}
