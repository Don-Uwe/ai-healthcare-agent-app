import { Box, Flex, Grid, GridItem, HStack, Link, Text, useDisclosure } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem, ApiV3PoolInfoItem, ApiV3PoolInfoStandardItem } from '@raydium-io/raydium-sdk-v2'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Steps, { StepsRef } from '@/components/Steps'
import SubPageNote from '@/components/SubPageNote'
import { CreateFarmType, LiquidityFarmActionModeType } from '@/features/Liquidity/utils'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useCreatedFarmInfo from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'
import { useAppStore, useClmmStore, useFarmStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { WEEK_SECONDS } from '@/utils/date'
import { routeBack, setUrlQuery } from '@/utils/routeTools'
import { RAY_TOKEN_INFO } from '@/utils/token'
import { PublicKey } from '@solana/web3.js'
import Decimal from 'decimal.js'
import { useTranslation, Trans } from 'react-i18next'
import { TxErrorModal } from '../../../components/Modal/TxErrorModal'
import RewardAddItem from './components/AddRewards'
import ReviewDetail from './components/DetailReview'
import SelectPool from './components/SelectPool'
import { TxSuccessModal } from './components/TxSuccessModal'
import { NewRewardInfo } from './type'
import { useRouteQuery } from '@/utils/routeTools'

type QueryDetail = {
  step?: LiquidityFarmActionModeType
  ammId?: string
  poolType?: CreateFarmType
}

const MODE_TO_STEP = {
  select: 0,
  reward: 1,
  review: 2,
  done: 2
}

/**
 * manage all may change state in this component
 */
export default function CreateFarm() {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()

  // -------- step --------
  const query = useRouteQuery<QueryDetail>()
  const createStandardFarmAct = useFarmStore((s) => s.createFarmAct)
  const createClmmFarmAct = useClmmStore((s) => s.createFarm)
  const [farmId, setFarmId] = useState('')
  const [currentStep, setCurrentStep] = useState<LiquidityFarmActionModeType>(query.step ?? 'select')
  const currentStepIndex = useMemo(() => MODE_TO_STEP[currentStep], [currentStep])
  const stepsRef = useRef<StepsRef>(null)
  const defaultPoolRef = useRef<string | undefined>(query.ammId)
  const owner = useAppStore((s) => s.publicKey)

  // -------- step 1 --------
  const [selectedPoolType, setSelectedPoolType] = useState<CreateFarmType>('Concentrated')
  const [selectedPool, setSelectedPool] = useState<ApiV3PoolInfoItem | undefined>()

  // -------- step 2 --------
  const [rewardInfos, setRewardInfos] = useState<NewRewardInfo[]>([{ id: uuidv4(), token: RAY_TOKEN_INFO, isValid: false }])

  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  // -------- tx dialog --------
  const { isOpen: isSuccessModalOpen, onOpen: onOpenSuccessModal, onClose: onCloseSuccessModal } = useDisclosure()
  const { isOpen: isErrorModalOpen, onOpen: onOpenErrorModal, onClose: onCloseErrorModal } = useDisclosure()

  // data fetching
  const { data: poolList } = useCreatedFarmInfo({
    owner
  })
  const { formattedData } = useFetchPoolById({
    idList: [defaultPoolRef.current, ...poolList.clmm.map((c) => c.id)]
  })
  const defaultPool = formattedData?.find((p) => p.id === defaultPoolRef.current)
  const allCreatedPools = useMemo(
    () => formattedData?.filter((p) => p.id !== defaultPoolRef.current) || [],
    [formattedData]
  ) as ApiV3PoolInfoConcentratedItem[]
  const data = allCreatedPools.filter((p) => p.rewardDefaultInfos.length === 0)

  const handleCreateFarm = useEvent(() => {
    onSending()
    if (selectedPoolType === 'Standard') {
      return createStandardFarmAct({
        poolInfo: selectedPool as ApiV3PoolInfoStandardItem,
        rewardInfos: rewardInfos.map((r) => ({
          mint: new PublicKey(r.token!.address),
          perSecond: new Decimal(r.amount!)
            .mul(10 ** r.token!.decimals)
            .div(new Decimal(r.farmEnd!).sub(new Decimal(Math.max(r.farmStart!, Date.now()))).div(1000))
            .toFixed(0, Decimal.ROUND_DOWN),
          openTime: Number(new Decimal(Math.max(r.farmStart!, Date.now())).div(1000).toFixed(0)),
          endTime: Number(new Decimal(r.farmEnd!).div(1000).toFixed(0)),
          rewardType: 'Standard SPL'
        })),
        onSent: (props) => {
          offSending()
          setFarmId(props?.farmId.toString() || '')
        },
        onConfirmed: () => {
          onOpenSuccessModal()
        },
        onError: () => {
          offSending()
          onOpenErrorModal()
        }
      })
    }

    createClmmFarmAct({
      poolInfo: selectedPool as ApiV3PoolInfoConcentratedItem,
      rewardInfos: rewardInfos.map((r) => ({
        mint: r.token!,
        perSecond: new Decimal(r.amount!)
          .mul(10 ** r.token!.decimals)
          .div(new Decimal(r.farmEnd!).sub(new Decimal(Math.max(r.farmStart!, Date.now()))).div(1000))
          .toDecimalPlaces(0, Decimal.ROUND_DOWN),
        openTime: Math.floor(new Decimal(Math.max(r.farmStart!, Date.now())).div(1000).toNumber()),
        endTime: Math.floor(new Decimal(r.farmEnd!).div(1000).toNumber())
      })),
      onSent: () => {
        offSending()
        setFarmId((selectedPool as ApiV3PoolInfoConcentratedItem).id)
      },
      onConfirmed: () => {
        onOpenSuccessModal()
      },
      onError: () => {
        onOpenErrorModal()
        offSending()
      }
    })
  })

  const createdPools = data.slice(0, 3)
  /** step method */
  const routeToStepReward = () => {
    setCurrentStep('reward')
    setUrlQuery<QueryDetail>({
      step: 'reward',
      ammId: selectedPool?.id,
      poolType: selectedPoolType
    })
  }

  /** step method */
  const routeToStepReview = () => {
    setCurrentStep('review')
    setUrlQuery<QueryDetail>({ step: 'review' })
  }
  const routeToStepSelect = () => {
    setCurrentStep('select')
    setUrlQuery<QueryDetail>({ step: 'select' })
  }

  const onRewardInfoChange = (rewardInfo: Partial<NewRewardInfo>, index: number) => {
    setRewardInfos((prev) => {
      const newRewardInfos = [...prev]
      newRewardInfos[index] = { ...newRewardInfos[index], ...rewardInfo }
      return newRewardInfos
    })
  }
  const addANewRewardInfo = () => {
    setRewardInfos((prev) => {
      const newRewardInfos = [...prev]
      newRewardInfos.push({ id: uuidv4(), isValid: false })
      return newRewardInfos
    })
  }
  const deleteAnExistReward = (index: number) => {
    setRewardInfos((prev) => {
      const newRewardInfos = [...prev]
      newRewardInfos.splice(index, 1)
      return newRewardInfos
    })
  }

  // step guard, prevent user to manually change step by url
  useEffect(() => {
    const { step: mode, ammId } = query
    let activeMode = mode && ammId ? mode : 'select'
    const isRewardValid = !rewardInfos.some((r) => !r.isValid)
    if (activeMode === 'review' && (!rewardInfos.length || !isRewardValid)) activeMode = 'reward'
    setCurrentStep(activeMode)
    stepsRef.current?.setActiveStep(MODE_TO_STEP[activeMode] || 0)
  }, [query, rewardInfos.length])

  useEffect(() => {
    if (defaultPool) {
      setSelectedPool(defaultPool)
      setSelectedPoolType(defaultPool.type)
    }
  }, [defaultPool?.id])

  if (currentStep === 'done') return <div>{t('create_farm.done')}</div>

  return (
    <Grid
      gridTemplate={[
        `
          "back  " auto
          "step  " auto
          "panel " auto
          ".     " minmax(80px, 1fr) / 1fr 
        `,
        `
          "back word " auto
          "step panel" auto
          "note panel" 1fr / ${genCSS2GridTemplateColumns({
            rightLeft: 344,
            center: currentStep === 'select' ? 520 : currentStep === 'reward' ? 598 : 735
          })}
        `,
        `
          "back word  ." auto
          "step panel ." auto
          "note panel ." 1fr / ${genCSS3GridTemplateColumns({
            rightLeft: 344,
            center: currentStep === 'select' ? 520 : currentStep === 'reward' ? 598 : 735
          })}
        `
      ]}
      columnGap={[
        0,
        currentStep === 'select'
          ? 'clamp(120px / 5, 8.33vw, 120px * 3)' // 8.33vw = calc(120px / 1440px * 100vw)
          : currentStep === 'reward'
          ? 'clamp(92px / 5, 6.39vw, 92px * 3)' // 6.39vw = calc(92px / 1440px * 100vw)
          : 'clamp(56px / 5, 3.89vw, 56px * 3)' // 3.89vw = calc(56px / 1440px * 100vw)
      ]}
      rowGap={[4, 4]}
      mt={[2, 8]}
    >
      <GridItem area="back">
        <HStack
          cursor="pointer"
          onClick={() => {
            routeBack()
          }}
          color={colors.textTertiary}
          fontWeight="500"
          fontSize={['md', 'xl']}
        >
          <ChevronLeftIcon />
          <Text>{t('common.back')}</Text>
        </HStack>
      </GridItem>

      <GridItem area="step">
        <Steps
          currentIndex={currentStepIndex}
          variant={isMobile ? 'row-title' : 'column-list'}
          steps={[
            { title: t('create_farm.step_1'), description: t('create_farm.step_1_name') },
            { title: t('create_farm.step_2'), description: t('create_farm.step_2_name') },
            { title: t('create_farm.step_3'), description: t('create_farm.step_3_name') }
          ]}
          onChange={(idx) => {
            if (idx === 0 && idx !== currentStepIndex) routeToStepSelect()
            if (idx === 1 && idx !== currentStepIndex) routeToStepReward()
            if (idx === 2 && idx !== currentStepIndex) routeToStepReview()
          }}
          ref={stepsRef}
        />
      </GridItem>

      <GridItem area="note">
        <Box
          position={['absolute', 'unset']}
          left={'20px'}
          right={'20px'}
          bottom={'calc(20px + 54px)' /* 54px is mobile bottom nav's height */}
          zIndex={100}
        >
          <SubPageNote
            canInteract={isMobile}
            title={t('create_farm.please_note')}
            description={
              <Text fontSize="sm" color={colors.textTertiary}>
                <Trans i18nKey="create_farm.note_des">
                  <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
                    CLMM
                  </Link>
                  <Link
                    href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool/creating-an-ecosystem-farm"
                    isExternal
                  >
                    Standard
                  </Link>
                </Trans>
              </Text>
            }
          />
        </Box>
      </GridItem>

      <GridItem area="word" display={['none', 'unset']}>
        {/* main header */}
        {currentStep === 'select' ? (
          <Box>
            <Text w="fit-content" color={colors.textSecondary} fontWeight="500" fontSize="xl">
              {t('create_farm.step_1_sentence')}
            </Text>
          </Box>
        ) : currentStep === 'reward' ? (
          <Flex justify={'space-between'} w="full" align="center">
            <Text w="fit-content" color={colors.textSecondary} fontWeight="500" fontSize="xl">
              {t('create_farm.step_2_sentence')}
            </Text>
            <HStack
              align="center"
              onClick={addANewRewardInfo}
              color={colors.secondary}
              sx={
                (selectedPoolType == 'Concentrated' && rewardInfos.length >= 2) ||
                (selectedPoolType == 'Standard' && rewardInfos.length >= 5)
                  ? { opacity: 0.5, pointerEvents: 'none' }
                  : { cursor: 'pointer' }
              }
            >
              <PlusCircleIcon width="14px" height="14px" />
              <Text fontSize="16px" fontWeight="500">
                {t('create_farm.add_another_button_text')}
              </Text>
            </HStack>
          </Flex>
        ) : (
          <Box>
            <Text w="fit-content" color={colors.textSecondary} fontWeight="500" fontSize="xl">
              {t('create_farm.step_3_name')}
            </Text>
          </Box>
        )}
      </GridItem>

      <GridItem area="panel">
        <Box flexShrink={0} mr={currentStep === 'review' ? 4 : 0}>
          {currentStep === 'select' ? (
            <SelectPool
              selectedPoolType={selectedPoolType}
              onSelectPoolType={setSelectedPoolType}
              selectedPool={selectedPool?.type === selectedPoolType ? selectedPool : undefined}
              onSelectPool={setSelectedPool}
              createdClmmPools={createdPools}
              onClickContinue={() => {
                stepsRef.current?.goToNext()
                routeToStepReward()
              }}
            />
          ) : currentStep === 'reward' ? (
            <RewardAddItem
              maxRewardCount={selectedPoolType === 'Concentrated' ? 2 : 5}
              rewardInfos={rewardInfos}
              onRewardInfoChange={onRewardInfoChange}
              onAddAnotherReward={addANewRewardInfo}
              onDeleteReward={deleteAnExistReward}
              onClickBackButton={() => {
                stepsRef.current?.goToPrevious()
                routeToStepSelect()
              }}
              onClickNextStepButton={() => {
                stepsRef.current?.goToNext()
                routeToStepReview()
              }}
            />
          ) : (
            <>
              <ReviewDetail
                rewardInfos={rewardInfos}
                poolInfo={selectedPool}
                isSending={isSending}
                onClickBackButton={() => {
                  stepsRef.current?.goToPrevious()
                  routeToStepReward()
                }}
                onClickCreateFarmButton={handleCreateFarm}
                onJumpToStepSelect={() => {
                  stepsRef.current?.goTo(0)
                  routeToStepSelect()
                }}
                onJumpToStepReward={() => {
                  stepsRef.current?.goTo(1)
                  routeToStepReward()
                }}
              />
              <TxSuccessModal farmId={farmId} isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal} />
              <TxErrorModal
                description="Failed to create farm. Please try again later."
                isOpen={isErrorModalOpen}
                onClose={onCloseErrorModal}
              />
            </>
          )}
        </Box>
      </GridItem>
    </Grid>
  )
}
