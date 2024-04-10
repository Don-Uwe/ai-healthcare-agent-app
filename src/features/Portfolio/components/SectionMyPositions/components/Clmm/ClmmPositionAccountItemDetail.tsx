import { Box, Button, Flex, HStack, Tooltip, useDisclosure } from '@chakra-ui/react'

import { AprKey, FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import ExpandUpIcon from '@/icons/misc/ExpandUpIcon'
import FullExpandIcon from '@/icons/misc/FullExpandIcon'
import Close from '@/icons/misc/Close'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import { colors } from '@/theme/cssVariables'
import toUsdVolume from '@/utils/numberish/toUsdVolume'
import { AprData } from '@/features/Clmm/utils/calApr'
import EstimatedApr from './ClmmPositionAccountItemDetail/EstimatedApr'
import PendingYield from './ClmmPositionAccountItemDetail/PendingYield'
import RangeChart from './ClmmPositionAccountItemDetail/RangeChart'
import { useEvent } from '@/hooks/useEvent'
import { useTranslation } from 'react-i18next'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

type DetailProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  timeBasis: AprKey
  onTimeBasisChange?: (val: AprKey) => void
  aprData: AprData
  position: ClmmPosition
  nftMint: string
  totalPendingYield: string
  baseIn: boolean
  hasReward: boolean
  rewardInfos: { mint: ApiV3Token; amount: string; amountUSD: string }[]
  onHarvest: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickCloseButton: (props: { onSend?: () => void; onFinally?: () => void }) => void
  onClickMinusButton: () => void
  onClickPlusButton: () => void
  onClickViewTrigger: () => void
}

export default function ClmmPositionAccountItemDetail({
  poolInfo,
  position,
  timeBasis,
  aprData,
  nftMint,
  totalPendingYield,
  baseIn,
  hasReward,
  rewardInfos,
  onTimeBasisChange,
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
    <Box>
      <Flex direction="column" gap={4}>
        <Flex gap={4}>
          <RangeChart flex={6} poolInfo={poolInfo} positionData={position} baseIn={baseIn} nftMint={nftMint} />
          <Flex direction="column" flex={3} gap={4} w="full">
            <EstimatedApr
              timeAprData={poolInfo.allApr}
              aprData={aprData}
              weeklyRewards={poolInfo.weeklyRewards}
              timeBasis={timeBasis}
              onTimeBasisChange={onTimeBasisChange}
            />
            <PendingYield
              isLoading={isLoading}
              hasReward={hasReward}
              rewardInfos={rewardInfos}
              onHarvest={handleHarvest}
              pendingYield={toUsdVolume(totalPendingYield)}
              rewardTokens={poolInfo.rewardDefaultInfos.map((r) => r.mint)}
            />
          </Flex>
        </Flex>
      </Flex>

      <Flex justifyContent="center" pt={3} pb={1}>
        <ActionButtons
          isLoading={isCloseLoading}
          onToggle={onClickViewTrigger}
          onClickPlus={onClickPlusButton}
          onClickMinus={onClickMinusButton}
          onClickCloseButton={handleClose}
          isClose={position.liquidity.isZero()}
        />
      </Flex>
    </Box>
  )
}

function ActionButtons(props: {
  onToggle: () => void
  onClickPlus: () => void
  onClickMinus: () => void
  onClickCloseButton: () => void
  isClose: boolean
  isLoading: boolean
}) {
  const { onToggle, onClickPlus, onClickMinus, onClickCloseButton, isLoading, isClose } = props
  return (
    <HStack>
      <ViewButton isOpen={true} onClick={onToggle}></ViewButton>
      {isClose ? (
        <CloseButton isLoading={isLoading} onClick={onClickCloseButton} />
      ) : (
        <MinusButton isLoading={false} onClick={onClickMinus}></MinusButton>
      )}
      <PlusButton isLoading={false} onClick={onClickPlus}></PlusButton>
    </HStack>
  )
}

function ViewButton(props: { isOpen: boolean; onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <Button
      leftIcon={props.isOpen ? undefined : <FullExpandIcon />}
      rightIcon={props.isOpen ? <ExpandUpIcon /> : undefined}
      variant="ghost"
      size="sm"
      onClick={props.onClick}
    >
      {props.isOpen ? t('portfolio.section_positions_clmm_account_view_less') : t('portfolio.section_positions_clmm_account_view_more')}
    </Button>
  )
}

function MinusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button onClick={props.onClick} variant="outline" size="xs" width={9} h="26px" px={0}>
      <MinusIcon color={colors.secondary} />
    </Button>
  )
}

function CloseButton(props: { onClick: () => void; isLoading: boolean }) {
  const { t } = useTranslation()
  return (
    <Tooltip label={t('clmm.close_position')}>
      <Button onClick={props.onClick} isLoading={props.isLoading} variant="outline" size="xs" width={9} h="26px" px={0}>
        <Close width={10} height={10} color={colors.secondary} />
      </Button>
    </Tooltip>
  )
}

function PlusButton(props: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button onClick={props.onClick} isLoading={props.isLoading} size="xs" w={9} h="26px" px={0}>
      <PlusIcon color={colors.backgroundDark} />
    </Button>
  )
}
