import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import Close from '@/icons/misc/Close'
import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { AprKey } from '@/hooks/pool/type'
import { AprData } from '@/features/Clmm/utils/calApr'
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import EstimatedApr from './ClmmPositionAccountItemDetail/EstimatedApr'
import PendingYield from './ClmmPositionAccountItemDetail/PendingYield'
import PoolInfoDrawerFace from './ClmmPositionAccountItemDetail/PoolInfoDrawerFace'
import RangeChart from './ClmmPositionAccountItemDetail/RangeChart'
import { useEvent } from '@/hooks/useEvent'

type DetailProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  aprData: AprData
  timeBasis: AprKey
  onTimeBasisChange?: (val: AprKey) => void
  nftMint: string
  totalPendingYield: string
  baseIn: boolean
  hasReward?: boolean
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickCloseButton: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickMinusButton: () => void
  onClickPlusButton: () => void
  onClickViewTrigger: () => void
}

export default function ClmmPositionAccountItemDetailMobileDrawer({
  poolInfo,
  position,
  nftMint,
  aprData,
  totalPendingYield,
  baseIn,
  timeBasis,
  onTimeBasisChange,
  hasReward,
  onHarvest,
  onClickCloseButton,
  onClickMinusButton,
  onClickPlusButton,
  onClickViewTrigger
}: DetailProps) {
  const { isOpen: isLoading, onOpen: onSend, onClose: onFinally } = useDisclosure()
  const { isOpen: isCloseLoading, onOpen: onCloseSend, onClose: onCloseFinally } = useDisclosure()

  const handleHarvest = useEvent(() => {
    onHarvest({
      onSend,
      onFinally
    })
  })

  const handleClose = useEvent(() => {
    onClickCloseButton({
      onSend: onCloseSend,
      onFinally: onCloseFinally
    })
  })

  return (
    <Drawer isOpen={true} variant="popFromBottom" placement="bottom" onClose={onClickViewTrigger}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader visibility="hidden">Position Detail</DrawerHeader>
        <DrawerBody>
          <VStack gap={4}>
            <PoolInfoDrawerFace poolInfo={poolInfo} baseIn={baseIn} position={position}></PoolInfoDrawerFace>
            <RangeChart
              poolInfo={poolInfo}
              positionData={position}
              baseIn={baseIn}
              nftMint={nftMint}
              bg={colors.backgroundDark}
              borderRadius="12px"
              py={5}
              px={4}
              w={'full'}
            />
            <EstimatedApr
              aprData={aprData}
              timeBasis={timeBasis}
              onTimeBasisChange={onTimeBasisChange}
              timeAprData={poolInfo.allApr}
              weeklyRewards={poolInfo.weeklyRewards}
            />
            <PendingYield
              isLoading={isLoading}
              hasReward={hasReward}
              onHarvest={handleHarvest}
              pendingYield={toUsdVolume(totalPendingYield.toString())}
              rewardTokens={poolInfo.rewardDefaultInfos.map((r) => r.mint)}
            />
            <HStack w="full" spacing={4}>
              {position.liquidity.isZero() ? (
                <CloseButton isLoading={isCloseLoading} onClick={handleClose} />
              ) : (
                <MinusButton
                  isLoading={false}
                  onClick={() => {
                    onClickViewTrigger()
                    onClickMinusButton()
                  }}
                />
              )}
              <PlusButton
                isLoading={false}
                onClick={() => {
                  onClickViewTrigger()
                  onClickPlusButton()
                }}
              />
            </HStack>
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <Button w="full" variant="ghost" onClick={onClickViewTrigger}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button flex={1} isLoading={props.isLoading} onClick={props.onClick} variant="outline">
      <Close width={10} height={10} color={colors.secondary} />
    </Button>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button flex={1} isLoading={props.isLoading} onClick={props.onClick} variant="outline">
      <MinusIcon color={colors.secondary} />
    </Button>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button flex={1} isLoading={props.isLoading} onClick={props.onClick}>
      <PlusIcon color={colors.backgroundDark} />
    </Button>
  )
}
